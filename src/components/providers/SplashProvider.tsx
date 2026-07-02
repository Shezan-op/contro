"use client";

import { useEffect, useState } from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";

export function SplashProvider({ children }: { children: React.ReactNode }) {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const hasSeenSplash = sessionStorage.getItem("contro_seen_splash");
    if (hasSeenSplash) {
      setShowSplash(false);
    } else {
      const timer = setTimeout(() => {
        sessionStorage.setItem("contro_seen_splash", "true");
        setShowSplash(false);
      }, 1500); // Wait for the animation to play fully
      return () => clearTimeout(timer);
    }
  }, []);

  if (!showSplash) {
    return <>{children}</>;
  }

  const text = "CONTRO";
  const tagline = "Where Your Work Lives";

  return (
    <LazyMotion features={domAnimation}>
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--background)] text-[var(--text)] font-sans">
        <div className="flex flex-col items-center">
          {/* Logo Container */}
          <div className="relative text-6xl md:text-8xl font-bold tracking-widest uppercase mb-6 flex">
            {text.split("").map((char, index) => (
              <div key={index} className="relative">
                {/* Static Outline */}
                <span 
                  className="block"
                  style={{ WebkitTextStroke: "1px var(--muted)", color: "transparent" }}
                >
                  {char}
                </span>

                {/* Animated Fill */}
                <m.span
                  className="absolute top-0 left-0 text-[var(--text)] overflow-hidden"
                  initial={{ clipPath: "inset(0 100% 0 0)" }}
                  animate={{ clipPath: "inset(0 0% 0 0)" }}
                  transition={{
                    duration: 0.15,
                    ease: "linear",
                    delay: index * 0.08,
                  }}
                >
                  {char}
                </m.span>
              </div>
            ))}
          </div>

          {/* Tagline Typewriter Effect */}
          <div className="text-[var(--muted)] text-sm md:text-base tracking-wide font-medium flex">
            {tagline.split("").map((char, index) => (
              <m.span
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{
                  duration: 0.02,
                  delay: (text.length * 0.08) + (index * 0.02),
                }}
              >
                {char === " " ? "\u00A0" : char}
              </m.span>
            ))}
          </div>
        </div>
      </div>
    </LazyMotion>
  );
}
