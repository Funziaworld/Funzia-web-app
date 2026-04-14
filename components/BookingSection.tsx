import Link from 'next/link'
import { FUNZIA_VENUES, funziaWhatsAppHref } from '@/lib/venues'

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
        <h2 className="text-4xl font-bold text-center mb-12 text-secondary">Booking Options</h2>
        <div className="max-w-4xl mx-auto">
          <div className="bg-primary text-white rounded-lg p-6 mb-8 space-y-4">
            <h3 className="text-2xl font-semibold">Walk-in packages (time blocks)</h3>
            <p className="text-white/95 text-sm leading-relaxed">
              We sell time blocks, not coins per game. We open from 10:00 for walk-in packages. Prices
              are per gamer / person.
            </p>
            <ul className="list-disc list-inside space-y-2 text-sm md:text-base">
              <li>
                <strong>30 minutes</strong> — unlimited indoor games (VR excluded), ₦10,950 —{' '}
                <strong>Ikeja only</strong>
              </li>
              <li>
                <strong>1 hour</strong> — unlimited indoors + 1× 9D VR view, ₦15,950 — Ikeja & Lekki
              </li>
              <li>
                <strong>2 hours</strong> — unlimited indoors + 1× 360 VR + 1× Gun VR, ₦25,500 — Ikeja
                & Lekki
              </li>
            </ul>
            <div className="text-sm border-t border-white/30 pt-4 space-y-1">
              <p className="font-semibold">Locations</p>
              <p>{FUNZIA_VENUES.ikeja.addressLine}</p>
              <p>{FUNZIA_VENUES.lekki.addressLine}</p>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
            <h3 className="text-xl font-semibold mb-2 text-secondary">Birthday party packages</h3>
            <p className="text-gray-700 mb-4">
              Send your request via WhatsApp with your party details. For other bespoke packages and
              pricing, call{' '}
              <a href="tel:09067731584" className="text-primary font-semibold underline">
                09067731584
              </a>
              .
            </p>
            <a
              href={funziaWhatsAppHref(
                'Hi Funzia! I’d like to enquire about a birthday party package. Here are my details:'
              )}
              className="inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              WhatsApp us
            </a>
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
              Book walk-in play online
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
