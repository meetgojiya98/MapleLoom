import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { refresh } from "../lib/api";

export default function UploadDialog({ open, onClose }) {
  const [path, setPath] = useState("/workspace/data/crawl");
  const [clear, setClear] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function run() {
    setBusy(true);
    setMsg("");
    try {
      const res = await refresh({ clear, path });
      setMsg(
        res?.accepted
          ? "Reindex request accepted. Worker will (re)ingest shortly."
          : "Request sent."
      );
    } catch (e) {
      setMsg(e?.message || "Failed to call /refresh");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 bg-black/60 z-40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
          <motion.div
            className="fixed inset-0 z-50 grid place-items-center p-4"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
          >
            <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-zinc-950/95 backdrop-blur-xl p-5">
              <h3 className="text-lg font-semibold text-zinc-100">
                Reindex / manage documents
              </h3>
              <p className="text-sm text-zinc-400">
                Point to a folder inside the worker container, then reindex.
              </p>

              <div className="mt-4 space-y-3">
                <label className="block">
                  <div className="text-sm text-zinc-300 mb-1">Path</div>
                  <input
                    className="input"
                    value={path}
                    onChange={(e) => setPath(e.target.value)}
                  />
                </label>
                <label className="flex items-center gap-2 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={clear}
                    onChange={(e) => setClear(e.target.checked)}
                    className="toggle"
                  />
                  Clear vector index before ingest
                </label>
              </div>

              {msg && (
                <div className="mt-3 text-sm text-indigo-300/90">{msg}</div>
              )}

              <div className="mt-5 flex items-center justify-end gap-2">
                <button className="btn btn-ghost" onClick={onClose}>
                  Close
                </button>
                <button className="btn btn-primary" onClick={run} disabled={busy}>
                  {busy ? "Working…" : "Start reindex"}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
