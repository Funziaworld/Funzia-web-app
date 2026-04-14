import { getSupabaseAdmin } from '@/lib/database'
import {
  findOrCreateLoyaltyMemberByEmail,
  recordLoyaltyAccrual,
} from '@/lib/loyalty'
import { pointsAccrualForWebBooking } from '@/lib/loyalty-rules'
import type { Booking } from '@/types/booking'

/** Hybrid (C): accrue when Paystack marks a booking paid; idempotent per payment reference. */
export async function accrueLoyaltyPointsForPaidBooking(
  booking: Booking,
  paymentReference: string
): Promise<void> {
  if (!getSupabaseAdmin()) return

  try {
    const memberId = await findOrCreateLoyaltyMemberByEmail(booking.customerEmail)
    const points = pointsAccrualForWebBooking(booking.service, booking.duration)
    await recordLoyaltyAccrual({
      loyaltyMemberId: memberId,
      points,
      idempotencyKey: `paystack:${paymentReference}:${booking.id}`,
      source: 'web',
      metadata: {
        booking_id: booking.id,
        service: booking.service,
        duration: booking.duration,
        ...(booking.location ? { location: booking.location } : {}),
        payment_reference: paymentReference,
      },
    })
  } catch (e) {
    console.error('[booking loyalty] accrual failed:', e)
  }
}
