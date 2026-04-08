import { getSupabaseAdmin } from '@/lib/database'
import type { LoyaltyPackageEarnRule } from '@/types/loyalty'
import {
  pointsCostForBundleHour,
  pointsCostForMinutes,
  type LoyaltyPointEventType,
} from '@/lib/loyalty-rules'

export { pointsCostForBundleHour, pointsCostForMinutes } from '@/lib/loyalty-rules'

function requireSupabase() {
  const db = getSupabaseAdmin()
  if (!db) {
    throw new Error('Supabase credentials are required for loyalty features')
  }
  return db
}

export async function getMemberPointsBalance(loyaltyMemberId: string): Promise<number> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('loyalty_point_events')
    .select('points_delta')
    .eq('loyalty_member_id', loyaltyMemberId)

  if (error) throw error
  return (data ?? []).reduce((sum, row) => sum + Number(row.points_delta), 0)
}

export async function findLoyaltyMemberIdByLoyverseCustomer(
  loyverseCustomerId: string
): Promise<string | null> {
  const db = requireSupabase()
  const { data, error } = await db
    .from('loyalty_members')
    .select('id')
    .eq('loyverse_customer_id', loyverseCustomerId)
    .maybeSingle()

  if (error) throw error
  return data?.id ?? null
}

export async function findOrCreateLoyaltyMemberByLoyverseCustomer(
  loyverseCustomerId: string
): Promise<string> {
  const db = requireSupabase()
  const existing = await findLoyaltyMemberIdByLoyverseCustomer(loyverseCustomerId)
  if (existing) return existing

  const { data, error } = await db
    .from('loyalty_members')
    .insert({ loyverse_customer_id: loyverseCustomerId })
    .select('id')
    .single()

  if (error?.code === '23505') {
    const again = await findLoyaltyMemberIdByLoyverseCustomer(loyverseCustomerId)
    if (again) return again
  }
  if (error) throw error
  return data!.id
}

export type EarnRuleLookup = {
  byVariantId: Map<string, LoyaltyPackageEarnRule>
  byItemId: Map<string, LoyaltyPackageEarnRule>
}

export async function loadLoyaltyEarnRules(): Promise<EarnRuleLookup> {
  const db = requireSupabase()
  const { data, error } = await db.from('loyalty_package_earn_rules').select('*')
  if (error) throw error

  const byVariantId = new Map<string, LoyaltyPackageEarnRule>()
  const byItemId = new Map<string, LoyaltyPackageEarnRule>()

  for (const row of data ?? []) {
    const rule: LoyaltyPackageEarnRule = {
      id: row.id,
      loyverseVariantId: row.loyverse_variant_id,
      loyverseItemId: row.loyverse_item_id,
      pointsPerUnit: row.points_per_unit,
      label: row.label,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }
    if (row.loyverse_variant_id) {
      byVariantId.set(row.loyverse_variant_id, rule)
    }
    if (row.loyverse_item_id) {
      byItemId.set(row.loyverse_item_id, rule)
    }
  }

  return { byVariantId, byItemId }
}

export function pointsForLineItem(
  line: { variant_id?: string; item_id?: string; quantity?: number },
  rules: EarnRuleLookup
): number {
  const qty = Math.max(1, Math.floor(Number(line.quantity) || 1))
  const variantId = line.variant_id
  const itemId = line.item_id

  if (variantId && rules.byVariantId.has(variantId)) {
    return rules.byVariantId.get(variantId)!.pointsPerUnit * qty
  }
  if (itemId && rules.byItemId.has(itemId)) {
    return rules.byItemId.get(itemId)!.pointsPerUnit * qty
  }
  return 0
}

export async function recordLoyaltyAccrual(args: {
  loyaltyMemberId: string
  points: number
  idempotencyKey: string
  source?: string
  metadata?: Record<string, unknown>
}): Promise<{ inserted: boolean }> {
  if (args.points <= 0) {
    return { inserted: false }
  }
  const db = requireSupabase()
  const { error } = await db.from('loyalty_point_events').insert({
    loyalty_member_id: args.loyaltyMemberId,
    event_type: 'accrual' satisfies LoyaltyPointEventType,
    points_delta: args.points,
    idempotency_key: args.idempotencyKey,
    source: args.source ?? 'loyverse',
    metadata: args.metadata ?? {},
  })

  if (error?.code === '23505') {
    return { inserted: false }
  }
  if (error) throw error
  return { inserted: true }
}

export async function redeemLoyaltyBundleHour(args: {
  loyaltyMemberId: string
  idempotencyKey: string
}): Promise<{ ok: boolean; reason?: string }> {
  const cost = pointsCostForBundleHour()
  const balance = await getMemberPointsBalance(args.loyaltyMemberId)
  if (balance < cost) {
    return { ok: false, reason: 'Insufficient points' }
  }
  const db = requireSupabase()
  const { error } = await db.from('loyalty_point_events').insert({
    loyalty_member_id: args.loyaltyMemberId,
    event_type: 'redemption_bundle_hour',
    points_delta: -cost,
    idempotency_key: args.idempotencyKey,
    source: 'app',
    metadata: { minutes: 60 },
  })
  if (error?.code === '23505') {
    return { ok: true }
  }
  if (error) throw error
  return { ok: true }
}

export async function redeemLoyaltyMinutes(args: {
  loyaltyMemberId: string
  minutes: number
  idempotencyKey: string
}): Promise<{ ok: boolean; reason?: string }> {
  const cost = pointsCostForMinutes(args.minutes)
  const balance = await getMemberPointsBalance(args.loyaltyMemberId)
  if (balance < cost) {
    return { ok: false, reason: 'Insufficient points' }
  }
  const db = requireSupabase()
  const { error } = await db.from('loyalty_point_events').insert({
    loyalty_member_id: args.loyaltyMemberId,
    event_type: 'redemption_minutes',
    points_delta: -cost,
    idempotency_key: args.idempotencyKey,
    source: 'app',
    metadata: { minutes: args.minutes },
  })
  if (error?.code === '23505') {
    return { ok: true }
  }
  if (error) throw error
  return { ok: true }
}
