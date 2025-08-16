import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Cpu,
  UploadCloud,
  Settings2,
  Trash2,
  RefreshCcw,
  Rocket,
  Circle,
  SendHorizonal,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { queryRag, refreshIndex, systemStatus } from "./api";
import "./index.css";

/* ---------------- utils ---------------- */
const cn = (...a) => a.filter(Boolean).join(" ");
const useLocal = (key, initial) => {
  const [val, setVal] = useState(() => {
    try {
      const s = localStorage.getItem(key);
      return s ? JSON.parse(s) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch {}
  }, [key, val]);
  return [val, setVal];
};
const useCursorGlow = () => {
  useEffect(() => {
    const el = document.documentElement;
    const onMove = (e) => {
      el.style.setProperty("--x", `${e.clientX}px`);
      el.style.setProperty("--y", `${e.clientY}px`);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, []);
};

/* ---------------- header ---------------- */
function NavBar({ status, onOpenUpload, onOpenSettings, fastMode, setFastMode, onRefresh }) {
  return (
    <div className="sticky top-0 z-20">
      <div className="container pt-6">
        <div className="card px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-400/90 via-sky-400/90 to-fuchsia-400/90 shadow-glow">
              <div className="absolute inset-0 rounded-xl bg-white/10" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[17px] font-semibold tracking-wide">MapleLoom</span>
                <Sparkles size={16} className="text-sky-300" />
              </div>
              <div className="text-[12px] text-zinc-400">Private RAG · Ollama · Qdrant</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className={cn("badge pulse", status?.ok ? "text-emerald-300" : "text-amber-300")}>
              <Circle size={10} className={cn(status?.ok ? "text-emerald-400" : "text-amber-400")} />
              {status?.ok ? "Online" : "Degraded"}
            </span>
            <button className="btn-ghost" onClick={onRefresh}>
              <RefreshCcw size={16} /> Refresh
            </button>
            <button className="btn-ghost" onClick={onOpenUpload}>
              <UploadCloud size={16} /> Docs
            </button>
            <div className="flex items-center gap-2 ml-2">
              <span className="text-xs text-zinc-400 hidden md:block">Fast</span>
              <button
                onClick={() => setFastMode((v) => !v)}
                className={cn(
                  "relative inline-flex h-8 w-14 items-center rounded-full transition",
                  fastMode ? "bg-indigo-500/80" : "bg-white/10"
                )}
                title="Toggle fast mode"
              >
                <span
                  className={cn(
                    "inline-block h-6 w-6 transform rounded-full bg-white shadow transition",
                    fastMode ? "translate-x-7" : "translate-x-1"
                  )}
                />
              </button>
            </div>
            <button className="btn btn-primary shimmer" onClick={onOpenSettings}>
              <Settings2 size={16} /> Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------- chat message ---------------- */
function ChatMessage({ role, content, sources }) {
  const isUser = role === "user";
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "bubble",
        isUser ? "bubble-user ml-auto max-w-[80%]" : "bubble-assistant mr-auto max-w-[90%]"
      )}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={cn("h-6 w-6 rounded-lg flex items-center justify-center", isUser ? "bg-white/20" : "bg-white/10")}>
          {isUser ? <Rocket size={14} /> : <Cpu size={14} />}
        </div>
        <div className="text-xs uppercase tracking-wide text-zinc-400">
          {isUser ? "You" : "Assistant"}
        </div>
      </div>

      {isUser ? (
        <div className="text-[15.5px] leading-7">{content}</div>
      ) : (
        <div className="markdown">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          {!!sources?.length && (
            <div className="mt-4">
              <div className="text-xs text-zinc-400 mb-2">References</div>
              <div className="grid sm:grid-cols-2 gap-2">
                {sources.map((s, i) => (
                  <a
                    key={`${s.id}-${i}`}
                    href={s.uri || "#"}
                    target="_blank"
                    rel="noreferrer"
                    className="group block rounded-2xl border border-white/10 bg-white/5 p-3 hover:bg-white/10 transition"
                    title={s.title || s.uri || "Source"}
                  >
                    <div className="text-[12px] text-zinc-400 mb-1">
                      [{i + 1}] {s.title || s.uri || "Source"}
                    </div>
                    <div className="line-clamp-2 text-[13px] text-zinc-200/90">
                      {(s.chunk || "").slice(0, 240)}
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

/* ---------------- composer ---------------- */
function Composer({ onSubmit, loading }) {
  const [value, setValue] = useState("");
  const ref = useRef(null);

  const submit = () => {
    const q = value.trim();
    if (!q) return;
    onSubmit(q);
    setValue("");
    ref.current?.focus();
  };

  return (
    <div className="card p-2.5">
      <div className="flex items-end gap-2">
        <textarea
          ref={ref}
          rows={1}
          placeholder="Ask anything about your docs…"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
            else if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              submit();
            }
          }}
          className="input w-full resize-none bg-transparent focus:ring-0 border-0 px-3 py-3 text-[15.5px]"
        />
        <button
          disabled={loading || !value.trim()}
          onClick={submit}
          className={cn("btn btn-primary px-4 py-3", loading && "opacity-60 cursor-not-allowed")}
        >
          <SendHorizonal size={16} />
          <span className="hidden sm:inline">Send</span>
          <span className="sm:hidden">Go</span>
        </button>
      </div>
      <div className="flex items-center justify-between px-2 py-1">
        <div className="text-[12px] text-zinc-400">
          <span className="kbd">Enter</span> to send · <span className="kbd">Shift</span> +{" "}
          <span className="kbd">Enter</span> for new line
        </div>
        <div className="text-[12px] text-zinc-400">Private • On your machine</div>
      </div>
    </div>
  );
}

/* ---------------- upload drawer ---------------- */
function UploadDrawer({ open, onClose }) {
  const [docs, setDocs] = useState([]);
  const [busy, setBusy] = useState(false);
  const [clearing, setClearing] = useState(false);

  const load = async () => {
    try {
      // Optional endpoint; if not present, we just show empty list
      const res = await fetch("/docs").then((r) => (r.ok ? r.json() : { items: [] })).catch(() => ({ items: [] }));
      setDocs(res.items || []);
    } catch {
      setDocs([]);
    }
  };
  useEffect(() => {
    if (open) load();
  }, [open]);

  const reindex = async (clear = false) => {
    setBusy(true);
    try {
      await refreshIndex({ clear });
      await load();
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this document from the index?")) return;
    setClearing(true);
    try {
      await fetch(`/docs/${encodeURIComponent(id)}`, { method: "DELETE" });
      await load();
    } finally {
      setClearing(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/70 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed right-0 top-0 bottom-0 w-full sm:w-[520px] z-50 card rounded-none sm:rounded-l-3xl p-6 overflow-y-auto scrollbar"
            initial={{ x: 520 }}
            animate={{ x: 0 }}
            exit={{ x: 520 }}
            transition={{ type: "spring", stiffness: 260, damping: 28 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-semibold">Documents</div>
              <button className="btn-ghost" onClick={onClose}>
                Close
              </button>
            </div>

            <div className="flex gap-2 mb-4">
              <button onClick={() => reindex(false)} className="btn">
                <RefreshCcw size={16} /> Re-index
              </button>
              <button
                onClick={() => reindex(true)}
                className="btn border-rose-500/30 text-rose-200 hover:bg-rose-500/10"
              >
                <Trash2 size={16} /> Clear All
              </button>
            </div>

            <div className="text-sm text-zinc-400 mb-4">
              Place files in{" "}
              <code className="px-1.5 py-0.5 bg-white/10 rounded">/workspace/data/crawl</code> and click{" "}
              <strong>Re-index</strong>.
            </div>

            <div className="hr my-4" />

            <div className="grid gap-2">
              {(docs || []).length === 0 && (
                <div className="text-zinc-400 text-sm">
                  No document listing endpoint configured. You can still re-index or clear the store.
                </div>
              )}
              {(docs || []).map((d) => (
                <div key={d.id} className="glass rounded-2xl p-3 flex items-center justify-between">
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{d.title || d.uri || d.path || d.id}</div>
                    <div className="text-xs text-zinc-400 truncate">{d.uri || d.path || "—"}</div>
                  </div>
                  <button
                    className="btn-ghost text-rose-200 hover:text-rose-100"
                    disabled={clearing}
                    onClick={() => onDelete(d.id)}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>

            {(busy || clearing) && <div className="mt-6 text-center text-sm text-zinc-400">Working…</div>}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ---------------- settings sheet ---------------- */
function SettingsSheet({ open, onClose, fastMode, setFastMode }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/70 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed left-1/2 top-1/2 z-50 w-[95vw] max-w-xl -translate-x-1/2 -translate-y-1/2 card p-6"
            initial={{ scale: 0.95, opacity: 0, y: 10 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 10 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-semibold">Settings</div>
              <button className="btn-ghost" onClick={onClose}>
                Close
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Fast Mode</div>
                  <div className="text-sm text-zinc-400">
                    Lower top-k / disable reranker for snappier responses.
                  </div>
                </div>
                <button
                  onClick={() => setFastMode((v) => !v)}
                  className={cn(
                    "relative inline-flex h-8 w-14 items-center rounded-full transition",
                    fastMode ? "bg-indigo-500/80" : "bg-white/10"
                  )}
                >
                  <span
                    className={cn(
                      "inline-block h-6 w-6 transform rounded-full bg-white shadow transition",
                      fastMode ? "translate-x-7" : "translate-x-1"
                    )}
                  />
                </button>
              </div>

              <div className="hr" />

              <div className="text-sm text-zinc-400">
                All computation runs against your local Ollama + Qdrant stack. No third-party calls.
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ---------------- app ---------------- */
export default function App() {
  useCursorGlow();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ ok: true });
  const [openUpload, setOpenUpload] = useState(false);
  const [openSettings, setOpenSettings] = useState(false);
  const [fastMode, setFastMode] = useLocal("fastMode", true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const s = await systemStatus();
        if (alive) setStatus(s);
      } catch {
        if (alive) setStatus({ ok: false });
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // ✅ Updated: payload uses snake_case keys expected by the backend
  const ask = async (q) => {
    setMessages((m) => [...m, { role: "user", content: q }]);
    setLoading(true);
    try {
      const res = await queryRag({
        query: q,
        top_k: fastMode ? 4 : 8,
        prefer_speed: !!fastMode,
        rerank: !fastMode,
        trace: true,
      });
      setMessages((m) => [
        ...m,
        { role: "assistant", content: res.answer || "No answer.", sources: res.sources || [] },
      ]);
    } catch (e) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: `⚠️ ${e?.message || "Something went wrong."}` },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const onQuickAsk = (text) => ask(text);

  return (
    <>
      <div className="aurora" />
      <div className="cursor-glow" />

      <NavBar
        status={status}
        onOpenUpload={() => setOpenUpload(true)}
        onOpenSettings={() => setOpenSettings(true)}
        fastMode={fastMode}
        setFastMode={setFastMode}
        onRefresh={() => refreshIndex({ clear: false })}
      />

      {/* Hero */}
      <div className="container pt-10 md:pt-16">
        <div className="text-center max-w-3xl mx-auto">
          <motion.h1
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight"
          >
            Your Knowledge,
            <span className="block bg-gradient-to-r from-indigo-300 via-sky-300 to-fuchsia-300 bg-clip-text text-transparent">
              Answered Beautifully
            </span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="mt-4 text-zinc-300 text-base md:text-lg"
          >
            A precise, private RAG interface powered by Ollama, Qdrant and Meilisearch. Minimal latency mode, source-anchored answers, lovingly crafted UI.
          </motion.p>

          {/* Quick prompts */}
          <div className="mt-6 flex flex-wrap justify-center gap-2">
            {[
              "What is LangChain?",
              "How do I re-index the docs?",
              "Explain LangGraph in 2 lines",
              "List packages in the ecosystem",
            ].map((t) => (
              <button key={t} className="btn-ghost text-sm" onClick={() => onQuickAsk(t)}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chat Centered */}
      <div className="container mt-8 md:mt-12 pb-28 relative z-10">
        <div className="max-w-3xl mx-auto space-y-4">
          <AnimatePresence initial={false}>
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="card p-6 text-center"
              >
                <div className="text-zinc-300">
                  Ask a question to begin. Responses include inline references you can verify.
                </div>
              </motion.div>
            )}

            {messages.map((m, i) => (
              <ChatMessage key={i} role={m.role} content={m.content} sources={m.sources} />
            ))}

            {loading && (
              <motion.div
                layout
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bubble bubble-assistant mr-auto max-w-[90%]"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-6 rounded-lg bg-white/10 flex items-center justify-center">
                    <Cpu size={14} />
                  </div>
                  <div className="text-xs uppercase tracking-wide text-zinc-400">Assistant</div>
                </div>
                <div className="flex items-center gap-2 text-zinc-300">
                  <span className="animate-pulse">Thinking</span>
                  <span className="inline-flex -space-x-1">
                    <span className="h-1.5 w-1.5 bg-white/70 rounded-full animate-bounce [animation-delay:-0.2s]" />
                    <span className="h-1.5 w-1.5 bg-white/70 rounded-full animate-bounce [animation-delay:-0.05s]" />
                    <span className="h-1.5 w-1.5 bg-white/70 rounded-full animate-bounce" />
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <Composer onSubmit={ask} loading={loading} />
        </div>
      </div>

      <UploadDrawer open={openUpload} onClose={() => setOpenUpload(false)} />
      <SettingsSheet
        open={openSettings}
        onClose={() => setOpenSettings(false)}
        fastMode={fastMode}
        setFastMode={setFastMode}
      />
    </>
  );
}
