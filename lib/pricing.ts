import { PricingMatrix } from '@/types/booking'

export const pricing: PricingMatrix = {
  'Arcade & VR': {
    '30min': 2000,
    '1hr': 3500,
    '2hr': 6000,
  },
  'The Ball Pit': {
    '30min': 1500,
    '1hr': 2500,
    '2hr': 4000,
  },
  'Fun Rides': {
    '30min': 2500,
    '1hr': 4500,
    '2hr': 8000,
  },
}

export function getPrice(service: string, duration: string): number {
  return pricing[service]?.[duration] || 0
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
  }).format(amount)
}
