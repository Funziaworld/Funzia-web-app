import BookingForm from '@/components/BookingForm'

export const metadata = {
  title: 'Book a Session - Funzia World',
  description: 'Book your session at Funzia World - Lagos Bumper Spot',
}

export default function BookingPage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <BookingForm />
    </div>
  )
}
