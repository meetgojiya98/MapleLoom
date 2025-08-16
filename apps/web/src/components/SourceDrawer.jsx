import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BookText, ChevronDown } from "lucide-react";

export default function SourceDrawer({ sources = [] }) {
  const [open, setOpen] = useState(false);
  const count = sources.length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 bg-white/5 hover:bg-white/10 text-zinc-300 transition border border-white/10"
        disabled={!count}
        title={count ? "Show sources" : "No sources yet"}
      >
        <BookText className="size-4 text-indigo-300" />
        <span className="hidden sm:inline">Sources</span>
        <span className="text-indigo-300">({count})</span>
        <ChevronDown
          className={`size-3 transition ${open ? "rotate-180" : ""}`}
        />
      </button>

      <AnimatePresence>
        {open && count > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            className="absolute right-0 mt-2 w-[28rem] max-w-[88vw] rounded-xl border border-white/10 bg-zinc-900/90 backdrop-blur-xl shadow-2xl z-20"
          >
            <div className="p-3 max-h-[50vh] overflow-auto divide-y divide-white/10">
              {sources.map((s, i) => (
                <div key={i} className="p-3 hover:bg-white/5 rounded-lg">
                  <div className="text-xs text-zinc-400 mb-1">[{i + 1}]</div>
                  <div className="text-sm text-zinc-200 font-medium">
                    {s.title || s.uri || s.id}
                  </div>
                  {s.uri && (
                    <a
                      className="text-xs text-indigo-300 hover:text-indigo-200"
                      href={s.uri.startsWith("http") ? s.uri : undefined}
                      target="_blank"
                      rel="noreferrer"
                    >
                      {s.uri.startsWith("http") ? "Open" : ""}
                    </a>
                  )}
                  <div className="mt-2 text-[13px] text-zinc-300/90 line-clamp-4 whitespace-pre-wrap">
                    {s.chunk}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
