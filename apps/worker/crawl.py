import os, sys, time, re, argparse, hashlib, json, urllib.parse, queue
from datetime import datetime, timezone
from typing import Set, Dict, Tuple, Optional, List
import httpx
from bs4 import BeautifulSoup
from readability import Document
import tldextract
from urllib.robotparser import RobotFileParser

# Reuse ingest after crawl if requested
try:
    from ingest import main as ingest_main
except Exception:
    ingest_main = None

DEFAULT_UA = "AdvancedRAGCrawler/1.0 (+https://local)"
TEXT_HTML = "text/html"
APP_PDF = "application/pdf"

def slugify(text: str, maxlen: int = 80) -> str:
    text = re.sub(r"\s+", "-", text.strip().lower())
    text = re.sub(r"[^a-z0-9\-]+", "", text)
    return text[:maxlen] or hashlib.md5(text.encode()).hexdigest()[:12]

def normalize_url(url: str) -> str:
    # Remove fragments; normalize scheme/host
    p = urllib.parse.urlsplit(url)
    p = p._replace(fragment="")
    # Normalize default ports and lowercase netloc
    netloc = p.netloc.lower()
    if netloc.endswith(":80") and p.scheme == "http":
        netloc = netloc[:-3]
    if netloc.endswith(":443") and p.scheme == "https":
        netloc = netloc[:-4]
    p = p._replace(netloc=netloc)
    return urllib.parse.urlunsplit(p)

def same_etldp1(a: str, b: str) -> bool:
    ea = tldextract.extract(urllib.parse.urlsplit(a).netloc)
    eb = tldextract.extract(urllib.parse.urlsplit(b).netloc)
    return (ea.domain, ea.suffix) == (eb.domain, eb.suffix)

class RobotsCache:
    def __init__(self, ua: str):
        self.ua = ua
        self.cache: Dict[str, RobotFileParser] = {}

    def allowed(self, url: str) -> bool:
        base = urllib.parse.urlsplit(url)
        origin = f"{base.scheme}://{base.netloc}"
        robots_url = f"{origin}/robots.txt"
        if origin not in self.cache:
            rp = RobotFileParser()
            try:
                with httpx.Client(timeout=10.0, headers={"User-Agent": self.ua}) as c:
                    r = c.get(robots_url)
                    if r.status_code >= 400:
                        rp.parse("")  # treat as no robots
                    else:
                        rp.parse(r.text.splitlines())
            except Exception:
                rp.parse("")
            self.cache[origin] = rp
        return self.cache[origin].can_fetch(self.ua, url)

def extract_links(url: str, html: str) -> Tuple[str, List[str], str]:
    soup = BeautifulSoup(html, "lxml")
    title_tag = soup.find("title")
    title = title_tag.get_text(strip=True) if title_tag else url
    # Prefer canonical if provided
    canon = soup.find("link", rel=lambda v: v and "canonical" in v)
    if canon and canon.get("href"):
        url = urllib.parse.urljoin(url, canon.get("href"))
    links = []
    for a in soup.find_all("a", href=True):
        href = urllib.parse.urljoin(url, a["href"])
        links.append(href)
    return url, links, title

def extract_text_readability(url: str, html: str) -> Tuple[str, str]:
    try:
        doc = Document(html)
        title = doc.short_title() or url
        content_html = doc.summary(html_partial=True)
        soup = BeautifulSoup(content_html, "lxml")
        # Strip scripts/styles
        for tag in soup(["script", "style", "noscript"]):
            tag.decompose()
        text = soup.get_text("\n", strip=True)
        # Some sites over-agg. Limit very long runs
        return title, text
    except Exception:
        soup = BeautifulSoup(html, "lxml")
        for tag in soup(["script", "style", "noscript"]):
            tag.decompose()
        title = (soup.title.get_text(strip=True) if soup.title else url)
        text = soup.get_text("\n", strip=True)
        return title, text

def is_allowed_mimetype(content_type: Optional[str]) -> bool:
    if not content_type:
        return False
    return any(content_type.startswith(t) for t in (TEXT_HTML, APP_PDF))

def fetch(client: httpx.Client, url: str) -> Optional[httpx.Response]:
    try:
        r = client.get(url, follow_redirects=True)
        if r.status_code >= 400:
            return None
        ctype = r.headers.get("content-type","").split(";")[0].strip().lower()
        if not is_allowed_mimetype(ctype):
            return None
        return r
    except Exception:
        return None

def write_markdown(out_dir: str, url: str, title: str, text: str) -> str:
    ts = datetime.now(timezone.utc).isoformat()
    base = slugify(title) or slugify(url)
    path = os.path.join(out_dir, f"{base}.md")
    front = {
        "title": title,
        "source_url": url,
        "fetched_at": ts,
    }
    body = f"---\n{json.dumps(front, ensure_ascii=False, indent=2)}\n---\n\n# {title}\n\n{text}\n"
    with open(path, "w", encoding="utf-8") as f:
        f.write(body)
    return path

