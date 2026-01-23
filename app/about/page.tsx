export default function About() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-12 text-secondary">About Us</h1>
      <div className="max-w-3xl mx-auto space-y-6 text-lg">
        <p>
          Welcome to Lagos Bumper spot with a 360 degree ride like no where else! 
          Funzia world is the one stop fun for Spin, Thrill & Fun.
        </p>
        <p>
          There is something for everyone. Let's play!!!!
        </p>
        <div className="mt-8">
          <h2 className="text-2xl font-semibold mb-4 text-primary">Our Services</h2>
          <ul className="list-disc list-inside space-y-2">
            <li>Arcade & VR Gaming</li>
            <li>The Ball Pit</li>
            <li>Fun Rides & Bumper Carts</li>
            <li>Private Events & Bookings</li>
            <li>Corporate Team Building</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
