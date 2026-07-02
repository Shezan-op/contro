"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function SplashPage() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;

  const text = "CONTRO";
  const tagline = "Where Your Work Lives";

  return (
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

              {/* Animated Fill (Left to Right wipe per letter, delayed by index) */}
              <motion.span
                className="absolute top-0 left-0 text-[var(--text)] overflow-hidden"
                initial={{ clipPath: "inset(0 100% 0 0)" }}
                animate={{ clipPath: "inset(0 0% 0 0)" }}
                transition={{
                  duration: 0.4,
                  ease: "linear",
                  delay: index * 0.4,
                }}
              >
                {char}
              </motion.span>
            </div>
          ))}
        </div>

        {/* Tagline Typewriter Effect */}
        <div className="text-[var(--muted)] text-sm md:text-base tracking-wide font-medium flex">
          {tagline.split("").map((char, index) => (
            <motion.span
              key={index}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{
                duration: 0.05,
                delay: (text.length * 0.4) + (index * 0.05),
              }}
            >
              {char}
            </motion.span>
          ))}
        </div>
      </div>
    </div>
  );
}
