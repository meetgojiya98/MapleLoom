import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...args) {
  return twMerge(clsx(...args))
}

export function domainFromUrl(url) {
  try {
    if (!url) return null
    const u = new URL(url, 'http://dummy.base')
    return u.hostname || null
  } catch {
    return null
  }
}
