/**
 * Loyalty program constants (Supabase-led; align with Loyverse earn rules in DB).
 * Web accrual (Paystack): mirror typical POS package points (30min → 1, 1h → 3, 2h → 5).
 * Redemption: 40 pts = 1h bundle; 1 pt / minute for partial redemptions.
 */

import type { Duration, Service } from '@/types/booking'

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

const WEB_ACCRUAL_BY_DURATION: Record<Duration, number> = {
  '30min': 1,
  '1hr': 3,
  '2hr': 5,
}

/** Points earned when a booking is paid online (hybrid model C). */
export function pointsAccrualForWebBooking(
  _service: Service,
  duration: Duration
): number {
  return WEB_ACCRUAL_BY_DURATION[duration] ?? 0
}
