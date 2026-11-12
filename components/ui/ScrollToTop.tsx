"use client";

import React, { useEffect, useState } from "react";
import { ArrowUp } from "lucide-react";

export interface ScrollToTopProps {
  threshold?: number;
  className?: string;
}

export function ScrollToTop({ threshold = 400, className = "" }: ScrollToTopProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShow(window.scrollY > threshold);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [threshold]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (!show) return null;

  return (
    <button
      type="button"
      onClick={scrollToTop}
      className={`fixed bottom-6 right-6 z-50 p-3 rounded-full bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/40 border border-blue-400/30 transition-all duration-200 hover:scale-105 active:scale-95 cursor-pointer animate-in fade-in slide-in-from-bottom-2 ${className}`}
      title="Scroll to top"
      aria-label="Scroll to top"
    >
      <ArrowUp size={18} />
    </button>
  );
}

export default ScrollToTop;
