import ServiceCard from './ServiceCard'

export default function Services() {
  const services = [
    {
      title: 'Arcade',
      description: 'Experience classic gaming with our PlayStation arcade machines. Perfect for friends and family!',
      buttonText: 'BOOK A SESSION',
      href: '/booking?service=Arcade',
      imageSrc: '/images/arcade.jpg',
    },
    {
      title: 'VR',
      description: 'Immerse yourself in virtual reality with our VR goggles. Experience gaming like never before!',
      buttonText: 'BOOK A SESSION',
      href: '/booking?service=VR',
      imageSrc: '/images/vr.jpg',
    },
    {
      title: 'The Ball Pit',
      description: 'Get lost in the endless fun of our ball pit!',
      buttonText: 'BOOK NOW',
      href: '/booking?service=The Ball Pit',
      imageSrc: '/images/hero.jpg',
    },
    {
      title: 'Fun Rides',
      description: 'Show your racing talents in our bumper carts',
      buttonText: 'BOOK A RIDE',
      href: '/booking?service=Fun Rides',
      imageSrc: '/images/fun_rides.jpg',
    },
  ]

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-12 text-secondary">
          Our Services
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </div>
      </div>
    </section>
  )
}
