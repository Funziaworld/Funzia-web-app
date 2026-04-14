import type { LoyverseReceiptWebhookBody } from '@/types/loyalty'
import {
  ensureLoyaltyMemberForLoyverse,
  hasRecentWebAccrualForService,
  loadLoyaltyEarnRules,
  recordLoyaltyAccrual,
  resolveLineItemEarn,
} from '@/lib/loyalty'

export function isReceiptsUpdateWebhook(
  body: unknown
): body is LoyverseReceiptWebhookBody {
  if (body === null || typeof body !== 'object') return false
  const b = body as LoyverseReceiptWebhookBody
  return Array.isArray(b.receipts)
}

export type ProcessReceiptWebhookResult = {
  processedReceipts: number
  accrualsAttempted: number
  accrualsInserted: number
  skippedNoCustomer: number
  skippedNotSale: number
  skippedWebDedupe: number
}

export async function processLoyverseReceiptsWebhook(
  body: LoyverseReceiptWebhookBody
): Promise<ProcessReceiptWebhookResult> {
  const result: ProcessReceiptWebhookResult = {
    processedReceipts: 0,
    accrualsAttempted: 0,
    accrualsInserted: 0,
    skippedNoCustomer: 0,
    skippedNotSale: 0,
    skippedWebDedupe: 0,
  }

  const merchantId = body.merchant_id ?? 'unknown'
  const rules = await loadLoyaltyEarnRules()

  for (const receipt of body.receipts ?? []) {
    if (receipt.receipt_type && receipt.receipt_type !== 'SALE') {
      result.skippedNotSale += 1
      continue
    }
    if (receipt.cancelled_at) {
      continue
    }
    const customerId = receipt.customer_id
    if (!customerId) {
      result.skippedNoCustomer += 1
      continue
    }

    result.processedReceipts += 1
    const memberId = await ensureLoyaltyMemberForLoyverse(customerId)
    const receiptKey = receipt.receipt_number ?? 'noreceiptno'

    let lineIndex = 0
    for (const line of receipt.line_items ?? []) {
      lineIndex += 1
      const { points, rule } = resolveLineItemEarn(
        {
          variant_id: line.variant_id,
          item_id: line.item_id,
          quantity: line.quantity,
        },
        rules
      )
      if (points <= 0) continue

      if (rule?.bookingServiceMatch) {
        const skip = await hasRecentWebAccrualForService(
          memberId,
          rule.bookingServiceMatch,
          rule.dedupeWindowHours
        )
        if (skip) {
          result.skippedWebDedupe += 1
          continue
        }
      }

      const lineId = line.id ?? `idx${lineIndex}`
      const idempotencyKey = `loyverse:${merchantId}:receipt:${receiptKey}:line:${lineId}`

      result.accrualsAttempted += 1
      const { inserted } = await recordLoyaltyAccrual({
        loyaltyMemberId: memberId,
        points,
        idempotencyKey,
        source: 'loyverse',
        metadata: {
          receipt_number: receipt.receipt_number,
          item_id: line.item_id,
          variant_id: line.variant_id,
          quantity: line.quantity ?? 1,
        },
      })
      if (inserted) result.accrualsInserted += 1
    }
  }

  return result
}
