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

function pickEmailFromCustomerPayload(data: unknown): string | null {
  if (data === null || typeof data !== 'object') return null
  const o = data as Record<string, unknown>
  const direct = o.email
  if (typeof direct === 'string' && direct.trim()) return direct.trim()

  const inner = o.customer
  if (inner && typeof inner === 'object') {
    const e = (inner as Record<string, unknown>).email
    if (typeof e === 'string' && e.trim()) return e.trim()
  }

  const list = o.customers
  if (Array.isArray(list) && list[0] && typeof list[0] === 'object') {
    const e = (list[0] as Record<string, unknown>).email
    if (typeof e === 'string' && e.trim()) return e.trim()
  }

  return null
}

/** Best-effort email for merging web + POS loyalty rows (requires CUSTOMERS_READ token). */
export async function tryFetchLoyverseCustomerEmail(
  customerId: string
): Promise<string | null> {
  try {
    const { token } = getLoyverseConfig()
    if (!token) return null
    const data = await loyverseFetch<unknown>(
      `/customers/${encodeURIComponent(customerId)}`
    )
    return pickEmailFromCustomerPayload(data)
  } catch {
    return null
  }
}
