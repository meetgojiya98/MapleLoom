# Advanced async crawler with robots, sitemaps, incremental state (sqlite),
# per-host politeness, domain/path filters, and optional auto-ingest.
import asyncio, re, os, sys, json, time, hashlib, sqlite3, argparse, urllib.parse
from dataclasses import dataclass, field
from typing import List, Optional, Dict, Tuple, Set
from datetime import datetime, timezone

import httpx
import tldextract
from bs4 import BeautifulSoup
from readability import Document
from urllib.robotparser import RobotFileParser
import yaml

UA = "MapleLoomCrawler/1.0 (+https://local)"
TEXT_HTML = "text/html"
APP_PDF = "application/pdf"

def now_utc_iso(): return datetime.now(timezone.utc).isoformat()

def etldp1(url: str) -> str:
    host = urllib.parse.urlsplit(url).netloc
    ext = tldextract.extract(host)
    return f"{ext.domain}.{ext.suffix}".strip(".")

def norm_url(url: str) -> str:
    p = urllib.parse.urlsplit(url); p = p._replace(fragment="")
    netloc = p.netloc.lower()
    if (p.scheme, netloc.endswith(":80")) == ("http", True):  netloc = netloc[:-3]
    if (p.scheme, netloc.endswith(":443")) == ("https", True): netloc = netloc[:-4]
    return urllib.parse.urlunsplit((p.scheme, netloc, p.path or "/", p.query, ""))

def sha1(b: bytes) -> str: return hashlib.sha1(b).hexdigest()
def slugify(text: str, maxlen: int=80) -> str:
    s = re.sub(r"\s+", "-", text.strip().lower()); s = re.sub(r"[^a-z0-9\-]+", "", s); return s[:maxlen] or hashlib.md5(text.encode()).hexdigest()[:12]
def parse_interval(s: str) -> float:
    m = re.fullmatch(r"(\d+)([smhd])", s.strip()); 
    if not m: raise ValueError("Invalid interval, use 10m, 6h, 1d")
    n=int(m.group(1)); u=m.group(2); return n if u=="s" else n*60 if u=="m" else n*3600 if u=="h" else n*86400

@dataclass
class Profile:
    seeds: List[str]
    domain_whitelist: List[str] = field(default_factory=list)
    allow_paths: List[str] = field(default_factory=list)
    deny_paths: List[str] = field(default_factory=list)
    same_origin: bool = True
    sitemap: bool = True
    max_depth: int = 2
    max_pages: int = 400
    concurrency: int = 8
    delay: float = 0.6
    min_text_chars: int = 200
    out_dir: str = "/workspace/data/crawl"
    headers: Dict[str,str] = field(default_factory=dict)
    @staticmethod
    def from_yaml(path: str) -> "Profile":
        with open(path,"r",encoding="utf-8") as f: return Profile(**yaml.safe_load(f))

class State:
    def __init__(self, db_path: str):
        self.db_path = db_path; os.makedirs(os.path.dirname(db_path), exist_ok=True); self._init()
    def _init(self):
        with sqlite3.connect(self.db_path) as db:
            db.execute("""CREATE TABLE IF NOT EXISTS pages(
                url TEXT PRIMARY KEY, etldp1 TEXT, norm_url TEXT, status INTEGER, mime TEXT,
                etag TEXT, last_modified TEXT, last_fetch REAL, last_success REAL,
                content_hash TEXT, title TEXT, out_path TEXT, error TEXT)""")
            db.execute("CREATE INDEX IF NOT EXISTS ix_pages_etldp1 ON pages(etldp1)")
    def upsert(self, **kw):
        keys=",".join(kw); qmarks=",".join(["?"]*len(kw)); updates=",".join([f"{k}=excluded.{k}" for k in kw])
        with sqlite3.connect(self.db_path) as db:
            db.execute(f"INSERT INTO pages({keys}) VALUES({qmarks}) ON CONFLICT(url) DO UPDATE SET {updates}", tuple(kw.values()))
    def seen(self, url: str) -> bool:
        with sqlite3.connect(self.db_path) as db:
            return db.execute("SELECT 1 FROM pages WHERE url=? LIMIT 1", (url,)).fetchone() is not None

class RobotsCache:
    def __init__(self, client: httpx.AsyncClient, ua: str): self.client=client; self.ua=ua; self.cache={}
    async def allowed(self, url: str) -> bool:
        p=urllib.parse.urlsplit(url); origin=f"{p.scheme}://{p.netloc}"
        if origin not in self.cache:
            rp=RobotFileParser(); robots=f"{origin}/robots.txt"
            try: r=await self.client.get(robots, timeout=10); rp.parse(r.text.splitlines() if r.status_code<400 else [])
            except Exception: rp.parse([])
            self.cache[origin]=rp
        return self.cache[origin].can_fetch(self.ua, url)
    async def sitemaps(self, url: str):
        p=urllib.parse.urlsplit(url); origin=f"{p.scheme}://{p.netloc}"; robots=f"{origin}/robots.txt"
        try:
            r=await self.client.get(robots, timeout=10)
            if r.status_code>=400: return []
            return [line.split(":",1)[1].strip() for line in r.text.splitlines() if line.lower().startswith("sitemap:")]
        except Exception: return []

