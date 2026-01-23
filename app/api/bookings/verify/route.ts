import { NextRequest, NextResponse } from 'next/server'
import { verifyPayment } from '@/lib/paystack'
import { updateBookingPaymentStatus, getBookingByPaymentReference } from '@/lib/database'

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

    // Check if booking exists
    const existingBooking = await getBookingByPaymentReference(reference)
    if (!existingBooking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Verify payment with Paystack
    const verification = await verifyPayment(reference)

    if (verification.status) {
      // Update booking status to paid
      const updatedBooking = await updateBookingPaymentStatus(
        existingBooking.id,
        'paid',
        reference
      )

      return NextResponse.json({
        success: true,
        booking: updatedBooking,
        paymentStatus: 'paid',
      })
    } else {
      // Update booking status to failed
      await updateBookingPaymentStatus(existingBooking.id, 'failed', reference)

      return NextResponse.json({
        success: false,
        paymentStatus: 'failed',
        booking: existingBooking,
      })
    }
  } catch (error: any) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to verify payment' },
      { status: 500 }
    )
  }
}
