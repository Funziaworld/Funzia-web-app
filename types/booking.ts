export type Service =
  | 'Walk-in Package'
  | 'Arcade'
  | 'VR'
  | 'The Ball Pit'
  | 'Fun Rides'

export type BookingLocation = 'ikeja' | 'lekki'

export type Duration = '30min' | '1hr' | '2hr'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled'

export interface Booking {
  id: string
  service: Service
  duration: Duration
  /** Set for walk-in Paystack bookings; omitted on legacy rows. */
  location?: BookingLocation
  date: string // ISO date string
  time: string // HH:mm format
  customerName: string
  customerEmail: string
  customerPhone: string
  amount: number
  paymentStatus: PaymentStatus
  paymentReference: string | null
  createdAt: string // ISO date string
}

export interface BookingFormData {
  service: 'Walk-in Package'
  location: BookingLocation
  duration: Duration
  date: string
  time: string
  customerName: string
  customerEmail: string
  customerPhone: string
}
