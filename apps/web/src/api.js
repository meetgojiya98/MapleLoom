// apps/web/src/api.js
const DEFAULT_TIMEOUT = 60000;

export const getBase = () => {
  const envBase = import.meta.env?.VITE_API_BASE?.trim();
  if (envBase) return envBase.replace(/\/$/, '');
  if (typeof window !== 'undefined' && window.location.port === '5173') return '/_api';
  return 'http://localhost:8000';
};

const jsonHeaders = { 'Content-Type': 'application/json' };

async function request(method, path, body, { timeout = DEFAULT_TIMEOUT, signal } = {}) {
  const base = getBase();
  const url = `${base}${path}`;
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeout);

  try {
    const res = await fetch(url, {
      method,
      headers: jsonHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: signal || ctrl.signal,
    });

    if (!res.ok) {
      // surface server message (e.g. 422 validation) instead of generic network error
      const text = await res.text().catch(() => '');
      throw new Error(text || `HTTP ${res.status} ${res.statusText}`);
    }
    return await res.json();
  } catch (err) {
    if (err?.name === 'AbortError') throw new Error('Request timed out');
    throw err; // <- do NOT mask real server errors
  } finally {
    clearTimeout(timer);
  }
}

export const queryRag = (payload) => request('POST', '/query', payload);
export const refreshIndex = (payload) => request('POST', '/refresh', payload);
export const systemStatus = () => request('GET', '/status');
