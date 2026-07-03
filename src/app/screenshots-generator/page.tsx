"use client";

import React, { useState, useEffect, useRef } from "react";
import { toPng } from "html-to-image";

// === Constants ===

const IPHONE_SIZES = [
  { label: '6.9" iPhone', w: 1320, h: 2868 },
  { label: '6.5" iPhone', w: 1284, h: 2778 },
  { label: '6.1" iPhone', w: 1125, h: 2436 },
] as const;

const MK_RATIO = 1022 / 2082;
const MK_W = 1022; const MK_H = 2082;
const SC_L  = (52   / MK_W) * 100;
const SC_T  = (46   / MK_H) * 100;
const SC_W  = (918  / MK_W) * 100;
const SC_H  = (1990 / MK_H) * 100;
const SC_RX = (126  / 918)  * 100;
const SC_RY = (126  / 1990) * 100;

function phoneW(cW: number, cH: number, clamp = 0.84) {
  return Math.min(clamp, 0.72 * (cH / cW) * MK_RATIO);
}

// === Image Preloading ===
const IMAGE_PATHS = [
  "/mockup.png",
  "/contro-images/mobile-dashboard.png",
  "/contro-images/mobile-writer.png",
  "/contro-images/mobile-projects.png",
  "/contro-images/mobile-tasks.png",
  "/contro-images/mobile-inventory.png",
  "/contro-images/mobile-leadmagnets.png"
];

const imageCache: Record<string, string> = {};

async function preloadAllImages() {
  await Promise.all(IMAGE_PATHS.map(async (path) => {
    try {
      const resp = await fetch(path);
      const blob = await resp.blob();
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      imageCache[path] = dataUrl;
    } catch (e) {
      console.warn("Failed to load image", path, e);
    }
  }));
}

function img(path: string): string {
  return imageCache[path] || path;
}

// === Components ===

function Phone({ src, alt, style }: { src: string; alt: string; style?: React.CSSProperties }) {
  return (
    <div style={{ position: "relative", aspectRatio: `${MK_W}/${MK_H}`, ...style }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={img("/mockup.png")} alt="" style={{ display: "block", width: "100%", height: "100%" }} draggable={false} />
      <div style={{
        position: "absolute", zIndex: 10, overflow: "hidden",
        left: `${SC_L}%`, top: `${SC_T}%`, width: `${SC_W}%`, height: `${SC_H}%`,
        borderRadius: `${SC_RX}% / ${SC_RY}%`,
      }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={img(src)} alt={alt} style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }} draggable={false} />
      </div>
    </div>
  );
}

