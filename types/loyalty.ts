import type { LoyaltyPointEventType } from '@/lib/loyalty-rules'

export type { LoyaltyPointEventType }

export type LoyaltyMember = {
  id: string
  loyverseCustomerId: string
  emailNormalized: string | null
  phoneNormalized: string | null
  createdAt: string
  updatedAt: string
}

export type LoyaltyPackageEarnRule = {
  id: string
  loyverseVariantId: string | null
  loyverseItemId: string | null
  pointsPerUnit: number
  label: string | null
  createdAt: string
  updatedAt: string
}

export type LoyaltyPointEvent = {
  id: string
  loyaltyMemberId: string
  eventType: LoyaltyPointEventType
  pointsDelta: number
  idempotencyKey: string
  source: string
  metadata: Record<string, unknown>
  createdAt: string
}

/** Subset of Loyverse `receipts.update` webhook body. */
export type LoyverseReceiptLineItem = {
  id?: string
  item_id?: string
  variant_id?: string
  item_name?: string
  variant_name?: string | null
  sku?: string
  quantity?: number
}

export type LoyverseWebhookReceipt = {
  receipt_number?: string
  receipt_type?: string
  cancelled_at?: string | null
  customer_id?: string | null
  line_items?: LoyverseReceiptLineItem[]
}

export type LoyverseReceiptWebhookBody = {
  merchant_id?: string
  type?: string
  created_at?: string
  receipts?: LoyverseWebhookReceipt[]
}
