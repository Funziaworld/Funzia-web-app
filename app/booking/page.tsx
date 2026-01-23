import { Suspense } from 'react'
import BookingForm from '@/components/BookingForm'

export const metadata = {
  title: 'Book a Session - Funzia World',
  description: 'Book your session at Funzia World - Lagos Bumper Spot',
}

function BookingFormFallback() {
  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-8"></div>
        <div className="space-y-6">
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  )
}

export default function BookingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <Suspense fallback={<BookingFormFallback />}>
        <BookingForm />
      </Suspense>
    </div>
  )
}
