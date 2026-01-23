'use client'

import Link from 'next/link'

interface MobileMenuProps {
  isOpen: boolean
  links: { href: string; label: string }[]
  pathname: string
}
export default function MobileMenu({ isOpen, links, pathname }: MobileMenuProps) {
  if (!isOpen) return null

  return (
    <div className="md:hidden bg-white border-t">
      <div className="px-4 py-4 space-y-4">
        {links.map((link) => {
          const isActive = pathname === link.href
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block transition-colors font-medium py-2 ${
                isActive
                  ? 'text-primary'
                  : 'text-gray-700 hover:text-primary'
              }`}
            >
              {link.label}
            </Link>
          )
        })}
      </div>
    </div>
  )
}
