import Image from 'next/image'

const galleryImages: { src: string; alt: string }[] = [
  { src: '/images/gallery_1.jpeg', alt: 'Funzia World gallery' },
  { src: '/images/arcade.jpg', alt: 'PlayStation arcade machines' },
  { src: '/images/vr.jpg', alt: 'VR gaming experience' },
  { src: '/images/vr.jpeg', alt: 'Virtual reality at Funzia World' },
  { src: '/images/fun_rides.jpeg', alt: 'Bumper carts and fun rides' },
  { src: '/images/gallery_2.jpeg', alt: 'Funzia World gallery' },
]

export default function Gallery() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-12 text-secondary">Gallery</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {galleryImages.map((item, index) => (
          <div
            key={`${item.src}-${index}`}
            className="relative aspect-square rounded-lg overflow-hidden bg-gray-100 shadow-md"
          >
            <Image
              src={item.src}
              alt={item.alt}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  )
}
