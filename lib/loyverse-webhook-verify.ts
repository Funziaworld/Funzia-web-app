import { createHmac, timingSafeEqual } from 'crypto'

/**
 * Verifies Loyverse webhook authenticity.
 * Confirm the exact algorithm against https://developer.loyverse.com/docs/ — many integrations use HMAC-SHA256 of the raw body.
 */
export function verifyLoyverseWebhookSignature(
  rawBody: string,
  signatureHeader: string | null,
  secret: string | undefined
): { ok: boolean; reason?: string } {
  if (!secret) {
    return { ok: true, reason: 'LOYVERSE_WEBHOOK_SECRET unset; verification skipped' }
  }
  if (!signatureHeader) {
    return { ok: false, reason: 'Missing X-Loyverse-Webhook-Signature' }
  }

  const expectedHex = createHmac('sha256', secret).update(rawBody, 'utf8').digest('hex')

  const candidates = [signatureHeader.trim(), signatureHeader.replace(/^sha256=/i, '').trim()]

  for (const candidate of candidates) {
    try {
      if (/^[a-f0-9]+$/i.test(candidate) && candidate.length === expectedHex.length) {
        const a = Buffer.from(candidate, 'hex')
        const b = Buffer.from(expectedHex, 'hex')
        if (a.length === b.length && timingSafeEqual(a, b)) {
          return { ok: true }
        }
      }
    } catch {
      /* try next */
    }
  }

  return { ok: false, reason: 'Signature mismatch' }
}
