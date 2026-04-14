import { NextRequest, NextResponse } from 'next/server'
import { verifyPayment } from '@/lib/paystack'
import { accrueLoyaltyPointsForPaidBooking } from '@/lib/booking-loyalty'
import {
  getBookingsByPaymentReference,
  updateBookingsByPaymentReference,
} from '@/lib/database'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const reference = searchParams.get('reference')

    if (!reference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      )
    }

    const existing = await getBookingsByPaymentReference(reference)
    if (existing.length === 0) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    const verification = await verifyPayment(reference)

    if (verification.status) {
      const updated = await updateBookingsByPaymentReference(reference, 'paid')

      for (const booking of updated) {
        await accrueLoyaltyPointsForPaidBooking(booking, reference)
      }

      const totalPaid = updated.reduce((s, b) => s + b.amount, 0)

      return NextResponse.json({
        success: true,
        booking: updated[0],
        bookings: updated,
        guestCount: updated.length,
        totalPaid,
        paymentStatus: 'paid',
      })
    }

    await updateBookingsByPaymentReference(reference, 'failed')

    return NextResponse.json({
      success: false,
      paymentStatus: 'failed',
      booking: existing[0],
      bookings: existing,
    })
  } catch (error: any) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
