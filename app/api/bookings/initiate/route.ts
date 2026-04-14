import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { initializePayment } from "@/lib/paystack";
import { createBooking } from "@/lib/database";
import { getWalkInPrice, isValidWalkInCombo } from "@/lib/pricing";

const initiateBookingSchema = z
  .object({
    service: z.literal("Walk-in Package"),
    location: z.enum(["ikeja", "lekki"]),
    duration: z.enum(["30min", "1hr", "2hr"]),
    date: z.string().min(1),
    time: z.string().min(1),
    customerName: z.string().min(2),
    customerEmail: z.string().email(),
    customerPhone: z.string().min(10),
    amount: z.number().positive(),
  })
  .refine((data) => isValidWalkInCombo(data.location, data.duration), {
    message: "Invalid location for this package",
    path: ["location"],
  });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validationResult = initiateBookingSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: "Invalid request data",
          details: validationResult.error.issues,
        },
        { status: 400 },
      );
    }

    const data = validationResult.data;

    const expectedAmount = getWalkInPrice(data.location, data.duration);
    if (data.amount !== expectedAmount) {
      return NextResponse.json(
        { error: "Amount mismatch. Please refresh and try again." },
        { status: 400 },
      );
    }

    const paymentReference = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const booking = await createBooking({
      service: "Walk-in Package",
      location: data.location,
      duration: data.duration,
      date: data.date,
      time: data.time,
      customerName: data.customerName,
      customerEmail: data.customerEmail,
      customerPhone: data.customerPhone,
      amount: data.amount,
      paymentStatus: "pending",
      paymentReference,
    });

    const paymentResponse = await initializePayment({
      email: data.customerEmail,
      amount: data.amount,
      reference: paymentReference,
      metadata: {
        bookingId: booking.id,
        service: "Walk-in Package",
        location: data.location,
        duration: data.duration,
        date: data.date,
        time: data.time,
        customerName: data.customerName,
      },
    });

    return NextResponse.json({
      success: true,
      authorization_url: paymentResponse.authorization_url,
      reference: paymentResponse.reference,
      bookingId: booking.id,
    });
  } catch (error: unknown) {
    console.error("Error initiating booking:", error);
    const message =
      error instanceof Error ? error.message : "Failed to initiate booking";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
