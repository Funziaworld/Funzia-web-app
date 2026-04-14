import { NextRequest, NextResponse } from 'next/server'
import { verifyWebhookSignature, verifyPayment } from '@/lib/paystack'
import { accrueLoyaltyPointsForPaidBooking } from '@/lib/booking-loyalty'
import { updateBookingByPaymentReference } from '@/lib/database'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-paystack-signature')
    
    if (!signature) {
      return NextResponse.json(
        { error: 'Missing signature' },
        { status: 401 }
      )
    }

    // Get raw body for signature verification
    const body = await request.text()
    
    // Verify webhook signature
    if (!verifyWebhookSignature(body, signature)) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 401 }
      )
    }

    const event = JSON.parse(body)

    // Handle different event types
    if (event.event === 'charge.success') {
      const { reference } = event.data

      // Verify payment with Paystack
      const verification = await verifyPayment(reference)

      if (verification.status) {
        // Update booking status to paid
        const booking = await updateBookingByPaymentReference(reference, 'paid')

        if (!booking) {
          console.error('Booking not found for reference:', reference)
          return NextResponse.json(
            { error: 'Booking not found' },
            { status: 404 }
          )
        }

        await accrueLoyaltyPointsForPaidBooking(booking, reference)

        console.log('Payment successful for booking:', booking.id)

        return NextResponse.json({ success: true, bookingId: booking.id })
      }
    }

    // Handle other events if needed
    if (event.event === 'charge.failed') {
      const { reference } = event.data
      await updateBookingByPaymentReference(reference, 'failed')
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
