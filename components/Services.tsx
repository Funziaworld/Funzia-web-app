import ServiceCard from "./ServiceCard";
import { funziaWhatsAppHref } from "@/lib/venues";

export default function Services() {
  const services = [
    {
      title: "30 minutes walk-in",
      description:
        "Unlimited indoor games (VR excluded). Ikeja only. ₦10,950 per person.",
      buttonText: "Book this package",
      href: "/booking?duration=30min&location=ikeja",
      imageSrc: "/images/arcade.jpg",
    },
    {
      title: "1 hour walk-in",
      description:
        "Unlimited indoor games plus 1× 9D VR view. Ikeja & Lekki. ₦15,950 per person.",
      buttonText: "Book this package",
      href: "/booking?duration=1hr",
      imageSrc: "/images/vr.jpeg",
    },
    {
      title: "2 hours walk-in",
      description:
        "Unlimited indoor games, 1× 360 VR view, 1× Gun VR. Ikeja & Lekki. ₦25,500 per person.",
      buttonText: "Book this package",
      href: "/booking?duration=2hr",
      imageSrc: "/images/fun_rides.jpeg",
    },
    {
      title: "Birthdays & private events",
      description:
        "Birthday party packages: send your request on WhatsApp with your details. We also host private and corporate events.",
      buttonText: "Message on WhatsApp",
      href: funziaWhatsAppHref(
        "Hi Funzia! I’d like to enquire about a birthday / party package.",
      ),
      imageSrc: "/images/hero.jpg",
    },
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-center mb-4 text-secondary">
          Walk-in & events
        </h2>
        <p className="text-center text-gray-600 max-w-2xl mx-auto mb-12">
          We offer time blocks, not coins per game. Book walk-in packages
          online; for birthday packages, reach us on WhatsApp.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <ServiceCard key={index} {...service} />
          ))}
        </div>
      </div>
    </section>
  );
}