def path_allowed(url: str, allow: List[str], deny: List[str]) -> bool:
    path = urllib.parse.urlsplit(url).path or "/"
    if deny and any(re.search(p, path) for p in deny): return False
    if allow and not any(re.search(p, path) for p in allow): return False
    return True

def extract_links_and_title(base_url: str, html: str):
    soup = BeautifulSoup(html, "lxml")
    links = [urllib.parse.urljoin(base_url, a.get("href")) for a in soup.find_all("a", href=True)]
    title = (soup.title.get_text(strip=True) if soup.title else base_url)
    canon = soup.find("link", rel=lambda v: v and "canonical" in v)
    if canon and canon.get("href"): base_url = urllib.parse.urljoin(base_url, canon.get("href"))
    return list(set(links)), title

def extract_text_readability(url: str, html: str):
    try:
        doc=Document(html); title=doc.short_title() or url; main_html=doc.summary(html_partial=True)
        soup=BeautifulSoup(main_html,"lxml")
    except Exception:
        soup=BeautifulSoup(html,"lxml"); title=(soup.title.get_text(strip=True) if soup.title else url)
    for tag in soup(["script","style","noscript"]): tag.decompose()
    text=soup.get_text("\n", strip=True); return title, text

async def fetch(client: httpx.AsyncClient, url: str, etag=None, last_modified=None):
    headers={}; 
    if etag: headers["If-None-Match"]=etag
    if last_modified: headers["If-Modified-Since"]=last_modified
    try: return await client.get(url, headers=headers, follow_redirects=True, timeout=20)
    except Exception: return None

def write_markdown(out_dir: str, url: str, title: str, text: str) -> str:
    os.makedirs(out_dir, exist_ok=True); safe=slugify(title) or slugify(url); path=os.path.join(out_dir, f"{safe}.md")
    meta={"title": title, "source_url": url, "fetched_at": now_utc_iso()}
    body=f"---\n{json.dumps(meta, ensure_ascii=False, indent=2)}\n---\n\n# {title}\n\n{text}\n"
    with open(path,"w",encoding="utf-8") as f: f.write(body); return path

def write_pdf(out_dir: str, url: str, content: bytes) -> str:
    os.makedirs(out_dir, exist_ok=True); safe=slugify(url); path=os.path.join(out_dir, f"{safe}.pdf")
    with open(path,"wb") as f: f.write(content); return path

async def parse_sitemap(client: httpx.AsyncClient, sitemap_url: str):
    try:
        r=await client.get(sitemap_url, timeout=20)
        if r.status_code>=400 or "xml" not in r.headers.get("content-type",""): return []
        return [m.group(1).strip() for m in re.finditer(r"<loc>(.*?)</loc>", r.text, flags=re.I|re.S)]
    except Exception: return []