def write_pdf(out_dir: str, url: str, content: bytes) -> str:
    base = slugify(url)
    path = os.path.join(out_dir, f"{base}.pdf")
    with open(path, "wb") as f:
        f.write(content)
    return path

def crawl(seeds: List[str], out_dir: str, max_pages: int = 200, max_depth: int = 3,
          domain_whitelist: Optional[Set[str]] = None, same_origin_only: bool = False,
          delay: float = 1.0, respect_robots: bool = True, ua: str = DEFAULT_UA) -> Dict[str, int]:
    os.makedirs(out_dir, exist_ok=True)
    visited: Set[str] = set()
    enqueued: Set[str] = set()
    q: "queue.Queue[Tuple[str,int,str]]" = queue.Queue()
    robots = RobotsCache(ua)
    last_fetch: Dict[str, float] = {}

    # Normalized seeds
    for s in seeds:
        u = normalize_url(s)
        q.put((u, 0, s))
        enqueued.add(u)

    stats = {"fetched": 0, "saved_html": 0, "saved_pdf": 0, "skipped": 0, "enqueued": q.qsize()}

    headers = {"User-Agent": ua, "Accept": "text/html,application/pdf;q=0.9,*/*;q=0.8"}
    with httpx.Client(timeout=15.0, headers=headers) as client:
        while not q.empty() and stats["fetched"] < max_pages:
            url, depth, src = q.get()
            if url in visited:
                continue
            visited.add(url)

            if respect_robots and not robots.allowed(url):
                stats["skipped"] += 1
                continue

            # Domain policy
            if domain_whitelist:
                host = urllib.parse.urlsplit(url).netloc.lower()
                if not any(host == d or host.endswith("." + d) for d in domain_whitelist):
                    stats["skipped"] += 1
                    continue

            if same_origin_only:
                if not same_etldp1(url, src):
                    stats["skipped"] += 1
                    continue

            # Rate limit per host
            host = urllib.parse.urlsplit(url).netloc
            now = time.time()
            if host in last_fetch and (now - last_fetch[host]) < delay:
                time.sleep(delay - (now - last_fetch[host]))
            last_fetch[host] = time.time()

            r = fetch(client, url)
            if r is None:
                stats["skipped"] += 1
                continue

            stats["fetched"] += 1
            ctype = r.headers.get("content-type","").split(";")[0].strip().lower()

            if ctype.startswith(TEXT_HTML):
                # Extract links + text
                norm_url, links, _ = extract_links(url, r.text)
                title, text = extract_text_readability(norm_url, r.text)
                write_markdown(out_dir, norm_url, title, text)
                stats["saved_html"] += 1

                # Enqueue children
                if depth < max_depth:
                    for link in links:
                        if link.startswith("mailto:") or link.startswith("javascript:"):
                            continue
                        norm = normalize_url(link)
                        if norm not in visited and norm not in enqueued:
                            # Domain policy on enqueue
                            if domain_whitelist:
                                h = urllib.parse.urlsplit(norm).netloc.lower()
                                if not any(h == d or h.endswith("." + d) for d in domain_whitelist):
                                    continue
                            q.put((norm, depth+1, src))
                            enqueued.add(norm)
            elif ctype.startswith(APP_PDF):
                write_pdf(out_dir, url, r.content)
                stats["saved_pdf"] += 1
            else:
                stats["skipped"] += 1

    stats["visited"] = len(visited)
    stats["queued_total"] = len(enqueued)
    return stats

def main():
    ap = argparse.ArgumentParser(description="Simple focused crawler -> markdown/pdf for RAG ingestion")
    ap.add_argument("--seeds", nargs="+", required=True, help="Seed URLs to start from")
    ap.add_argument("--out", type=str, default="/workspace/data/crawl", help="Output dir (mounted data path)")
    ap.add_argument("--max-pages", type=int, default=200)
    ap.add_argument("--max-depth", type=int, default=2)
    ap.add_argument("--domain-whitelist", type=str, default="", help="Comma-separated ETLD+1 domains, e.g. example.com,sub.example.org")
    ap.add_argument("--same-origin", action="store_true", help="Restrict links to the same eTLD+1 as each seed")
    ap.add_argument("--delay", type=float, default=1.0, help="Per-host fetch delay (seconds)")
    ap.add_argument("--no-robots", action="store_true", help="Ignore robots.txt (not recommended)")
    ap.add_argument("--ingest", action="store_true", help="Run ingestion after crawling")
    args = ap.parse_args()

    whitelist = set([d.strip().lower() for d in args.domain_whitelist.split(",") if d.strip()]) or None
    stats = crawl(
        seeds=args.seeds,
        out_dir=args.out,
        max_pages=args.max_pages,
        max_depth=args.max_depth,
        domain_whitelist=whitelist,
        same_origin_only=args.same_origin,
        delay=args.delay,
        respect_robots=(not args.no_robots)
    )
    print(json.dumps({"stats": stats}, indent=2))

    if args.ingest:
        if ingest_main is None:
            print("Ingest not available as import; please run: python -m ingest --path", args.out)
        else:
            ingest_main(args.out)

if __name__ == "__main__":
    main()
