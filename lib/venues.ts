import type { BookingLocation } from '@/types/booking'

export const FUNZIA_VENUES: Record<
  BookingLocation,
  { label: string; addressLine: string }
> = {
  ikeja: {
    label: 'Ikeja (The Mix Plaza)',
    addressLine: 'The Mix Plaza, 32 Joel Ogunnaike Street, Ikeja GRA',
  },
  lekki: {
    label: 'Lekki Phase 1',
    addressLine: '12B Africa Lane, Admiralty Road, Lekki Phase 1',
  },
}

export const FUNZIA_WHATSAPP_E164 = '2349067731584'

export function funziaWhatsAppHref(prefill?: string): string {
  const base = `https://wa.me/${FUNZIA_WHATSAPP_E164}`
  if (!prefill?.trim()) return base
  return `${base}?text=${encodeURIComponent(prefill.trim())}`
}
