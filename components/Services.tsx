import ServiceCard from './ServiceCard'

export default function Services() {
  const services = [
    {
      title: 'Arcade & VR',
      description: 'Experience different gaming experience with our virtual reality goggles and PlayStation arcade gaming.',
      buttonText: 'BOOK A SESSION',
      href: '/booking?service=Arcade & VR',
    },
    {
      title: 'The Ball Pit',
      description: 'Get lost in the endless fun of our ball pit!',
      buttonText: 'BOOK NOW',
      href: '/booking?service=The Ball Pit',
    },
    {
      title: 'Fun Rides',
      description: 'Show your racing talents in our bumper carts',
      buttonText: 'BOOK A RIDE',
      href: '/booking?service=Fun Rides',
    },
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-secondary">
          Our Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </div>
      </div>
    </section>
  )
}
