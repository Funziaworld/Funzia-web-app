import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { initializePayment } from '@/lib/paystack'
import { createBooking } from '@/lib/database'
import { BookingFormData } from '@/types/booking'
import { getPrice } from '@/lib/pricing'

const initiateBookingSchema = z.object({
  service: z.enum(['Arcade', 'VR', 'The Ball Pit', 'Fun Rides']),
  duration: z.enum(['30min', '1hr', '2hr']),
  date: z.string().min(1),
  time: z.string().min(1),
  customerName: z.string().min(2),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(10),
  amount: z.number().positive(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Validate request body
    const validationResult = initiateBookingSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid request data', details: validationResult.error.issues },
        { status: 400 }
      )
    }

    const data = validationResult.data

    // Verify amount matches service and duration
    const expectedAmount = getPrice(data.service, data.duration)
    if (data.amount !== expectedAmount) {
      return NextResponse.json(
        { error: 'Amount mismatch. Please refresh and try again.' },
        { status: 400 }
      )
    }

    // Generate payment reference
    const paymentReference = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

    // Create pending booking
    const booking = await createBooking({
      service: data.service,
      duration: data.duration,
      date: data.date,
      time: data.time,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      amount: data.amount,
      paymentStatus: 'pending',
      paymentReference,
    })

    // Initialize Paystack payment
    const paymentResponse = await initializePayment({
      email: data.customerEmail,
      amount: data.amount,
      reference: paymentReference,
      metadata: {
        bookingId: booking.id,
        service: data.service,
        duration: data.duration,
        date: data.date,
        time: data.time,
        customerName: data.customerName,
      },
    })

    return NextResponse.json({
      success: true,
      authorization_url: paymentResponse.authorization_url,
      reference: paymentResponse.reference,
      bookingId: booking.id,
    })
  } catch (error: any) {
    console.error('Error initiating booking:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to initialize booking' },
      { status: 500 }
    )
  }
}
