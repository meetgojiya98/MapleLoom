import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '../lib/utils'
import { BookOpen, Link as LinkIcon } from 'lucide-react'

export default function MessageBubble({ role, content, sources }) {
  const isUser = role === 'user'
  return (
    <div className={cn('w-full flex', isUser ? 'justify-end' : 'justify-start')}>
      <div
        className={cn(
          'max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed',
          'border',
          isUser
            ? 'bg-brand-600/20 border-brand-400/30 text-slate-100'
            : 'bg-white/5 border-white/10 text-slate-100'
        )}
      >
        <div className="prose prose-invert prose-sm">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </div>

        {!!sources?.length && (
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1 text-xs text-slate-300/80">
              <BookOpen className="w-3.5 h-3.5" /> Sources
            </span>
            {sources.map((s, i) => (
              <a
                key={s.id + ':' + i}
                href={s.uri || '#'}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border border-white/10 bg-white/5 hover:bg-white/10"
                title={s.title || s.uri}
              >
                <LinkIcon className="w-3 h-3" />
                <span className="truncate max-w-[14rem]">
                  {s.title || s.uri || `source ${i + 1}`}
                </span>
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
