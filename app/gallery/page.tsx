export default function Gallery() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-12 text-secondary">Gallery</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Placeholder for gallery images */}
        {[1, 2, 3, 4, 5, 6].map((item) => (
          <div
            key={item}
            className="aspect-square bg-gray-200 rounded-lg flex items-center justify-center"
          >
            <span className="text-gray-400">Image {item}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
