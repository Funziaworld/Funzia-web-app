import { NextRequest, NextResponse } from 'next/server'
import { verifyLoyverseWebhookSignature } from '@/lib/loyverse-webhook-verify'
import {
  isReceiptsUpdateWebhook,
  processLoyverseReceiptsWebhook,
} from '@/lib/loyverse-receipt-webhook'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature =
      request.headers.get('x-loyverse-webhook-signature') ??
      request.headers.get('X-Loyverse-Webhook-Signature')

    const secret = process.env.LOYVERSE_WEBHOOK_SECRET
    const verified = verifyLoyverseWebhookSignature(rawBody, signature, secret)
    if (!verified.ok) {
      return NextResponse.json(
        { error: verified.reason ?? 'Invalid webhook signature' },
        { status: 401 }
      )
    }
    if (verified.reason && process.env.NODE_ENV !== 'production') {
      console.warn('[loyverse webhook]', verified.reason)
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(rawBody)
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    if (isReceiptsUpdateWebhook(parsed)) {
      const stats = await processLoyverseReceiptsWebhook(parsed)
      return NextResponse.json({ received: true, ...stats })
    }

    return NextResponse.json({ received: true, note: 'No handler for event type' })
  } catch (e) {
    console.error('Loyverse webhook error:', e)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
