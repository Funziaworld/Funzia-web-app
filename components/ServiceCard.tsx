import Image from "next/image";
import Link from "next/link";

interface ServiceCardProps {
  title: string;
  description: string;
  buttonText: string;
  href: string;
  imageSrc?: string;
}

export default function ServiceCard({
  title,
  description,
  buttonText,
  href,
  imageSrc,
}: ServiceCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow flex flex-col h-full">
      {imageSrc ? (
        <div className="relative h-48 shrink-0">
          <Image
            src={imageSrc}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
          <div
            className="absolute inset-0 bg-black/40 flex items-center justify-center"
            aria-hidden
          />
          <span className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold text-center px-2">
            {title}
          </span>
        </div>
      ) : (
        <div className="h-48 bg-funzia-gradient-br flex items-center justify-center shrink-0">
          <span className="text-white text-2xl font-bold">{title}</span>
        </div>
      )}
      <div className="p-6 flex flex-col flex-1">
        <h3 className="text-xl font-semibold mb-3 text-secondary">{title}</h3>
        <p className="text-gray-600 mb-4 flex-1">{description}</p>
        {href.startsWith('http') ? (
          <a
            href={href}
            className="inline-block bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-dark transition-colors mt-auto text-center"
            target="_blank"
            rel="noopener noreferrer"
          >
            {buttonText}
          </a>
        ) : (
          <Link
            href={href}
            className="inline-block bg-primary text-white px-6 py-2 rounded-lg font-bold hover:bg-primary-dark transition-colors mt-auto text-center"
          >
            {buttonText}
          </Link>
        )}
      </div>
    </div>
  );
}
