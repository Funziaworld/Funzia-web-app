import { Booking } from '@/types/booking'
import { formatPrice } from '@/lib/pricing'
import { FUNZIA_VENUES } from '@/lib/venues'
import Link from 'next/link'

interface BookingConfirmationProps {
  booking: Booking
}

export default function BookingConfirmation({ booking }: BookingConfirmationProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <svg
            className="w-8 h-8 text-green-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h1 className="text-3xl font-bold text-secondary mb-2">Booking Confirmed!</h1>
        <p className="text-gray-600">
          Your booking has been {booking.paymentStatus === 'paid' ? 'confirmed' : 'received'}
        </p>
      </div>

      <div className="space-y-6">
        {/* Payment Status */}
        <div className={`p-4 rounded-lg border-2 ${getStatusColor(booking.paymentStatus)}`}>
          <div className="flex justify-between items-center">
            <span className="font-semibold">Payment Status:</span>
            <span className="font-bold uppercase">{booking.paymentStatus}</span>
          </div>
        </div>

        {/* Booking Details */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-secondary">Booking Details</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Booking ID:</span>
              <span className="font-semibold">{booking.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Package:</span>
              <span className="font-semibold text-right max-w-[60%]">
                {booking.service === 'Walk-in Package'
                  ? 'Walk-in time block'
                  : booking.service}
              </span>
            </div>
            {booking.location && (
              <div className="flex justify-between">
                <span className="text-gray-600">Location:</span>
                <span className="font-semibold text-right max-w-[60%]">
                  {FUNZIA_VENUES[booking.location].label}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-gray-600">Duration:</span>
              <span className="font-semibold">
                {booking.duration === '30min' ? '30 minutes' : booking.duration === '1hr' ? '1 hour' : '2 hours'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-semibold">{formatDate(booking.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time:</span>
              <span className="font-semibold">{booking.time}</span>
            </div>
            <div className="flex justify-between border-t pt-3 mt-3">
              <span className="text-gray-600">Amount Paid:</span>
              <span className="font-bold text-primary text-lg">{formatPrice(booking.amount)}</span>
            </div>
          </div>
        </div>

        {/* Customer Information */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-secondary">Your Information</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-semibold">{booking.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-semibold">{booking.customerEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className="font-semibold">{booking.customerPhone}</span>
            </div>
          </div>
        </div>

        {/* Payment Reference */}
        {booking.paymentReference && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center">
              <span className="text-blue-700 font-semibold">Payment Reference:</span>
              <span className="text-blue-900 font-mono text-sm">{booking.paymentReference}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <Link
            href="/"
            className="flex-1 bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors text-center"
          >
            Back to Home
          </Link>
          <Link
            href="/booking"
            className="flex-1 bg-gray-200 text-gray-800 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors text-center"
          >
            Book Another Session
          </Link>
        </div>

        {/* Important Note */}
        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Important:</strong> Please arrive 10 minutes before your scheduled time. 
            If you have any questions, contact us at{' '}
            <a href="tel:09067731584" className="underline font-semibold">
              09067731584
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
