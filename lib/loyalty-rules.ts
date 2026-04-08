/**
 * Loyalty program constants (Supabase-led; align with Loyverse earn rules in DB).
 * 1h package → 3 pts, 2h → 5 pts; 40 pts redeems 1h bundle; partial: 1 pt / minute.
 */

export const LOYALTY_POINTS_PER_HOUR_BUNDLE = 40
export const LOYALTY_POINTS_PER_MINUTE_PARTIAL = 1

export type LoyaltyPointEventType =
  | 'accrual'
  | 'redemption_bundle_hour'
  | 'redemption_minutes'
  | 'adjustment'

export function pointsCostForBundleHour(): number {
  return LOYALTY_POINTS_PER_HOUR_BUNDLE
}

export function pointsCostForMinutes(minutes: number): number {
  if (!Number.isFinite(minutes) || minutes <= 0 || minutes !== Math.floor(minutes)) {
    throw new Error('minutes must be a positive integer')
  }
  return minutes * LOYALTY_POINTS_PER_MINUTE_PARTIAL
}
