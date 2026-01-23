export type Service = 'Arcade & VR' | 'The Ball Pit' | 'Fun Rides'

export type Duration = '30min' | '1hr' | '2hr'

export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled'

export interface Booking {
  id: string
  service: Service
  duration: Duration
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
  service: Service
  duration: Duration
  date: string
  time: string
  customerName: string
  customerEmail: string
  customerPhone: string
}

export interface PricingMatrix {
  [service: string]: {
    [duration: string]: number
  }
}
