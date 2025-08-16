import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { Upload, Link as LinkIcon, FileText, Trash2, RefreshCw, Search } from "lucide-react"

const API = import.meta.env.VITE_API_URL || "http://localhost:8000"

function useDocuments(initialQuery = "") {
  const [items, setItems] = useState([])
  const [query, setQuery] = useState(initialQuery)
  const [loading, setLoading] = useState(false)

  const fetchDocs = async (q = "") => {
    setLoading(true)
    try {
      const url = q ? `${API}/documents?query=${encodeURIComponent(q)}` : `${API}/documents?limit=50`
      const r = await fetch(url)
      const j = await r.json()
      setItems(j.items || [])
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDocs(query)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const refresh = () => fetchDocs(query)
  const search = () => fetchDocs(query)

  return { items, setItems, query, setQuery, loading, refresh, search }
}

export default function Knowledge() {
  const { items, query, setQuery, loading, refresh, search } = useDocuments()
  const [tab, setTab] = useState("upload")

  // ---- Upload handlers
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const onUpload = async (e) => {
    e.preventDefault()
    if (!file) return
    setUploading(true)
    try {
      const form = new FormData()
      form.append("file", file)
      const r = await fetch(`${API}/documents/upload`, { method: "POST", body: form })
      if (!r.ok) throw new Error(await r.text())
      await refresh()
      setFile(null)
    } catch (err) {
      alert(`Upload failed: ${err}`)
    } finally {
      setUploading(false)
    }
  }

  // ---- URL handlers
  const [url, setUrl] = useState("")
  const [urlTitle, setUrlTitle] = useState("")
  const [addingUrl, setAddingUrl] = useState(false)
  const onAddUrl = async (e) => {
    e.preventDefault()
    if (!url) return
    setAddingUrl(true)
    try {
      const r = await fetch(`${API}/documents/url`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url, title: urlTitle || undefined }),
      })
      if (!r.ok) throw new Error(await r.text())
      await refresh()
      setUrl("")
      setUrlTitle("")
    } catch (err) {
      alert(`Add URL failed: ${err}`)
    } finally {
      setAddingUrl(false)
    }
  }

  // ---- Text handlers
  const [noteTitle, setNoteTitle] = useState("")
  const [noteText, setNoteText] = useState("")
  const [addingText, setAddingText] = useState(false)
  const onAddText = async (e) => {
    e.preventDefault()
    if (!noteText.trim()) return
    setAddingText(true)
    try {
      const r = await fetch(`${API}/documents/text`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: noteTitle || undefined, text: noteText }),
      })
      if (!r.ok) throw new Error(await r.text())
      await refresh()
      setNoteTitle("")
      setNoteText("")
    } catch (err) {
      alert(`Add text failed: ${err}`)
    } finally {
      setAddingText(false)
    }
  }

  const onDelete = async (id) => {
    if (!confirm("Delete this document from your knowledge base?")) return
    try {
      const r = await fetch(`${API}/documents/${id}`, { method: "DELETE" })
      if (!r.ok) throw new Error(await r.text())
      await refresh()
    } catch (err) {
      alert(`Delete failed: ${err}`)
    }
  }

  const filtered = useMemo(() => items, [items])

  return (
    <div className="min-h-[calc(100vh-80px)] w-full flex flex-col items-center">
      <div className="w-full max-w-6xl px-4 md:px-8">
        {/* Header */}
        <div className="flex items-center justify-between py-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Knowledge</h1>
            <p className="text-sm text-neutral-400 mt-2">Add URLs, upload files, or paste notes. Delete with one click.</p>
          </div>
          <button
            onClick={refresh}
            className="inline-flex items-center gap-2 rounded-xl px-4 py-2 bg-neutral-800 hover:bg-neutral-700 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {/* Tabs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Upload */}
          <motion.div
            layout
            className={`rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 ${tab === "upload" ? "ring-1 ring-neutral-500/40" : ""}`}
            onClick={() => setTab("upload")}
          >
            <div className="flex items-center gap-2 mb-4">
              <Upload className="w-5 h-5" />
              <h3 className="font-semibold">Upload file (.pdf / .md / .txt)</h3>
            </div>
            <form onSubmit={onUpload} className="space-y-3">
              <input
                type="file"
                accept=".pdf,.md,.markdown,.txt,.text"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="file:mr-4 file:px-4 file:py-2 file:rounded-lg file:border-0 file:bg-neutral-800 file:text-white hover:file:bg-neutral-700 text-sm"
              />
              <button
                disabled={!file || uploading}
                className="block w-full md:w-auto rounded-xl bg-white text-black px-4 py-2 disabled:opacity-50"
              >
                {uploading ? "Uploading..." : "Upload"}
              </button>
            </form>
          </motion.div>

          {/* URL */}
          <motion.div
            layout
            className={`rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 ${tab === "url" ? "ring-1 ring-neutral-500/40" : ""}`}
            onClick={() => setTab("url")}
          >
            <div className="flex items-center gap-2 mb-4">
              <LinkIcon className="w-5 h-5" />
              <h3 className="font-semibold">Add by URL</h3>
            </div>
            <form onSubmit={onAddUrl} className="space-y-3">
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/article"
                className="w-full rounded-xl bg-neutral-800 px-3 py-2 outline-none"
              />
              <input
                value={urlTitle}
                onChange={(e) => setUrlTitle(e.target.value)}
                placeholder="(Optional) Title"
                className="w-full rounded-xl bg-neutral-800 px-3 py-2 outline-none"
              />
              <button
                disabled={!url || addingUrl}
                className="block w-full md:w-auto rounded-xl bg-white text-black px-4 py-2 disabled:opacity-50"
              >
                {addingUrl ? "Adding..." : "Add URL"}
              </button>
            </form>
          </motion.div>

          {/* Text */}
          <motion.div
            layout
            className={`rounded-2xl border border-neutral-800 bg-neutral-900/60 p-5 ${tab === "text" ? "ring-1 ring-neutral-500/40" : ""}`}
            onClick={() => setTab("text")}
          >
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5" />
              <h3 className="font-semibold">Add a note</h3>
            </div>
            <form onSubmit={onAddText} className="space-y-3">
              <input
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="(Optional) Title"
                className="w-full rounded-xl bg-neutral-800 px-3 py-2 outline-none"
              />
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Paste or type text…"
                rows={6}
                className="w-full rounded-xl bg-neutral-800 px-3 py-2 outline-none"
              />
              <button
                disabled={!noteText.trim() || addingText}
                className="block w-full md:w-auto rounded-xl bg-white text-black px-4 py-2 disabled:opacity-50"
              >
                {addingText ? "Adding..." : "Add Text"}
              </button>
            </form>
          </motion.div>
        </div>

        {/* Search + Table */}
        <div className="mt-10">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && search()}
                placeholder="Search by title, uri, or text…"
                className="w-full rounded-xl bg-neutral-900 border border-neutral-800 pl-9 pr-3 py-2 outline-none"
              />
            </div>
            <button
              onClick={search}
              className="rounded-xl px-4 py-2 bg-neutral-800 hover:bg-neutral-700 transition"
            >
              Search
            </button>
          </div>

          <div className="mt-6 overflow-hidden rounded-2xl border border-neutral-800">
            <table className="w-full text-sm">
              <thead className="bg-neutral-900/60">
                <tr className="text-left text-neutral-400">
                  <th className="p-3">ID</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">URI</th>
                  <th className="p-3">Preview</th>
                  <th className="p-3 w-24"></th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td className="p-4" colSpan={5}>Loading…</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td className="p-4" colSpan={5}>No documents yet.</td></tr>
                ) : (
                  filtered.map((d) => (
                    <tr key={d.id} className="border-t border-neutral-800">
                      <td className="p-3">{d.id}</td>
                      <td className="p-3">{d.title || "-"}</td>
                      <td className="p-3">
                        {d.uri ? (
                          <a href={d.uri} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
                            {d.uri}
                          </a>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td className="p-3 text-neutral-300">
                        {d.text ? (d.text.length > 120 ? d.text.slice(0, 120) + "…" : d.text) : "-"}
                      </td>
                      <td className="p-3">
                        <button
                          onClick={() => onDelete(d.id)}
                          className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 bg-red-600/80 hover:bg-red-600"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}
