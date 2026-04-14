'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import type { BookingFormData, BookingLocation, Duration } from '@/types/booking'
import { formatPrice, getWalkInPrice, isValidWalkInCombo } from '@/lib/pricing'
import { useSearchParams } from 'next/navigation'
import { FUNZIA_VENUES, funziaWhatsAppHref } from '@/lib/venues'

const bookingSchema = z
  .object({
    service: z.literal('Walk-in Package'),
    location: z.enum(['ikeja', 'lekki']),
    duration: z.enum(['30min', '1hr', '2hr']),
    date: z.string().min(1, 'Date is required'),
    time: z.string().min(1, 'Time is required'),
    customerName: z.string().min(2, 'Name must be at least 2 characters'),
    customerEmail: z.string().email('Invalid email address'),
    customerPhone: z.string().min(10, 'Phone number must be at least 10 digits'),
  })
  .refine((data) => isValidWalkInCombo(data.location, data.duration), {
    message: 'The 30-minute walk-in package is only available at Ikeja.',
    path: ['duration'],
  })

const PACKAGE_BLURBS: Record<Duration, string> = {
  '30min':
    'Unlimited play on all indoor games except VR. Ikeja only. ₦10,950 per person.',
  '1hr':
    'Unlimited indoor games including 1× 9D VR view. Ikeja & Lekki. ₦15,950 per person.',
  '2hr':
    'Unlimited indoor games, 1× 360 VR view, 1× Gun VR. Ikeja & Lekki. ₦25,500 per person.',
}

export default function BookingForm() {
  const searchParams = useSearchParams()
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      service: 'Walk-in Package',
      location: 'ikeja',
      duration: '30min',
    },
  })

  const selectedLocation = watch('location')
  const selectedDuration = watch('duration')
  const price = getWalkInPrice(selectedLocation, selectedDuration)

  useEffect(() => {
    const durationParam = searchParams?.get('duration')
    const locationParam = searchParams?.get('location')
    if (durationParam && ['30min', '1hr', '2hr'].includes(durationParam)) {
      setValue('duration', durationParam as Duration)
    }
    if (locationParam && ['ikeja', 'lekki'].includes(locationParam)) {
      setValue('location', locationParam as BookingLocation)
    }
  }, [searchParams, setValue])

  useEffect(() => {
    if (selectedLocation === 'lekki' && selectedDuration === '30min') {
      setValue('duration', '1hr')
    }
  }, [selectedLocation, selectedDuration, setValue])

  const timeSlots: string[] = []
  for (let hour = 10; hour < 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      timeSlots.push(
        `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      )
    }
  }

  const onSubmit = async (data: BookingFormData) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/bookings/initiate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          amount: getWalkInPrice(data.location, data.duration),
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
        <strong>10:00</strong> for walk-in packages. Birthday party packages: send your request on{' '}
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

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <input type="hidden" {...register('service')} value="Walk-in Package" />

        <div>
          <span className="block text-sm font-semibold mb-2 text-gray-700">Location</span>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {(['ikeja', 'lekki'] as const).map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setValue('location', loc)}
                className={`px-4 py-3 rounded-lg border-2 text-left transition-colors ${
                  selectedLocation === loc
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                }`}
              >
                <span className="font-semibold block">{FUNZIA_VENUES[loc].label}</span>
                <span
                  className={`text-xs mt-1 block ${selectedLocation === loc ? 'text-white/90' : 'text-gray-500'}`}
                >
                  {FUNZIA_VENUES[loc].addressLine}
                </span>
              </button>
            ))}
          </div>
          <input type="hidden" {...register('location')} />
          {errors.location && (
            <p className="mt-1 text-sm text-red-600">{errors.location.message}</p>
          )}
        </div>

        <div>
          <span className="block text-sm font-semibold mb-2 text-gray-700">Walk-in package</span>
          <div className="space-y-3">
            {(['30min', '1hr', '2hr'] as const).map((duration) => {
              const disabled = duration === '30min' && selectedLocation === 'lekki'
              return (
                <button
                  key={duration}
                  type="button"
                  disabled={disabled}
                  onClick={() => !disabled && setValue('duration', duration)}
                  className={`w-full text-left px-4 py-3 rounded-lg border-2 transition-colors ${
                    disabled
                      ? 'opacity-50 cursor-not-allowed border-gray-200 bg-gray-50'
                      : selectedDuration === duration
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
          <input type="hidden" {...register('duration')} />
          {errors.duration && (
            <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
          )}
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

        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-700">Total (per person):</span>
            <span className="text-2xl font-bold text-primary">{formatPrice(price)}</span>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting || price <= 0}
          className="w-full bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Processing...' : `Pay ${formatPrice(price)}`}
        </button>
      </form>
    </div>
  )
}