function Caption({ cW, label, headline, dark = false }: { cW: number; label: string; headline: React.ReactNode; dark?: boolean }) {
  return (
    <div style={{ textAlign: "center", color: dark ? "#FFFFFF" : "#121212", paddingTop: cW * 0.15, paddingLeft: cW * 0.08, paddingRight: cW * 0.08 }}>
      <div style={{ fontSize: cW * 0.03, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", opacity: 0.6, marginBottom: cW * 0.02 }}>
        {label}
      </div>
      <div style={{ fontSize: cW * 0.1, fontWeight: 800, lineHeight: 0.95, letterSpacing: "-0.03em" }}>
        {headline}
      </div>
    </div>
  );
}

// === Slide Factories ===

type SlideProps = { cW: number; cH: number };
type SlideDef   = { id: string; component: (p: SlideProps) => React.ReactNode };

function makeHeroSlide(): SlideDef {
  return {
    id: "01-hero",
    component: ({ cW, cH }) => {
      const fw = phoneW(cW, cH) * 100;
      return (
        <div style={{ width: "100%", height: "100%", position: "relative", background: "linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)", overflow: "hidden" }}>
          <Caption cW={cW} label="CONTRO" headline={<>Take control of<br/>your content.</>} />
          <Phone
            src="/contro-images/mobile-dashboard.png"
            alt="Dashboard"
            style={{ position: "absolute", bottom: 0, width: `${fw}%`, left: "50%", transform: "translateX(-50%) translateY(10%)" }}
          />
        </div>
      );
    },
  };
}

function makeWriteSlide(): SlideDef {
  return {
    id: "02-write",
    component: ({ cW, cH }) => {
      const fw = phoneW(cW, cH, 0.9) * 100;
      return (
        <div style={{ width: "100%", height: "100%", position: "relative", background: "#0F172A", overflow: "hidden" }}>
          <Caption cW={cW} label="DISTRACTION FREE" headline={<>Write at the<br/>speed of thought.</>} dark />
          <Phone
            src="/contro-images/mobile-writer.png"
            alt="Writer"
            style={{ position: "absolute", bottom: 0, width: `${fw}%`, right: "-10%", transform: "translateY(5%) rotate(-5deg)" }}
          />
        </div>
      );
    },
  };
}

function makeOrganizeSlide(): SlideDef {
  return {
    id: "03-organize",
    component: ({ cW, cH }) => {
      const fw = phoneW(cW, cH) * 100;
      return (
        <div style={{ width: "100%", height: "100%", position: "relative", background: "linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)", overflow: "hidden" }}>
          <Caption cW={cW} label="WORKSPACES" headline={<>Keep your<br/>projects clean.</>} />
          <Phone
            src="/contro-images/mobile-projects.png"
            alt="Projects"
            style={{ position: "absolute", bottom: 0, width: `${fw}%`, left: "-5%", transform: "translateY(8%) rotate(3deg)" }}
          />
        </div>
      );
    },
  };
}

function makeTasksSlide(): SlideDef {
  return {
    id: "04-tasks",
    component: ({ cW, cH }) => {
      const fw = phoneW(cW, cH) * 100;
      return (
        <div style={{ width: "100%", height: "100%", position: "relative", background: "linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 100%)", overflow: "hidden" }}>
          <Caption cW={cW} label="ACTIONABLE" headline={<>Turn ideas into<br/>next steps.</>} />
          <Phone
            src="/contro-images/mobile-tasks.png"
            alt="Tasks"
            style={{ position: "absolute", bottom: 0, width: `${fw}%`, left: "50%", transform: "translateX(-50%) translateY(12%)" }}
          />
        </div>
      );
    },
  };
}

function makeInventorySlide(): SlideDef {
  return {
    id: "05-inventory",
    component: ({ cW, cH }) => {
      const fw = phoneW(cW, cH, 0.9) * 100;
      return (
        <div style={{ width: "100%", height: "100%", position: "relative", background: "#18181B", overflow: "hidden" }}>
          <Caption cW={cW} label="ASSET BANK" headline={<>Write once.<br/>Deploy endlessly.</>} dark />
          <Phone
            src="/contro-images/mobile-inventory.png"
            alt="Inventory"
            style={{ position: "absolute", bottom: 0, width: `${fw}%`, left: "50%", transform: "translateX(-50%) translateY(8%)" }}
          />
        </div>
      );
    },
  };
}

const SLIDES = [
  makeHeroSlide(),
  makeWriteSlide(),
  makeOrganizeSlide(),
  makeTasksSlide(),
  makeInventorySlide(),
];

// === Main Component ===

export default function ScreenshotsGenerator() {
  const [ready, setReady] = useState(false);
  const [sizeIdx, setSizeIdx] = useState(0);
  const [exporting, setExporting] = useState<string | null>(null);
  
  const exportRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    preloadAllImages().then(() => setReady(true));
  }, []);

  if (!ready) return <div style={{ padding: 40, fontFamily: "sans-serif" }}>Loading assets...</div>;

  const currentSize = IPHONE_SIZES[sizeIdx];

  async function captureSlide(el: HTMLElement, w: number, h: number): Promise<string> {
    el.style.left = "0px";
    el.style.opacity = "1";
    el.style.zIndex = "-1";

    const opts = { width: w, height: h, pixelRatio: 1, cacheBust: true };
    await toPng(el, opts);
    const dataUrl = await toPng(el, opts);

    el.style.left = "-9999px";
    el.style.opacity = "";
    el.style.zIndex = "";
    return dataUrl;
  }

  async function exportAll() {
    for (let i = 0; i < SLIDES.length; i++) {
      setExporting(`${i + 1}/${SLIDES.length}`);
      const el = exportRefs.current[i];
      if (!el) continue;
      const dataUrl = await captureSlide(el, currentSize.w, currentSize.h);
      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `${SLIDES[i].id}-${currentSize.w}x${currentSize.h}.png`;
      a.click();
      await new Promise(r => setTimeout(r, 300));
    }
    setExporting(null);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f3f4f6", position: "relative", overflowX: "hidden", fontFamily: "sans-serif" }}>
      
      {/* Toolbar */}
      <div style={{ position: "sticky", top: 0, zIndex: 50, background: "white", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center" }}>
        <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 16, padding: "12px 20px" }}>
          <span style={{ fontWeight: 700, fontSize: 16 }}>Contro Screenshots</span>
          <select value={sizeIdx} onChange={e => setSizeIdx(Number(e.target.value))} style={{ padding: "6px 12px", borderRadius: 6, border: "1px solid #ccc" }}>
            {IPHONE_SIZES.map((s, i) => <option key={i} value={i}>{s.label} ({s.w}x{s.h})</option>)}
          </select>
        </div>
        <div style={{ padding: "12px 20px", borderLeft: "1px solid #e5e7eb" }}>
          <button onClick={exportAll} disabled={!!exporting} style={{ background: exporting ? "#93c5fd" : "#2563eb", color: "white", padding: "8px 24px", borderRadius: 8, fontWeight: 600, border: "none", cursor: exporting ? "default" : "pointer" }}>
            {exporting ? `Exporting ${exporting}...` : "Export All"}
          </button>
        </div>
      </div>

      {/* Grid */}
      <div style={{ padding: 40, display: "flex", flexWrap: "wrap", gap: 40, justifyContent: "center" }}>
        {SLIDES.map((slide, i) => (
          <div key={slide.id} style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: "#6b7280" }}>Slide {i + 1}: {slide.id}</div>
            
            {/* Preview Box */}
            <div style={{ 
              width: 250, 
              height: 250 * (currentSize.h / currentSize.w),
              position: "relative",
              overflow: "hidden",
              borderRadius: 16,
              boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
              transformOrigin: "top left"
            }}>
              <div style={{
                width: currentSize.w,
                height: currentSize.h,
                transform: `scale(${250 / currentSize.w})`,
                transformOrigin: "top left"
              }}>
                <slide.component cW={currentSize.w} cH={currentSize.h} />
              </div>
            </div>

            {/* Export DOM (offscreen) */}
            <div 
              ref={(el) => { exportRefs.current[i] = el; }} 
              style={{ position: "absolute", left: "-9999px", width: currentSize.w, height: currentSize.h, overflow: "hidden" }}
            >
              <slide.component cW={currentSize.w} cH={currentSize.h} />
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
