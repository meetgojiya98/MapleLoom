import { X } from 'lucide-react'
import { cn } from '../lib/utils'

export default function TraceDrawer({ open, onClose, trace }) {
  return (
    <div
      className={cn(
        'fixed inset-0 z-50 transition',
        open ? 'pointer-events-auto' : 'pointer-events-none'
      )}
    >
      <div
        className={cn(
          'absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity',
          open ? 'opacity-100' : 'opacity-0'
        )}
        onClick={onClose}
      />
      <aside
        className={cn(
          'absolute right-0 top-0 h-full w-full sm:w-[32rem] glass translate-x-full sm:rounded-l-3xl',
          'transition-transform duration-300',
          open ? 'translate-x-0' : ''
        )}
      >
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <h3 className="font-semibold">Trace</h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 border border-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4 overflow-auto h-[calc(100%-64px)]">
          <pre className="text-xs leading-relaxed whitespace-pre-wrap">
            {JSON.stringify(trace ?? {}, null, 2)}
          </pre>
        </div>
      </aside>
    </div>
  )
}
