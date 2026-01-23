import Link from 'next/link'

interface ServiceCardProps {
  title: string
  description: string
  buttonText: string
  href: string
}

export default function ServiceCard({ title, description, buttonText, href }: ServiceCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
      <div className="h-48 bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
        <span className="text-white text-2xl font-bold">{title}</span>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-3 text-secondary">{title}</h3>
        <p className="text-gray-600 mb-4">{description}</p>
        <Link
          href={href}
          className="inline-block bg-primary text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-dark transition-colors"
        >
          {buttonText}
        </Link>
      </div>
    </div>
  )
}
