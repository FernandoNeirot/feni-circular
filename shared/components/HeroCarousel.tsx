"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import Link from "next/link";
import Image from "next/image";

const images = ["/images/hero-1.jpg"];

export function HeroCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const hasMultipleImages = images.length > 1;

  useEffect(() => {
    if (!hasMultipleImages) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [hasMultipleImages]);

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  return (
    <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
      <div className="relative isolate h-full">
        {images.map((src, index) => (
          <Image
            key={src}
            src={src}
            alt={`Slide ${index + 1}`}
            fill
            className={`object-cover transition-[opacity,transform] duration-1000 ease-out ${
              index === currentIndex ? "opacity-100 scale-100 z-10" : "opacity-0 scale-105 z-0"
            }`}
            sizes="(max-width: 768px) 100vw, 90vw"
            priority={index === 0}
            fetchPriority={index === 0 ? "high" : "auto"}
            loading={index === 0 ? "eager" : "lazy"}
            quality={60}
          />
        ))}
        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/25 to-transparent pointer-events-none" />
      </div>

      <div className="absolute inset-0 z-10 flex items-end justify-center pb-10 pointer-events-none">
        <div className="pointer-events-auto max-w-3xl px-6 text-center space-y-5 md:space-y-6">
          <Button
            size="lg"
            variant="default"
            className="h-12 md:h-14 px-9 md:px-11 rounded-full text-base md:text-lg font-semibold tracking-wide shadow-[0_10px_36px_rgba(88,28,135,0.55)] hover:shadow-[0_14px_44px_rgba(88,28,135,0.65)] hover:scale-[1.03] active:scale-[0.98] transition-all duration-300 ring-2 ring-white/25"
            asChild
          >
            <Link href="/productos">
              Ver productos
              <ArrowRight className="h-5 w-5" aria-hidden />
            </Link>
          </Button>
        </div>
      </div>

      {hasMultipleImages && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 z-10 -translate-y-1/2 bg-white/80 hover:bg-white"
            onClick={goToPrevious}
            aria-label="Diapositiva anterior"
          >
            <ChevronLeft className="h-6 w-6" aria-hidden />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 z-10 -translate-y-1/2 bg-white/80 hover:bg-white"
            onClick={goToNext}
            aria-label="Diapositiva siguiente"
          >
            <ChevronRight className="h-6 w-6" aria-hidden />
          </Button>

          <div className="absolute bottom-6 left-1/2 z-10 -translate-x-1/2 flex gap-2">
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
        </>
      )}
    </div>
  );
}
