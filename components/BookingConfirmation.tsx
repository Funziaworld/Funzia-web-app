import { Booking, BookingLocation } from '@/types/booking'
import { formatPrice, getWalkInPrice } from '@/lib/pricing'
import { FUNZIA_VENUES } from '@/lib/venues'
import Link from 'next/link'

interface BookingConfirmationProps {
  bookings: Booking[]
}

function durationLabel(d: Booking['duration']): string {
  if (d === '30min') return '30 minutes'
  if (d === '1hr') return '1 hour'
  return '2 hours'
}

function summarizeLines(bookings: Booking[]) {
  const map = new Map<
    string,
    { count: number; location: BookingLocation; duration: Booking['duration'] }
  >()
  for (const b of bookings) {
    const loc: BookingLocation = b.location ?? 'ikeja'
    const key = `${loc}|${b.duration}`
    const prev = map.get(key)
    if (prev) prev.count += 1
    else map.set(key, { count: 1, location: loc, duration: b.duration })
  }
  return Array.from(map.values())
}

export default function BookingConfirmation({ bookings }: BookingConfirmationProps) {
  const primary = bookings[0]
  if (!primary) return null

  const totalPaid = bookings.reduce((s, b) => s + b.amount, 0)
  const lines = summarizeLines(bookings)

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
          {bookings.length > 1
            ? `${bookings.length} guest slots have been ${primary.paymentStatus === 'paid' ? 'confirmed' : 'received'}`
            : `Your booking has been ${primary.paymentStatus === 'paid' ? 'confirmed' : 'received'}`}
        </p>
      </div>

      <div className="space-y-6">
        <div className={`p-4 rounded-lg border-2 ${getStatusColor(primary.paymentStatus)}`}>
          <div className="flex justify-between items-center">
            <span className="font-semibold">Payment Status:</span>
            <span className="font-bold uppercase">{primary.paymentStatus}</span>
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-secondary">Booking details</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Package:</span>
              <span className="font-semibold text-right max-w-[60%]">Walk-in time block</span>
            </div>

            <div className="border-t border-gray-200 pt-3 mt-2">
              <p className="text-sm font-semibold text-gray-700 mb-2">Line items</p>
              <ul className="space-y-2 text-sm">
                {lines.map((line) => {
                  const unit = getWalkInPrice(line.location, line.duration)
                  const sub = unit * line.count
                  return (
                    <li key={`${line.location}-${line.duration}`} className="flex justify-between gap-2">
                      <span className="text-gray-700">
                        {line.count}× {FUNZIA_VENUES[line.location].label} ·{' '}
                        {durationLabel(line.duration)}
                      </span>
                      <span className="font-medium shrink-0">{formatPrice(sub)}</span>
                    </li>
                  )
                })}
              </ul>
            </div>

            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-semibold">{formatDate(primary.date)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Time:</span>
              <span className="font-semibold">{primary.time}</span>
            </div>
            <div className="flex justify-between border-t pt-3 mt-3">
              <span className="text-gray-600">Total paid:</span>
              <span className="font-bold text-primary text-lg">{formatPrice(totalPaid)}</span>
            </div>
            {bookings.length > 1 && (
              <p className="text-xs text-gray-500 pt-1">
                Reference IDs: {bookings.map((b) => b.id).join(', ')}
              </p>
            )}
            {bookings.length === 1 && (
              <div className="flex justify-between text-sm pt-1">
                <span className="text-gray-600">Booking ID:</span>
                <span className="font-mono text-xs">{primary.id}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-6 rounded-lg">
          <h2 className="text-xl font-semibold mb-4 text-secondary">Your information</h2>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Name:</span>
              <span className="font-semibold">{primary.customerName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Email:</span>
              <span className="font-semibold">{primary.customerEmail}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Phone:</span>
              <span className="font-semibold">{primary.customerPhone}</span>
            </div>
          </div>
        </div>

        {primary.paymentReference && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <div className="flex justify-between items-center">
              <span className="text-blue-700 font-semibold">Payment reference:</span>
              <span className="text-blue-900 font-mono text-sm">{primary.paymentReference}</span>
            </div>
          </div>
        )}

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

        <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
          <p className="text-sm text-yellow-800">
            <strong>Important:</strong> Please arrive 10 minutes before your scheduled time. If you
            have any questions, contact us at{' '}
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
