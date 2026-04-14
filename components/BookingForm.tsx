'use client'

import { useState, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import type { BookingLocation, Duration } from '@/types/booking'
import { formatPrice, getWalkInPrice, isValidWalkInCombo } from '@/lib/pricing'
import { useSearchParams } from 'next/navigation'
import { FUNZIA_VENUES, funziaWhatsAppHref } from '@/lib/venues'

type CartLine = {
  key: string
  location: BookingLocation
  duration: Duration
  quantity: number
}

function newLineKey(): string {
  return `line_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
}

const checkoutSchema = z.object({
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerEmail: z.string().email('Invalid email address'),
  customerPhone: z.string().min(10, 'Phone number must be at least 10 digits'),
})

type CheckoutFormValues = z.infer<typeof checkoutSchema>

const PACKAGE_BLURBS: Record<Duration, string> = {
  '30min':
    'Unlimited play on all indoor games except VR. Ikeja only. ₦10,950 per person.',
  '1hr':
    'Unlimited indoor games including 1× 9D VR view. Ikeja & Lekki. ₦15,950 per person.',
  '2hr':
    'Unlimited indoor games, 1× 360 VR view, 1× Gun VR. Ikeja & Lekki. ₦25,500 per person.',
}

function cartTotal(lines: CartLine[]): number {
  return lines.reduce(
    (sum, line) => sum + getWalkInPrice(line.location, line.duration) * line.quantity,
    0,
  )
}

function cartGuestCount(lines: CartLine[]): number {
  return lines.reduce((sum, line) => sum + line.quantity, 0)
}

export default function BookingForm() {
  const searchParams = useSearchParams()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [pickerLocation, setPickerLocation] = useState<BookingLocation>('ikeja')
  const [pickerDuration, setPickerDuration] = useState<Duration>('1hr')
  const [addQuantity, setAddQuantity] = useState(1)
  const [cart, setCart] = useState<CartLine[]>([])
  const [cartSeeded, setCartSeeded] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutSchema),
  })

  useEffect(() => {
    const durationParam = searchParams?.get('duration')
    const locationParam = searchParams?.get('location')
    let nextDur: Duration = '1hr'
    let nextLoc: BookingLocation = 'ikeja'
    if (durationParam && ['30min', '1hr', '2hr'].includes(durationParam)) {
      nextDur = durationParam as Duration
    }
    if (locationParam && ['ikeja', 'lekki'].includes(locationParam)) {
      nextLoc = locationParam as BookingLocation
    }
    if (nextLoc === 'lekki' && nextDur === '30min') {
      nextDur = '1hr'
    }
    setPickerLocation(nextLoc)
    setPickerDuration(nextDur)
    if (!cartSeeded) {
      setCart([
        {
          key: newLineKey(),
          location: nextLoc,
          duration: nextDur,
          quantity: 1,
        },
      ])
      setCartSeeded(true)
    }
  }, [searchParams, cartSeeded])

  useEffect(() => {
    if (pickerLocation === 'lekki' && pickerDuration === '30min') {
      setPickerDuration('1hr')
    }
  }, [pickerLocation, pickerDuration])

  const addPickerToCart = useCallback(() => {
    if (!isValidWalkInCombo(pickerLocation, pickerDuration)) return
    const qty = Math.min(25, Math.max(1, Math.floor(addQuantity)))
    setCart((prev) => {
      const idx = prev.findIndex(
        (l) => l.location === pickerLocation && l.duration === pickerDuration,
      )
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = {
          ...next[idx],
          quantity: Math.min(25, next[idx].quantity + qty),
        }
        return next
      }
      return [
        ...prev,
        {
          key: newLineKey(),
          location: pickerLocation,
          duration: pickerDuration,
          quantity: qty,
        },
      ]
    })
    setAddQuantity(1)
  }, [pickerLocation, pickerDuration, addQuantity])

  const updateLineQuantity = (key: string, quantity: number) => {
    const q = Math.min(25, Math.max(1, Math.floor(quantity)))
    setCart((prev) =>
      prev.map((line) => (line.key === key ? { ...line, quantity: q } : line)),
    )
  }

  const removeLine = (key: string) => {
    setCart((prev) => prev.filter((line) => line.key !== key))
  }

  const timeSlots: string[] = []
  for (let hour = 10; hour < 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      timeSlots.push(
        `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`,
      )
    }
  }

  const total = cartTotal(cart)
  const guests = cartGuestCount(cart)

  const onSubmit = async (data: CheckoutFormValues) => {
    setIsSubmitting(true)
    setError(null)

    if (cart.length === 0) {
      setError('Your cart is empty. Add at least one package.')
      setIsSubmitting(false)
      return
    }

    const linesPayload = cart.map(({ location, duration, quantity }) => ({
      location,
      duration,
      quantity,
    }))

    for (const line of linesPayload) {
      if (!isValidWalkInCombo(line.location, line.duration)) {
        setError('One or more cart items are invalid for the selected location.')
        setIsSubmitting(false)
        return
      }
    }

    if (linesPayload.reduce((s, l) => s + l.quantity, 0) > 40) {
      setError('Too many guests in one checkout (max 40).')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch('/api/bookings/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          service: 'Walk-in Package',
          lines: linesPayload,
          date: data.date,
          time: data.time,
          customerName: data.customerName,
          customerEmail: data.customerEmail,
          customerPhone: data.customerPhone,
          amount: total,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to initialize booking')
      }

      if (result.authorization_url) {
        window.location.href = result.authorization_url
      } else {
        throw new Error('No payment URL received')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date)
    if (date) {
      setValue('date', date.toISOString().split('T')[0])
    }
  }

  const minDate = new Date()
  minDate.setHours(0, 0, 0, 0)

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-4 text-secondary">Book walk-in play</h2>
      <p className="text-center text-gray-600 mb-6 text-sm leading-relaxed">
        We sell <strong>time blocks</strong>, not coins per game. We open from{' '}
        <strong>10:00</strong> for walk-in packages. Add one row per package tier; increase quantity
        for more guests on the same tier. Birthday party packages: send your request on{' '}
        <a
          href={funziaWhatsAppHref()}
          className="text-primary font-semibold underline"
          target="_blank"
          rel="noopener noreferrer"
        >
          WhatsApp
        </a>
        .
      </p>

      <div className="bg-gray-50 rounded-lg p-4 mb-8 text-sm text-gray-700 space-y-2">
        <p className="font-semibold text-secondary">Locations</p>
        <p>
          <span className="font-medium">{FUNZIA_VENUES.ikeja.label}</span>
          <br />
          {FUNZIA_VENUES.ikeja.addressLine}
        </p>
        <p>
          <span className="font-medium">{FUNZIA_VENUES.lekki.label}</span>
          <br />
          {FUNZIA_VENUES.lekki.addressLine}
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
        <div className="border border-gray-200 rounded-lg p-4 bg-white">
          <h3 className="text-lg font-semibold text-secondary mb-3">Cart</h3>
          {cart.length === 0 ? (
            <p className="text-sm text-gray-600">No packages yet — add one below.</p>
          ) : (
            <ul className="space-y-3">
              {cart.map((line) => {
                const unit = getWalkInPrice(line.location, line.duration)
                const lineTotal = unit * line.quantity
                return (
                  <li
                    key={line.key}
                    className="flex flex-col sm:flex-row sm:items-center gap-3 py-3 border-b border-gray-100 last:border-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-gray-900">
                        {FUNZIA_VENUES[line.location].label} ·{' '}
                        {line.duration === '30min'
                          ? '30 min'
                          : line.duration === '1hr'
                            ? '1 hr'
                            : '2 hr'}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatPrice(unit)} × {line.quantity} ={' '}
                        <span className="font-semibold text-primary">{formatPrice(lineTotal)}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="sr-only" htmlFor={`qty-${line.key}`}>
                        Quantity
                      </label>
                      <input
                        id={`qty-${line.key}`}
                        type="number"
                        min={1}
                        max={25}
                        value={line.quantity}
                        onChange={(e) =>
                          updateLineQuantity(line.key, Number(e.target.value))
                        }
                        className="w-16 px-2 py-1 border border-gray-300 rounded text-center text-sm"
                      />
                      <button
                        type="button"
                        onClick={() => removeLine(line.key)}
                        className="text-sm text-red-600 hover:underline px-2"
                      >
                        Remove
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
          <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center">
            <span className="text-gray-700 font-medium">
              Guests ({guests}) · Subtotal
            </span>
            <span className="text-xl font-bold text-primary">{formatPrice(total)}</span>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-secondary mb-3">Add a package</h3>
          <div>
            <span className="block text-sm font-semibold mb-2 text-gray-700">Location</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {(['ikeja', 'lekki'] as const).map((loc) => (
                <button
                  key={loc}
                  type="button"
                  onClick={() => setPickerLocation(loc)}
                  className={`px-4 py-3 rounded-lg border-2 text-left transition-colors ${
                    pickerLocation === loc
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                  }`}
                >
                  <span className="font-semibold block">{FUNZIA_VENUES[loc].label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4">
            <span className="block text-sm font-semibold mb-2 text-gray-700">Walk-in package</span>
            <div className="space-y-3">
              {(['30min', '1hr', '2hr'] as const).map((duration) => {
                const disabled = duration === '30min' && pickerLocation === 'lekki'
                return (
                  <button
                    key={duration}
                    type="button"
                    disabled={disabled}
                    onClick={() => !disabled && setPickerDuration(duration)}
                    className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                      disabled
                        ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50'
                        : pickerDuration === duration
                          ? 'border-primary bg-primary/5'
                          : 'border-gray-300 hover:border-primary'
                    }`}
                  >
                    <span className="font-semibold text-gray-900 block">
                      {duration === '30min'
                        ? '30 minutes'
                        : duration === '1hr'
                          ? '1 hour'
                          : '2 hours'}
                    </span>
                    <span className="text-sm text-gray-600 mt-1 block">{PACKAGE_BLURBS[duration]}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-end gap-3">
            <div>
              <label htmlFor="addQty" className="block text-sm font-semibold mb-1 text-gray-700">
                How many (this tier)?
              </label>
              <input
                id="addQty"
                type="number"
                min={1}
                max={25}
                value={addQuantity}
                onChange={(e) => setAddQuantity(Number(e.target.value))}
                className="w-24 px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <button
              type="button"
              onClick={addPickerToCart}
              disabled={!isValidWalkInCombo(pickerLocation, pickerDuration)}
              className="bg-secondary text-white px-5 py-2 rounded-lg font-semibold hover:opacity-90 disabled:opacity-50"
            >
              Add to cart
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="date" className="block text-sm font-semibold mb-2 text-gray-700">
            Select date
          </label>
          <DatePicker
            selected={selectedDate}
            onChange={handleDateChange}
            minDate={minDate}
            dateFormat="MMMM d, yyyy"
            placeholderText="Select a date"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
            wrapperClassName="w-full"
          />
          <input type="hidden" {...register('date')} />
          {errors.date && (
            <p className="mt-1 text-sm text-red-600">{errors.date.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="time" className="block text-sm font-semibold mb-2 text-gray-700">
            Select time
          </label>
          <select
            id="time"
            {...register('time')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="">Select a time</option>
            {timeSlots.map((time) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
          {errors.time && (
            <p className="mt-1 text-sm text-red-600">{errors.time.message}</p>
          )}
        </div>

        <div className="border-t pt-6">
          <h3 className="text-xl font-semibold mb-4 text-secondary">Your details</h3>

          <div className="space-y-4">
            <div>
              <label htmlFor="customerName" className="block text-sm font-semibold mb-2 text-gray-700">
                Full name
              </label>
              <input
                type="text"
                id="customerName"
                {...register('customerName')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your full name"
              />
              {errors.customerName && (
                <p className="mt-1 text-sm text-red-600">{errors.customerName.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="customerEmail" className="block text-sm font-semibold mb-2 text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="customerEmail"
                {...register('customerEmail')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your email"
              />
              {errors.customerEmail && (
                <p className="mt-1 text-sm text-red-600">{errors.customerEmail.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="customerPhone" className="block text-sm font-semibold mb-2 text-gray-700">
                Phone
              </label>
              <input
                type="tel"
                id="customerPhone"
                {...register('customerPhone')}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Enter your phone number"
              />
              {errors.customerPhone && (
                <p className="mt-1 text-sm text-red-600">{errors.customerPhone.message}</p>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || total <= 0 || cart.length === 0}
          className="w-full bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? 'Processing...'
            : `Pay ${formatPrice(total)} for ${guests} guest${guests === 1 ? '' : 's'}`}
        </button>
      </form>
    </div>
  )
}
