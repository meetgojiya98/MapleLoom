import React, { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Paperclip, Send, Bot, User, TriangleAlert } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import SourceDrawer from "./SourceDrawer";
import { ask } from "../lib/api";
import clsx from "clsx";

const HINTS = [
  "How does our RAG pipeline work?",
  "What is LangChain?",
  "What are the retrieval steps?",
];

export default function ChatCard({ options }) {
  const [messages, setMessages] = useState([
    {
      role: "system",
      content:
        "Hi! Ask me anything from your knowledge base.\n\nTip: toggle Reranker in Advanced to improve precision.",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [lastSources, setLastSources] = useState([]);
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, loading]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "/" && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if ((e.metaKey || e.ctrlKey) && e.key === "Enter") {
        e.preventDefault();
        handleSend();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [input, options]);

  function add(role, content) {
    setMessages((m) => [...m, { role, content }]);
  }

  async function handleSend(hint) {
    const q = (hint ?? input).trim();
    if (!q || loading) return;
    setError("");
    setInput("");
    add("user", q);
    setLoading(true);

    try {
      const res = await ask({
        query: q,
        top_k: Number(options.topK ?? 6),
        use_reranker: Boolean(options.useReranker),
        with_trace: Boolean(options.withTrace),
      });
      setLastSources(res.sources || []);
      add("assistant", res.answer || "No answer returned.");
    } catch (e) {
      setError(e?.message || "Failed to fetch");
      add(
        "assistant",
        "Sorry — something went wrong while querying the API."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="glass-card border border-white/10 rounded-2xl p-4 sm:p-6 shadow-2xl shadow-indigo-950/30">
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-2 text-zinc-300">
            <span className="inline-flex size-7 items-center justify-center rounded-lg bg-indigo-500/20 ring-1 ring-inset ring-indigo-400/30">
              <Bot className="size-4 text-indigo-300" />
            </span>
            <div className="text-sm sm:text-base font-medium">
              Chat with your Knowledge
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-zinc-400">
            <span className="hidden sm:inline">
              Hybrid search • Qdrant • Meilisearch • Ollama
            </span>
            <SourceDrawer sources={lastSources} />
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4 min-h-[240px]">
          <AnimatePresence initial={false}>
            {messages.map((m, i) => (
              <motion.div
                key={i}
                layout="position"
                initial={{ y: 8, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.18 }}
                className={clsx(
                  "message",
                  m.role === "user" ? "message-user" : "message-assistant"
                )}
              >
                <div className="flex gap-3">
                  <div
                    className={clsx(
                      "shrink-0 size-8 rounded-full grid place-items-center",
                      m.role === "user"
                        ? "bg-sky-500/20 text-sky-300"
                        : "bg-indigo-500/20 text-indigo-300"
                    )}
                  >
                    {m.role === "user" ? (
                      <User className="size-4" />
                    ) : (
                      <Bot className="size-4" />
                    )}
                  </div>
                  <div className="prose prose-zinc prose-sm sm:prose-base max-w-none leading-relaxed text-zinc-200/95">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {m.content}
                    </ReactMarkdown>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {loading && (
            <div className="message message-assistant">
              <div className="flex gap-3 items-center">
                <div className="shrink-0 size-8 rounded-full grid place-items-center bg-indigo-500/20 text-indigo-300">
                  <Bot className="size-4" />
                </div>
                <div className="typing-dots" />
              </div>
            </div>
          )}

          {error && (
            <div className="message message-error">
              <TriangleAlert className="size-4 shrink-0 mt-0.5" />
              <code className="text-red-300/90">{error}</code>
            </div>
          )}

          <div ref={endRef} />
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2">
          {HINTS.map((h) => (
            <button
              key={h}
              onClick={() => handleSend(h)}
              className="hint-btn"
            >
              {h}
            </button>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-2">
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder='Ask a question… (press "/" to focus)'
            className="flex-1 input"
          />
          <button
            className="btn btn-primary"
            disabled={loading}
            onClick={() => handleSend()}
          >
            <Send className="size-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    </>
  );
}
