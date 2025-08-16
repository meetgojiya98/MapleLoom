import { useEffect, useMemo, useRef, useState } from 'react'
import { ask } from '../lib/api'
import { cn } from '../lib/utils'
import { motion } from 'framer-motion'
import {
  Sparkles,
  Send,
  Settings2,
  Loader2,
  Trash2,
  BugPlay
} from 'lucide-react'
import MessageBubble from './MessageBubble'
import TraceDrawer from './TraceDrawer'

const DEFAULT_MSG = {
  role: 'assistant',
  content:
    "Hi! Ask me anything from your knowledge base.\n\nTip: toggle **Reranker** in advanced to improve precision."
}

export default function Chat() {
  const [messages, setMessages] = useState([DEFAULT_MSG])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [optsOpen, setOptsOpen] = useState(false)
  const [withTrace, setWithTrace] = useState(false)
  const [useReranker, setUseReranker] = useState(false)
  const [topK, setTopK] = useState(6)
  const [trace, setTrace] = useState(null)
  const [traceOpen, setTraceOpen] = useState(false)
  const listRef = useRef(null)

  const canSend = input.trim().length > 0 && !loading

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, loading])

  async function onSend(e) {
    e?.preventDefault?.()
    if (!canSend) return
    const q = input.trim()
    setInput('')
    setMessages((m) => [...m, { role: 'user', content: q }])
    setLoading(true)
    setTrace(null)

    try {
      const res = await ask(q, {
        top_k: topK,
        with_trace: withTrace,
        use_reranker: useReranker
      })
      setMessages((m) => [
        ...m,
        { role: 'assistant', content: res.answer, sources: res.sources || [] }
      ])
      if (withTrace) setTrace(res.trace || {})
    } catch (err) {
      setMessages((m) => [
        ...m,
        {
          role: 'assistant',
          content:
            'Sorry — something went wrong while querying the API.\n\n```\n' +
            String(err) +
            '\n```'
        }
      ])
    } finally {
      setLoading(false)
    }
  }

  function onClear() {
    setMessages([DEFAULT_MSG])
    setTrace(null)
  }

  const placeholder = useMemo(
    () =>
      'Ask a question…  (e.g. “How does our RAG pipeline work?” or “What is LangChain?”)',
    []
  )

  return (
    <section className="relative">
      {/* The grid overlay */}
      <div className="bg-grid" />

      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: 'easeOut' }}
        className={cn(
          'glass mx-auto max-w-3xl rounded-3xl',
          'border border-white/10'
        )}
      >
        {/* Header row */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-brand-500/20 border border-brand-400/40">
              <Sparkles className="w-5 h-5 text-brand-300" />
            </span>
            <div>
              <h2 className="font-semibold leading-tight">
                Chat with your Knowledge
              </h2>
              <p className="text-xs text-slate-400">
                Hybrid search • Qdrant • Meilisearch • Ollama
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setOptsOpen((v) => !v)}
              className="px-3 py-2 text-sm rounded-xl border border-white/10 hover:bg-white/5"
              title="Advanced options"
            >
              <Settings2 className="w-4 h-4 inline -mt-0.5 mr-1" />
              Advanced
            </button>
            <button
              onClick={onClear}
              className="px-3 py-2 text-sm rounded-xl border border-white/10 hover:bg-white/5"
              title="Clear chat"
            >
              <Trash2 className="w-4 h-4 inline -mt-0.5 mr-1" />
              Clear
            </button>
            <button
              onClick={() => setTraceOpen(true)}
              disabled={!trace}
              className="px-3 py-2 text-sm rounded-xl border border-white/10 hover:bg-white/5 disabled:opacity-40"
              title="Show trace"
            >
              <BugPlay className="w-4 h-4 inline -mt-0.5 mr-1" />
              Trace
            </button>
          </div>
        </div>

        {/* Advanced options */}
        {optsOpen && (
          <div className="px-5 sm:px-6 py-4 border-b border-white/10 grid sm:grid-cols-3 gap-4">
            <div className="col-span-1">
              <label className="block text-xs text-slate-400 mb-2">
                Top K: <span className="text-slate-200">{topK}</span>
              </label>
              <input
                type="range"
                min="3"
                max="12"
                value={topK}
                onChange={(e) => setTopK(parseInt(e.target.value))}
                className="w-full accent-brand-500"
              />
            </div>
            <label className="flex items-center gap-3 col-span-1">
              <input
                type="checkbox"
                checked={useReranker}
                onChange={(e) => setUseReranker(e.target.checked)}
              />
              <span className="text-sm">Use reranker</span>
            </label>
            <label className="flex items-center gap-3 col-span-1">
              <input
                type="checkbox"
                checked={withTrace}
                onChange={(e) => setWithTrace(e.target.checked)}
              />
              <span className="text-sm">Include trace</span>
            </label>
          </div>
        )}

        {/* Messages list */}
        <div
          ref={listRef}
          className="px-5 sm:px-6 py-6 h-[52vh] sm:h-[58vh] overflow-y-auto scroll-smooth"
        >
          <div className="space-y-4">
            {messages.map((m, i) => (
              <MessageBubble
                key={i}
                role={m.role}
                content={m.content}
                sources={m.sources}
              />
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="text-xs text-slate-400 flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Thinking…
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Composer */}
        <form onSubmit={onSend} className="px-5 sm:px-6 pb-5 sm:pb-6">
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={placeholder}
              className={cn(
                'flex-1 bg-white/5 border border-white/10 rounded-2xl',
                'px-4 py-3 text-[15px] placeholder:text-slate-400 outline-none',
                'focus:border-brand-500/50'
              )}
            />
            <button
              type="submit"
              disabled={!canSend}
              className={cn(
                'inline-flex items-center gap-2 rounded-2xl px-4 py-3 font-medium',
                'bg-brand-600 hover:bg-brand-500 border border-brand-400/60',
                'disabled:opacity-50'
              )}
            >
              <Send className="w-4 h-4" />
              Send
            </button>
          </div>
        </form>
      </motion.div>

      <TraceDrawer open={traceOpen} onClose={() => setTraceOpen(false)} trace={trace} />
    </section>
  )
}
