/**
 * Minimal Loyverse REST client (Bearer token from Back Office).
 * Base URL per public integrations: https://api.loyverse.com/v1.0
 */

const DEFAULT_BASE = 'https://api.loyverse.com/v1.0'

export function getLoyverseConfig() {
  const token = process.env.LOYVERSE_ACCESS_TOKEN
  const baseUrl = process.env.LOYVERSE_API_BASE_URL ?? DEFAULT_BASE
  return { token, baseUrl }
}

export async function loyverseFetch<T>(
  path: string,
  init?: RequestInit
): Promise<T> {
  const { token, baseUrl } = getLoyverseConfig()
  if (!token) {
    throw new Error('LOYVERSE_ACCESS_TOKEN is not set')
  }
  const url = `${baseUrl.replace(/\/$/, '')}${path.startsWith('/') ? path : `/${path}`}`
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
      ...(init?.headers ?? {}),
    },
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`Loyverse API ${res.status}: ${text || res.statusText}`)
  }
  return res.json() as Promise<T>
}

/** Example: GET /receipts/{id} — shape depends on Loyverse docs. */
export async function fetchLoyverseReceiptById(receiptId: string) {
  return loyverseFetch<unknown>(`/receipts/${encodeURIComponent(receiptId)}`)
}
