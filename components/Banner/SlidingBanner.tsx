import { useState, useEffect } from "react";
import Image from "next/image";

interface BannerItem {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
}

interface SlidingBannerProps {
  items: BannerItem[];
}

export default function SlidingBanner({ items }: SlidingBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % items.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [items.length]);

  return (
    <div className="relative w-full h-[400px] overflow-hidden rounded-lg">
      {items.map((item, index) => (
        <div
          key={item.id}
          className={`absolute inset-0 transition-opacity duration-500 ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
        >
          <Image
            src={item.imageUrl}
            alt={item.title}
            layout="fill"
            objectFit="cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
            <div className="absolute bottom-0 left-0 p-8">
              <h2 className="text-white text-3xl font-bold mb-2">
                {item.title}
              </h2>
              <p className="text-white/90">{item.description}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
