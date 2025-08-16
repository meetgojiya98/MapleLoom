import { motion } from 'framer-motion'

export default function Hero() {
  return (
    <section className="relative pt-20 pb-10">
      <div className="text-center max-w-3xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="text-4xl sm:text-6xl font-extrabold tracking-tight"
        >
          MapleLoom <span className="text-brand-400">RAG</span>
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
          className="mt-4 text-slate-300 text-lg"
        >
          Lightning-clean UX for grounded answers. Hybrid dense/sparse retrieval, optional reranking, and beautiful citations — all on your stack.
        </motion.p>
      </div>

      {/* Animated glow */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.8 }}
        transition={{ duration: 1.2 }}
        className="pointer-events-none absolute inset-0 -z-10"
        aria-hidden
      >
        <div className="mx-auto h-72 w-[60rem] blur-3xl opacity-25 bg-gradient-to-r from-brand-600/40 via-cyan-500/30 to-emerald-500/30 rounded-full" />
      </motion.div>
    </section>
  )
}
