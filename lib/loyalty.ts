import { getSupabaseAdmin } from '@/lib/database'
import {
  pointsCostForBundleHour,
  pointsCostForMinutes,
  type LoyaltyPointEventType,
} from '@/lib/loyalty-rules'
import { tryFetchLoyverseCustomerEmail } from '@/lib/loyverse-api'
import type { LoyaltyPackageEarnRule } from '@/types/loyalty'

export { pointsCostForBundleHour, pointsCostForMinutes } from '@/lib/loyalty-rules'

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

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

/** Merge POS customer onto an existing web member when Loyverse returns the same email. */
export async function ensureLoyaltyMemberForLoyverse(
  loyverseCustomerId: string
): Promise<string> {
  const existing = await findLoyaltyMemberIdByLoyverseCustomer(loyverseCustomerId)
  if (existing) return existing

  const email = await tryFetchLoyverseCustomerEmail(loyverseCustomerId)
  const normalized = email ? normalizeEmail(email) : null

  if (normalized) {
    const db = requireSupabase()
    const { data: byEmail, error: selErr } = await db
      .from('loyalty_members')
      .select('id, loyverse_customer_id')
      .eq('email_normalized', normalized)
      .maybeSingle()

    if (selErr) throw selErr

    if (byEmail?.id) {
      if (!byEmail.loyverse_customer_id) {
        const { error: upErr } = await db
          .from('loyalty_members')
          .update({
            loyverse_customer_id: loyverseCustomerId,
            updated_at: new Date().toISOString(),
          })
          .eq('id', byEmail.id)

        if (upErr?.code === '23505') {
          return findOrCreateLoyaltyMemberByLoyverseCustomer(loyverseCustomerId)
        }
        if (upErr) throw upErr
        return byEmail.id
      }
      if (byEmail.loyverse_customer_id === loyverseCustomerId) {
        return byEmail.id
      }
    }
  }

  return findOrCreateLoyaltyMemberByLoyverseCustomer(loyverseCustomerId)
}

export async function findOrCreateLoyaltyMemberByEmail(email: string): Promise<string> {
  const normalized = normalizeEmail(email)
  const db = requireSupabase()
  const { data: row, error: selErr } = await db
    .from('loyalty_members')
    .select('id')
    .eq('email_normalized', normalized)
    .maybeSingle()

  if (selErr) throw selErr
  if (row?.id) return row.id

  const { data, error } = await db
    .from('loyalty_members')
    .insert({ email_normalized: normalized })
    .select('id')
    .single()

  if (error?.code === '23505') {
    const { data: again } = await db
      .from('loyalty_members')
      .select('id')
      .eq('email_normalized', normalized)
      .maybeSingle()
    if (again?.id) return again.id
  }
  if (error) throw error
  return data!.id
}

export async function hasRecentWebAccrualForService(
  loyaltyMemberId: string,
  service: string,
  windowHours: number
): Promise<boolean> {
  const db = requireSupabase()
  const since = new Date(Date.now() - windowHours * 3_600_000).toISOString()
  const { data, error } = await db
    .from('loyalty_point_events')
    .select('metadata')
    .eq('loyalty_member_id', loyaltyMemberId)
    .eq('source', 'web')
    .gte('created_at', since)
    .limit(80)

  if (error) throw error
  return (data ?? []).some((row) => {
    const m = row.metadata as Record<string, unknown> | null
    return m?.service === service
  })
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
    const dedupeH = Number(row.dedupe_window_hours)
    const rule: LoyaltyPackageEarnRule = {
      id: row.id,
      loyverseVariantId: row.loyverse_variant_id,
      loyverseItemId: row.loyverse_item_id,
      pointsPerUnit: row.points_per_unit,
      label: row.label,
      bookingServiceMatch: row.booking_service_match ?? null,
      dedupeWindowHours:
        Number.isFinite(dedupeH) && dedupeH > 0 ? dedupeH : 72,
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

export type LineItemEarnResolution = {
  points: number
  rule: LoyaltyPackageEarnRule | null
}

export function resolveLineItemEarn(
  line: { variant_id?: string; item_id?: string; quantity?: number },
  rules: EarnRuleLookup
): LineItemEarnResolution {
  const qty = Math.max(1, Math.floor(Number(line.quantity) || 1))
  const variantId = line.variant_id
  const itemId = line.item_id

  if (variantId && rules.byVariantId.has(variantId)) {
    const rule = rules.byVariantId.get(variantId)!
    return { points: rule.pointsPerUnit * qty, rule }
  }
  if (itemId && rules.byItemId.has(itemId)) {
    const rule = rules.byItemId.get(itemId)!
    return { points: rule.pointsPerUnit * qty, rule }
  }
  return { points: 0, rule: null }
}

export function pointsForLineItem(
  line: { variant_id?: string; item_id?: string; quantity?: number },
  rules: EarnRuleLookup
): number {
  return resolveLineItemEarn(line, rules).points
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
