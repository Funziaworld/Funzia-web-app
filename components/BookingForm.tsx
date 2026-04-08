'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { Service, Duration, BookingFormData } from '@/types/booking'
import { getPrice, formatPrice } from '@/lib/pricing'
import { useSearchParams } from 'next/navigation'

const bookingSchema = z.object({
  service: z.enum(['Arcade', 'VR', 'The Ball Pit', 'Fun Rides']),
  duration: z.enum(['30min', '1hr', '2hr']),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  customerName: z.string().min(2, 'Name must be at least 2 characters'),
  customerEmail: z.string().email('Invalid email address'),
  customerPhone: z.string().min(10, 'Phone number must be at least 10 digits'),
})

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
      service: (searchParams?.get('service') as Service) || 'Arcade',
      duration: '30min',
    },
  })

  const selectedService = watch('service')
  const selectedDuration = watch('duration')
  const price = getPrice(selectedService, selectedDuration)

  // Set service from URL parameter
  useEffect(() => {
    const serviceParam = searchParams?.get('service')
    if (serviceParam && ['Arcade', 'VR', 'The Ball Pit', 'Fun Rides'].includes(serviceParam)) {
      setValue('service', serviceParam as Service)
    }
  }, [searchParams, setValue])

  // Generate time slots (9 AM to 6 PM, every 30 minutes)
  const timeSlots = []
  for (let hour = 9; hour < 18; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
      timeSlots.push(timeString)
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
          amount: price,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to initialize booking')
      }

      // Redirect to Paystack payment page
      if (result.authorization_url) {
        window.location.href = result.authorization_url
      } else {
        throw new Error('No payment URL received')
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.')
      setIsSubmitting(false)
    }
  }

  const handleDateChange = (date: Date | null) => {
    setSelectedDate(date)
    if (date) {
      setValue('date', date.toISOString().split('T')[0])
    }
  }

  // Disable past dates
  const minDate = new Date()
  minDate.setHours(0, 0, 0, 0)

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-3xl font-bold text-center mb-8 text-secondary">Book a Session</h2>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Service Selection */}
        <div>
          <label htmlFor="service" className="block text-sm font-semibold mb-2 text-gray-700">
            Select Service
          </label>
          <select
            id="service"
            {...register('service')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="Arcade">Arcade</option>
            <option value="VR">VR</option>
            <option value="The Ball Pit">The Ball Pit</option>
            <option value="Fun Rides">Fun Rides</option>
          </select>
          {errors.service && (
            <p className="mt-1 text-sm text-red-600">{errors.service.message}</p>
          )}
        </div>

        {/* Duration Selection */}
        <div>
          <label htmlFor="duration" className="block text-sm font-semibold mb-2 text-gray-700">
            Select Duration
          </label>
          <div className="grid grid-cols-3 gap-4">
            {(['30min', '1hr', '2hr'] as Duration[]).map((duration) => (
              <button
                key={duration}
                type="button"
                onClick={() => setValue('duration', duration)}
                className={`px-4 py-3 rounded-lg border-2 font-semibold transition-colors ${
                  selectedDuration === duration
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-primary'
                }`}
              >
                {duration === '30min' ? '30 min' : duration === '1hr' ? '1 hour' : '2 hours'}
              </button>
            ))}
          </div>
          {errors.duration && (
            <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
          )}
        </div>

        {/* Date Selection */}
        <div>
          <label htmlFor="date" className="block text-sm font-semibold mb-2 text-gray-700">
            Select Date
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

        {/* Time Selection */}
        <div>
          <label htmlFor="time" className="block text-sm font-semibold mb-2 text-gray-700">
            Select Time
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

        {/* Customer Information */}
        <div className="border-t pt-6">
          <h3 className="text-xl font-semibold mb-4 text-secondary">Your Information</h3>

          <div className="space-y-4">
            <div>
              <label htmlFor="customerName" className="block text-sm font-semibold mb-2 text-gray-700">
                Full Name
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
                Email Address
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
                Phone Number
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

        {/* Price Display */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-700">Total Amount:</span>
            <span className="text-2xl font-bold text-primary">{formatPrice(price)}</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Processing...' : `Pay ${formatPrice(price)}`}
        </button>
      </form>
    </div>
  )
}
