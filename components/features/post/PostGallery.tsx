import React, { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Download, Maximize2, Check } from "lucide-react";

interface Props {
  images: string[];
  onImageClick?: (index: number) => void;
}

export default function PostGallery({ images, onImageClick }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [downloaded, setDownloaded] = useState(false);

  if (!images || images.length === 0) return null;

  const nextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleDownload = (e: React.MouseEvent) => {
    e.stopPropagation();
    const currentUrl = images[currentIndex];
    try {
      const a = document.createElement("a");
      a.href = currentUrl;
      a.download = `facebook-image-${Date.now()}.jpg`;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 2000);
    } catch {
      window.open(currentUrl, "_blank");
    }
  };

  return (
    <div className="relative group w-full mt-4 h-[450px] overflow-hidden rounded-2xl bg-[#030712] border border-[#1f2937]">
      {/* Active Image */}
      <div
        className="relative w-full h-full cursor-pointer"
        onClick={() => onImageClick?.(currentIndex)}
      >
        <Image
          src={images[currentIndex]}
          alt={`Gallery image ${currentIndex + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 800px"
          className="object-contain"
        />
      </div>

      {/* Top Action Controls Overlay */}
      <div className="absolute top-4 right-4 z-20 flex items-center gap-1.5 opacity-90 group-hover:opacity-100 transition">
        <button
          type="button"
          onClick={handleDownload}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs transition hover:bg-black/90 cursor-pointer shadow-md"
          title="Download photo"
        >
          {downloaded ? <Check size={13} className="text-emerald-400" /> : <Download size={13} />}
        </button>

        <button
          type="button"
          onClick={() => onImageClick?.(currentIndex)}
          className="flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs transition hover:bg-black/90 cursor-pointer shadow-md"
          title="View fullscreen"
        >
          <Maximize2 size={13} />
        </button>

        {images.length > 1 && (
          <div className="bg-black/60 text-xs text-white px-2.5 py-1 rounded-full font-medium backdrop-blur-xs">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>

      {/* Navigation Arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs transition hover:bg-black/80 opacity-0 group-hover:opacity-100 cursor-pointer z-10"
            title="Previous image"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur-xs transition hover:bg-black/80 opacity-0 group-hover:opacity-100 cursor-pointer z-10"
            title="Next image"
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}

      {/* Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/50 px-2.5 py-1.5 rounded-full backdrop-blur-xs z-10">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentIndex(index);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 cursor-pointer ${
                index === currentIndex ? "w-4 bg-blue-500" : "w-1.5 bg-slate-500 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
