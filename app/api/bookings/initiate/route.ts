import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { initializePayment } from "@/lib/paystack";
import { createBooking } from "@/lib/database";
import { getWalkInPrice, isValidWalkInCombo } from "@/lib/pricing";
import type { Booking } from "@/types/booking";

const cartLineSchema = z.object({
  location: z.enum(["ikeja", "lekki"]),
  duration: z.enum(["30min", "1hr", "2hr"]),
  quantity: z.number().int().min(1).max(25),
});

const initiateBookingSchema = z
  .object({
    service: z.literal("Walk-in Package"),
    lines: z.array(cartLineSchema).min(1).max(30),
    date: z.string().min(1),
    time: z.string().min(1),
    customerName: z.string().min(2),
    customerEmail: z.string().email(),
    customerPhone: z.string().min(10),
    amount: z.number().positive(),
  })
  .refine(
    (data) => data.lines.every((l) => isValidWalkInCombo(l.location, l.duration)),
    { message: "Invalid location for one or more packages", path: ["lines"] },
  )
  .refine(
    (data) =>
      data.lines.reduce((sum, l) => sum + l.quantity, 0) <= 40,
    { message: "Too many guests in one checkout", path: ["lines"] },
  );

function expectedTotal(lines: z.infer<typeof cartLineSchema>[]): number {
  return lines.reduce(
    (sum, line) => sum + getWalkInPrice(line.location, line.duration) * line.quantity,
    0,
  );
}

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

    const expected = expectedTotal(data.lines);
    if (data.amount !== expected) {
      return NextResponse.json(
        { error: "Amount mismatch. Please refresh and try again." },
        { status: 400 },
      );
    }

    const paymentReference = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const created: Booking[] = [];
    for (const line of data.lines) {
      const unit = getWalkInPrice(line.location, line.duration);
      for (let q = 0; q < line.quantity; q++) {
        const booking = await createBooking({
          service: "Walk-in Package",
          location: line.location,
          duration: line.duration,
          date: data.date,
          time: data.time,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          amount: unit,
          paymentStatus: "pending",
          paymentReference,
        });
        created.push(booking);
      }
    }

    const paymentResponse = await initializePayment({
      email: data.customerEmail,
      amount: data.amount,
      reference: paymentReference,
      metadata: {
        bookingCount: created.length,
        bookingId: created[0]?.id,
        bookingIds: created.map((b) => b.id).join(","),
        service: "Walk-in Package",
        date: data.date,
        time: data.time,
        customerName: data.customerName,
      },
    });

    return NextResponse.json({
      success: true,
      authorization_url: paymentResponse.authorization_url,
      reference: paymentResponse.reference,
      bookingId: created[0]?.id,
      bookingIds: created.map((b) => b.id),
      guestCount: created.length,
    });
  } catch (error: unknown) {
    console.error("Error initiating booking:", error);
    const message =
      error instanceof Error ? error.message : "Failed to initiate booking";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
