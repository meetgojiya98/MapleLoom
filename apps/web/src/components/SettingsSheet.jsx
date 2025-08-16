import React from "react";
import { AnimatePresence, motion } from "framer-motion";

export default function SettingsSheet({ open, onClose, options, onChange }) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="fixed right-0 top-0 h-full w-[380px] max-w-[92vw] bg-zinc-950/95 backdrop-blur-xl border-l border-white/10 z-50 p-5"
            initial={{ x: 380 }}
            animate={{ x: 0 }}
            exit={{ x: 380 }}
            transition={{ type: "spring", stiffness: 200, damping: 22 }}
          >
            <h3 className="text-lg font-semibold text-zinc-100">
              Advanced settings
            </h3>
            <p className="text-sm text-zinc-400">
              Tune retrieval for speed vs precision.
            </p>

            <div className="mt-6 space-y-5">
              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={options.useReranker}
                  onChange={(e) =>
                    onChange({ ...options, useReranker: e.target.checked })
                  }
                  className="toggle"
                />
                <div>
                  <div className="text-zinc-200 font-medium">Reranker</div>
                  <div className="text-xs text-zinc-400">
                    Better precision, slower answers.
                  </div>
                </div>
              </label>

              <div>
                <div className="text-sm text-zinc-300 flex items-center justify-between">
                  <span>Top&nbsp;K</span>
                  <span className="text-zinc-400">{options.topK}</span>
                </div>
                <input
                  type="range"
                  min={2}
                  max={12}
                  value={options.topK}
                  onChange={(e) =>
                    onChange({ ...options, topK: Number(e.target.value) })
                  }
                  className="w-full accent-indigo-400"
                />
                <div className="text-[11px] text-zinc-400">
                  Fewer = faster • More = broader coverage
                </div>
              </div>

              <label className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={options.withTrace}
                  onChange={(e) =>
                    onChange({ ...options, withTrace: e.target.checked })
                  }
                  className="toggle"
                />
                <div>
                  <div className="text-zinc-200 font-medium">Trace</div>
                  <div className="text-xs text-zinc-400">
                    Include retrieval stats for debugging.
                  </div>
                </div>
              </label>
            </div>

            <button className="btn btn-soft mt-8 w-full" onClick={onClose}>
              Close
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
