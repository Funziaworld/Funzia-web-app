import type { BookingLocation, Duration } from '@/types/booking'

/** Per person; 30-minute tier is Ikeja only. Amounts in NGN. */
const WALK_IN_PRICES: Record<Duration, Record<BookingLocation, number | null>> = {
  '30min': { ikeja: 10_950, lekki: null },
  '1hr': { ikeja: 15_950, lekki: 15_950 },
  '2hr': { ikeja: 25_500, lekki: 25_500 },
}

export function getWalkInPrice(location: BookingLocation, duration: Duration): number {
  const n = WALK_IN_PRICES[duration][location]
  return n ?? 0
}

export function isValidWalkInCombo(location: BookingLocation, duration: Duration): boolean {
  return WALK_IN_PRICES[duration][location] != null
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount)
}
