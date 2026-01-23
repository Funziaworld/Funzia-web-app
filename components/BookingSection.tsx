import Link from 'next/link'

export default function BookingSection() {
  const bookingTypes = [
    {
      title: 'Private Events',
      items: [
        'Bridal showers',
        'School Fun-day outing',
        'Movie shooting',
        'Dance class',
        'Private events',
        'Football Viewing',
        'Fun Hang Outs',
      ],
    },
    {
      title: 'Corporate Events',
      items: [
        'Departmental team bonding outing',
        'Organizational family outing',
        'Religious Group meeting',
        'Bonding sessions etc',
      ],
    },
  ]

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-secondary">
          Booking Options
        </h2>
        <div className="max-w-4xl mx-auto">
          <div className="bg-primary text-white rounded-lg p-6 mb-8">
            <h3 className="text-2xl font-semibold mb-4">Available Packages</h3>
            <ul className="list-disc list-inside space-y-2 mb-4">
              <li>Exclusive Use of facility booking</li>
              <li>Three House Party Booking</li>
              <li>Small group birthday hand outs</li>
            </ul>
            <p className="text-lg font-semibold">
              Kindly reach out to the Official Funzia line{' '}
              <a href="tel:09067731584" className="underline">
                09067731584
              </a>{' '}
              for further details on prices of packages
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {bookingTypes.map((type, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-xl font-semibold mb-4 text-secondary">{type.title}</h3>
                <ul className="list-disc list-inside space-y-2 text-gray-700">
                  {type.items.map((item, itemIndex) => (
                    <li key={itemIndex}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/booking"
              className="inline-block bg-primary text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-primary-dark transition-colors shadow-lg"
            >
              Book a Session Now
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