class CrawlRunner:
    def __init__(self, profile: Profile):
        self.p=profile
        self.state=State(os.path.join(self.p.out_dir, ".state.sqlite3"))
        self.sem=asyncio.Semaphore(self.p.concurrency)
        self.last_fetch={}; self.visited=set(); self.saved_count=0

    async def politeness(self, host: str):
        import time
        delay=self.p.delay; t=time.time(); last=self.last_fetch.get(host,0.0); wait=delay-(t-last)
        if wait>0: await asyncio.sleep(wait); self.last_fetch[host]=time.time()

    def allowed_domain(self, url: str, src: str) -> bool:
        host=urllib.parse.urlsplit(url).netloc.lower()
        wl=[d.lower() for d in (self.p.domain_whitelist or [])]
        if wl and not any(host == d or host.endswith("."+d) for d in wl): return False
        if self.p.same_origin and etldp1(url) != etldp1(src): return False
        return True

    async def expand_sitemaps(self, client, seeds):
        out=set()
        if not self.p.sitemap: return out
        robots=RobotsCache(client, UA)
        for s in seeds:
            for sm in await robots.sitemaps(s):
                for loc in await parse_sitemap(client, sm): out.add(norm_url(loc))
        return out

    async def crawl_once(self):
        import time
        headers={"User-Agent": UA, **(self.p.headers or {})}
        q: asyncio.Queue = asyncio.Queue()
        all_seeds=[norm_url(s) for s in self.p.seeds]
        async with httpx.AsyncClient(headers=headers) as client:
            for s in all_seeds: q.put_nowait((s,0,s))
            for u in await self.expand_sitemaps(client, all_seeds):
                if path_allowed(u, self.p.allow_paths, self.p.deny_paths): q.put_nowait((u,0,u))
            robots=RobotsCache(client, UA); stats={"enqueued": q.qsize(),"fetched":0,"saved_html":0,"saved_pdf":0,"skipped":0}
            async def worker():
                nonlocal stats
                while not q.empty() and (stats["fetched"] < self.p.max_pages):
                    url,depth,src=await q.get(); url=norm_url(url)
                    if url in self.visited: q.task_done(); continue
                    self.visited.add(url)
                    if not self.allowed_domain(url, src): stats["skipped"]+=1; q.task_done(); continue
                    if not path_allowed(url, self.p.allow_paths, self.p.deny_paths): stats["skipped"]+=1; q.task_done(); continue
                    if not await robots.allowed(url): stats["skipped"]+=1; q.task_done(); continue
                    host=urllib.parse.urlsplit(url).netloc; await self.politeness(host)
                    async with self.sem:
                        r=await fetch(client, url)
                    if r is None: self.state.upsert(url=url, etldp1=etldp1(url), norm_url=url, status=0, last_fetch=time.time(), error="fetch failed"); stats["skipped"]+=1; q.task_done(); continue
                    stats["fetched"]+=1
                    ctype=r.headers.get("content-type","").split(";")[0].strip().lower()
                    if ctype.startswith(TEXT_HTML):
                        links,_=extract_links_and_title(r.url.__str__(), r.text); title,text=extract_text_readability(r.url.__str__(), r.text)
                        if len(text)<self.p.min_text_chars: self.state.upsert(url=url, etldp1=etldp1(url), norm_url=r.url.__str__(), status=r.status_code, mime=ctype, last_fetch=time.time(), title=title, error="too-short"); stats["skipped"]+=1; q.task_done(); continue
                        out_dir=os.path.join(self.p.out_dir, etldp1(url)); out_path=write_markdown(out_dir, r.url.__str__(), title, text); self.saved_count+=1; stats["saved_html"]+=1
                        self.state.upsert(url=url, etldp1=etldp1(url), norm_url=r.url.__str__(), status=r.status_code, mime=ctype, last_fetch=time.time(), last_success=time.time(), content_hash=sha1(text.encode()), title=title, out_path=out_path, error=None)
                        if depth<self.p.max_depth:
                            for lk in links:
                                if lk.startswith(("mailto:","javascript:")): continue
                                q.put_nowait((norm_url(lk), depth+1, src))
                    elif ctype.startswith(APP_PDF):
                        out_dir=os.path.join(self.p.out_dir, etldp1(url)); out_path=write_pdf(out_dir, r.url.__str__(), r.content); self.saved_count+=1; stats["saved_pdf"]+=1
                        self.state.upsert(url=url, etldp1=etldp1(url), norm_url=r.url.__str__(), status=r.status_code, mime=ctype, last_fetch=time.time(), last_success=time.time(), content_hash=sha1(r.content), title=os.path.basename(out_path), out_path=out_path, error=None)
                    else:
                        self.state.upsert(url=url, etldp1=etldp1(url), norm_url=r.url.__str__(), status=r.status_code, mime=ctype, last_fetch=time.time(), error="mime-skip"); stats["skipped"]+=1
                    q.task_done()
            workers=[asyncio.create_task(worker()) for _ in range(self.p.concurrency)]
            await asyncio.gather(*workers)
        return {"stats": stats, "saved": self.saved_count}

def load_profile(path: str, override: Dict[str,str]):
    prof=Profile.from_yaml(path)
    for k,v in override.items():
        if v is None or not hasattr(prof,k): continue
        cur=getattr(prof,k)
        if isinstance(cur,bool): setattr(prof,k, v.lower() in ("1","true","yes","on"))
        elif isinstance(cur,int): setattr(prof,k, int(v))
        elif isinstance(cur,float): setattr(prof,k, float(v))
        elif isinstance(cur,list): setattr(prof,k, [x.strip() for x in v.split(",") if x.strip()])
        else: setattr(prof,k, v)
    return prof

def main():
    ap=argparse.ArgumentParser(description="Crawler -> markdown/pdf -> optional ingest")
    ap.add_argument("--config", required=True, help="YAML profile path")
    ap.add_argument("--out", default=None)
    ap.add_argument("--ingest", action="store_true")
    ap.add_argument("--loop", action="store_true")
    ap.add_argument("--interval", default="6h")
    ap.add_argument("--max-pages", type=int, default=None)
    ap.add_argument("--max-depth", type=int, default=None)
    ap.add_argument("--concurrency", type=int, default=None)
    args=ap.parse_args()

    overrides={}
    if args.out: overrides["out_dir"]=args.out
    if args.max_pages is not None: overrides["max_pages"]=str(args.max_pages)
    if args.max_depth is not None: overrides["max_depth"]=str(args.max_depth)
    if args.concurrency is not None: overrides["concurrency"]=str(args.concurrency)

    prof=load_profile(args.config, overrides)
    runner=CrawlRunner(prof)

    async def once():
        res=await runner.crawl_once()
        print(json.dumps(res, indent=2))
        if args.ingest:
            rc = os.system(f'python -m ingest --path "{prof.out_dir}"')
            if rc != 0:
                print("Ingest CLI not available (python -m ingest failed); skipping.")

    if not args.loop:
        asyncio.run(once()); return
    interval=parse_interval(args.interval)
    while True:
        asyncio.run(once())
        time.sleep(interval)

if __name__ == "__main__":
    main()
