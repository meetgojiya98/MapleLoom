const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

async function jsonFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function queryRag({ query, top_k = 6, use_reranker = true, with_trace = true }) {
  return jsonFetch("/query", {
    method: "POST",
    body: JSON.stringify({ query, top_k, use_reranker, with_trace }),
  });
}

export async function refreshIndex({ clear = false } = {}) {
  return jsonFetch("/refresh", {
    method: "POST",
    body: JSON.stringify({ clear }),
  });
}

export async function systemStatus() {
  return jsonFetch("/status", { method: "GET" }).catch(() => ({ ok: true }));
}

/** Optional endpoints if you add them server-side */
export async function listDocuments() {
  return jsonFetch("/docs", { method: "GET" });
}

export async function deleteDocument(id) {
  return jsonFetch(`/docs/${encodeURIComponent(id)}`, { method: "DELETE" });
}
