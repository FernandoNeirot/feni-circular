"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import Link from "next/link";
import Image from "next/image";

const images = ["/images/hero-1.jpg", "/images/hero-2.jpg", "/images/hero-3.jpg"];

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="relative h-[60vh] md:h-[70vh] overflow-hidden rounded-3xl mx-4 md:mx-8 mt-6">
      <div className="relative h-full">
        <Image
          key={images[currentIndex]}
          src={images[currentIndex]}
          alt={`Slide ${currentIndex + 1}`}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, 90vw"
          priority={currentIndex === 0}
          fetchPriority={currentIndex === 0 ? "high" : "auto"}
          loading={currentIndex === 0 ? "eager" : "lazy"}
          quality={60}
        />
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/25 to-transparent" />
      </div>

      <div className="absolute inset-0 flex items-end justify-center pb-16 md:pb-20">
        <div className="text-center text-white px-6">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-lg">
            Ropa Infantil Circular
          </h1>
          <p className="text-lg md:text-xl mb-6 drop-shadow-lg">
            Segunda vida, calidad excepcional
          </p>
          <Button size="lg" variant="secondary" className="shadow-lg" asChild>
            <Link href="/buscar">Ver Productos</Link>
          </Button>
        </div>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
        onClick={goToPrevious}
        aria-label="Diapositiva anterior"
      >
        <ChevronLeft className="h-6 w-6" aria-hidden />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
        onClick={goToNext}
        aria-label="Diapositiva siguiente"
      >
        <ChevronRight className="h-6 w-6" aria-hidden />
      </Button>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
        {images.map((_, index) => (
          <button
            key={index}
            type="button"
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex ? "bg-white w-8" : "bg-white/50 hover:bg-white/75"
            }`}
            onClick={() => setCurrentIndex(index)}
            aria-label={`Ir a la diapositiva ${index + 1} de ${images.length}`}
            aria-current={index === currentIndex ? "true" : undefined}
          />
        ))}
      </div>
    </div>
  );
}
