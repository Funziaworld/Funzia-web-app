import { createClient } from '@supabase/supabase-js'
import { Booking, PaymentStatus } from '@/types/booking'


const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.warn('Supabase credentials not found. Using fallback JSON storage.')
}

const supabase = supabaseUrl && supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null

/** Service-role client for server-side modules (loyalty, integrations). Null if env missing. */
export function getSupabaseAdmin() {
  return supabase
}


function rowToBooking(row: any): Booking {
  return {
    id: row.id,
    service: row.service,
    duration: row.duration,
    date: row.date,
    time: row.time,
    customerName: row.customer_name,
    customerEmail: row.customer_email,
    customerPhone: row.customer_phone,
    amount: parseFloat(row.amount),
    paymentStatus: row.payment_status,
    paymentReference: row.payment_reference,
    createdAt: row.created_at,
  }
}


function bookingToRow(booking: Partial<Booking>): any {
  return {
    id: booking.id,
    service: booking.service,
    duration: booking.duration,
    date: booking.date,
    time: booking.time,
    customer_name: booking.customerName,
    customer_email: booking.customerEmail,
    customer_phone: booking.customerPhone,
    amount: booking.amount?.toString(),
    payment_status: booking.paymentStatus,
    payment_reference: booking.paymentReference || null,
    created_at: booking.createdAt,
  }
}


import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(process.cwd(), 'data')
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json')

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

function initializeBookingsFile() {
  ensureDataDir()
  if (!fs.existsSync(BOOKINGS_FILE)) {
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify([], null, 2))
  }
}

function getAllBookingsJSON(): Booking[] {
  initializeBookingsFile()
  try {
    const data = fs.readFileSync(BOOKINGS_FILE, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    console.error('Error reading bookings:', error)
    return []
  }
}


export async function getAllBookings(): Promise<Booking[]> {
  if (!supabase) {
    return getAllBookingsJSON()
  }

  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data ? data.map(rowToBooking) : []
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return getAllBookingsJSON()
  }
}


export async function getBookingById(id: string): Promise<Booking | null> {
  if (!supabase) {
    const bookings = getAllBookingsJSON()
    return bookings.find((booking) => booking.id === id) || null
  }

  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data ? rowToBooking(data) : null
  } catch (error) {
    console.error('Error fetching booking:', error)
    const bookings = getAllBookingsJSON()
    return bookings.find((booking) => booking.id === id) || null
  }
}


export async function getBookingByPaymentReference(
  reference: string
): Promise<Booking | null> {
  if (!supabase) {
    const bookings = getAllBookingsJSON()
    return bookings.find((booking) => booking.paymentReference === reference) || null
  }

  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('*')
      .eq('payment_reference', reference)
      .single()

    if (error) throw error
    return data ? rowToBooking(data) : null
  } catch (error) {
    console.error('Error fetching booking by reference:', error)
    const bookings = getAllBookingsJSON()
    return bookings.find((booking) => booking.paymentReference === reference) || null
  }
}


export async function createBooking(
  booking: Omit<Booking, 'id' | 'createdAt'>
): Promise<Booking> {
  const newBooking: Booking = {
    ...booking,
    id: `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: new Date().toISOString(),
  }

  if (!supabase) {
    initializeBookingsFile()
    const bookings = getAllBookingsJSON()
    bookings.push(newBooking)
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2))
    return newBooking
  }

  try {
    const row = bookingToRow(newBooking)
    const { data, error } = await supabase
      .from('bookings')
      .insert(row)
      .select()
      .single()

    if (error) throw error
    return data ? rowToBooking(data) : newBooking
  } catch (error) {
    console.error('Error creating booking:', error)

    initializeBookingsFile()
    const bookings = getAllBookingsJSON()
    bookings.push(newBooking)
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2))
    return newBooking
  }
}


export async function updateBookingPaymentStatus(
  id: string,
  paymentStatus: PaymentStatus,
  paymentReference?: string
): Promise<Booking | null> {
  if (!supabase) {
    initializeBookingsFile()
    const bookings = getAllBookingsJSON()
    const bookingIndex = bookings.findIndex((booking) => booking.id === id)

    if (bookingIndex === -1) {
      return null
    }

    bookings[bookingIndex] = {
      ...bookings[bookingIndex],
      paymentStatus,
      paymentReference: paymentReference || bookings[bookingIndex].paymentReference,
    }

    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2))
    return bookings[bookingIndex]
  }

  try {
    const updateData: any = {
      payment_status: paymentStatus,
    }

    if (paymentReference) {
      updateData.payment_reference = paymentReference
    }

    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data ? rowToBooking(data) : null
  } catch (error) {
    console.error('Error updating booking:', error)

    initializeBookingsFile()
    const bookings = getAllBookingsJSON()
    const bookingIndex = bookings.findIndex((booking) => booking.id === id)

    if (bookingIndex === -1) {
      return null
    }

    bookings[bookingIndex] = {
      ...bookings[bookingIndex],
      paymentStatus,
      paymentReference: paymentReference || bookings[bookingIndex].paymentReference,
    }

    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2))
    return bookings[bookingIndex]
  }
}


export async function updateBookingByPaymentReference(
  reference: string,
  paymentStatus: PaymentStatus
): Promise<Booking | null> {
  if (!supabase) {
    initializeBookingsFile()
    const bookings = getAllBookingsJSON()
    const bookingIndex = bookings.findIndex(
      (booking) => booking.paymentReference === reference
    )

    if (bookingIndex === -1) {
      return null
    }

    bookings[bookingIndex] = {
      ...bookings[bookingIndex],
      paymentStatus,
    }

    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2))
    return bookings[bookingIndex]
  }

  try {
    const { data, error } = await supabase
      .from('bookings')
      .update({ payment_status: paymentStatus })
      .eq('payment_reference', reference)
      .select()
      .single()

    if (error) throw error
    return data ? rowToBooking(data) : null
  } catch (error) {
    console.error('Error updating booking by reference:', error)

    initializeBookingsFile()
    const bookings = getAllBookingsJSON()
    const bookingIndex = bookings.findIndex(
      (booking) => booking.paymentReference === reference
    )

    if (bookingIndex === -1) {
      return null
    }

    bookings[bookingIndex] = {
      ...bookings[bookingIndex],
      paymentStatus,
    }

    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(bookings, null, 2))
    return bookings[bookingIndex]
  }
}
