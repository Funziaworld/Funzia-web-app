import Link from "next/link";

export default function Hero() {
  return (
    <section className="relative text-white py-20 md:py-32 overflow-hidden">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/images/gallery_2.jpeg')" }}
        aria-hidden
      />
      <div className="absolute inset-0 bg-black/40 z-0" aria-hidden />
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6">Funzia World</h1>
          <p className="text-xl md:text-2xl mb-8">
            Welcome to Lagos Bumper spot with a 360 degree ride like no where
            else!
          </p>
          <p className="text-lg mb-8">
            Funzia world is the one stop fun for Spin, Thrill & Fun. There is
            something for everyone. Let's play!!!!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/booking"
              className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              Book Now
            </Link>
            <Link
              href="/about"
              className="bg-transparent border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
