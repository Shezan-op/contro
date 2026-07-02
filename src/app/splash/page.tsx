"use client";

import { useEffect } from "react";
import { LazyMotion, domAnimation, m } from "framer-motion";
import { useRouter } from "next/navigation";

export default function SplashPage() {
  const router = useRouter();

  const text = "CONTRO";
  const tagline = "Where Your Work Lives";

  useEffect(() => {
    sessionStorage.setItem("contro_seen_splash", "true");
  }, []);

  useEffect(() => {
    // Faster animation time calculation:
    // Text wipe: text.length * 0.08s
    // Tagline fade: tagline.length * 0.02s
    // Redirect after 1000ms.
    const redirectTimer = setTimeout(() => {
      router.replace("/login");
    }, 1000);
    return () => clearTimeout(redirectTimer);
  }, [router]);

  return (
    <LazyMotion features={domAnimation}>
    <div className="flex flex-col items-center justify-center min-h-screen bg-[var(--background)] text-[var(--text)] font-sans">
      
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
