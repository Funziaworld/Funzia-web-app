import Link from 'next/link'

export default function Footer() {
  const navLinks = [
    { href: '/', label: 'Home' },
    { href: '/gallery', label: 'Gallery' },
    { href: '/about', label: 'About Us' },
    { href: '/faq', label: 'FAQ' },
    { href: '/contact', label: 'Contact' },
  ]

  return (
    <footer className="bg-footer text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-2xl font-bold mb-4">Funzia World</h3>
            <p className="text-gray-300">
              Lagos Bumper spot with a 360 degree ride like no where else!
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-300">
              <li>
                <a href="tel:09067731584" className="hover:text-white">
                  M: 0906 773 1584
                </a>
              </li>
              <li>
                <a href="mailto:hello@funziaworld.com" className="hover:text-white">
                  E: hello@funziaworld.com
                </a>
              </li>
              <li>A: Ikeja — The Mix Plaza, 32 Joel Ogunnaike Street, Ikeja GRA</li>
              <li>A: Lekki — 12B Africa Lane, Admiralty Road, Lekki Phase 1</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-600 mt-8 pt-8 text-center text-gray-300">
          <p>&copy; {new Date().getFullYear()} Funzia World. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
