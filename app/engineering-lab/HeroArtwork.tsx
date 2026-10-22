"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { FiLayers, FiCompass, FiGlobe } from "react-icons/fi";

export default function HeroArtwork({ dark }: { dark: boolean }) {
  return (
    <div className="relative flex flex-col items-center lg:items-end justify-center w-full max-w-[480px]">
      {/* Top illustration container */}
      <div className="relative w-full h-[210px] sm:h-[260px] flex items-center justify-center">
        {/* Handwritten Annotation: "From ideas to impact" with curved arrow */}
        <div className="absolute left-2 sm:left-4 top-2 sm:top-4 z-20 pointer-events-none select-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className={`font-handwriting text-xl sm:text-2xl lg:text-3xl leading-[1.05] tracking-wide ${
              dark ? "text-cyan-200/90" : "text-[#8b1a1a]"
            }`}
            style={{ transform: "rotate(-6deg)" }}
          >
            <div>From ideas</div>
            <div className="pl-4">to impact</div>
          </motion.div>

          {/* Organic curved arrow pointing towards the graphic */}
          <svg
            className={`w-14 h-12 sm:w-16 sm:h-14 mt-1 ml-5 overflow-visible ${
              dark ? "text-cyan-300/80" : "text-[#8b1a1a]/85"
            }`}
            viewBox="0 0 80 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 10 8 C 28 20, 52 28, 66 46"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeDasharray="3 3"
            />
            {/* Arrowhead */}
            <path
              d="M 66 46 L 56 44 M 66 46 L 62 36"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* ── Graphic: Dark Mode (Photorealistic Glowing 3D Earth) ── */}
        {dark ? (
          <div className="relative w-[180px] h-[180px] sm:w-[230px] sm:h-[230px] flex items-center justify-center">
            {/* Ambient outer halo glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/25 via-sky-600/20 to-blue-600/30 blur-2xl transform scale-110" />

            {/* Glowing atmosphere ring */}
            <div className="absolute -inset-1 rounded-full border border-cyan-400/30 shadow-[0_0_50px_rgba(56,189,248,0.3)] pointer-events-none z-10" />

            {/* High-res Realistic Earth Render */}
            <div className="relative w-full h-full rounded-full overflow-hidden shadow-[0_0_40px_rgba(56,189,248,0.25)]">
              <Image
                src="/hero/earth-dark.jpg"
                alt="Earth in space"
                fill
                priority
                sizes="(max-width: 640px) 180px, 230px"
                className="object-cover"
              />
            </div>
          </div>
        ) : (
          /* ── Graphic: Light Mode (Photorealistic Mountain Ridge at Sunrise) ── */
          <div className="relative w-[180px] h-[180px] sm:w-[230px] sm:h-[230px] flex items-center justify-center">
            {/* Warm peach sun glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#f8d7b8] to-[#e8af84]/40 blur-xl opacity-70" />

            {/* High-res Realistic Mountain Landscape Render */}
            <div className="relative w-full h-full rounded-2xl sm:rounded-3xl overflow-hidden border border-[#8b1a1a]/15 shadow-[0_8px_30px_rgba(139,26,26,0.1)]">
              <Image
                src="/hero/mountain-light.jpg"
                alt="Mountain sunrise landscape"
                fill
                priority
                sizes="(max-width: 640px) 180px, 230px"
                className="object-cover"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── 3 Stat Pills Row ── */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={`w-full grid grid-cols-3 gap-2 p-2 sm:p-2.5 rounded-2xl border backdrop-blur-md transition-colors duration-300 ${
          dark
            ? "bg-[#070e1c]/85 border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.35)]"
            : "bg-[#fbf5eb]/90 border-[#8b1a1a]/15 shadow-[0_6px_24px_rgba(139,26,26,0.06)]"
        }`}
      >
        {/* Pill 1: 03 Projects */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 p-1 sm:p-1.5 rounded-xl">
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 text-xs sm:text-sm ${
              dark
                ? "bg-cyan-500/15 text-cyan-300 border border-cyan-400/25"
                : "bg-[#8b1a1a]/10 text-[#8b1a1a] border border-[#8b1a1a]/20"
            }`}
          >
            <FiLayers />
          </div>
          <div className="leading-tight">
            <div className={`text-xs sm:text-sm font-bold tracking-tight ${dark ? "text-white" : "text-[#2a1008]"}`}>
              03
            </div>
            <div className={`text-[9px] sm:text-[11px] font-medium ${dark ? "text-white/50" : "text-[#7a4a35]"}`}>
              Projects
            </div>
          </div>
        </div>

        {/* Pill 2: Different Domains */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 p-1 sm:p-1.5 rounded-xl">
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 text-xs sm:text-sm ${
              dark
                ? "bg-sky-500/15 text-sky-300 border border-sky-400/25"
                : "bg-[#c9956a]/20 text-[#8b1a1a] border border-[#c9956a]/30"
            }`}
          >
            <FiCompass />
          </div>
          <div className="leading-tight">
            <div className={`text-xs sm:text-sm font-bold tracking-tight ${dark ? "text-white" : "text-[#2a1008]"}`}>
              Different
            </div>
            <div className={`text-[9px] sm:text-[11px] font-medium ${dark ? "text-white/50" : "text-[#7a4a35]"}`}>
              Domains
            </div>
          </div>
        </div>

        {/* Pill 3: Real World Impact */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 p-1 sm:p-1.5 rounded-xl">
          <div
            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-lg flex items-center justify-center shrink-0 text-xs sm:text-sm ${
              dark
                ? "bg-emerald-500/15 text-emerald-300 border border-emerald-400/25"
                : "bg-[#8b1a1a]/10 text-[#8b1a1a] border border-[#8b1a1a]/20"
            }`}
          >
            <FiGlobe />
          </div>
          <div className="leading-tight">
            <div className={`text-xs sm:text-sm font-bold tracking-tight ${dark ? "text-white" : "text-[#2a1008]"}`}>
              Real World
            </div>
            <div className={`text-[9px] sm:text-[11px] font-medium ${dark ? "text-white/50" : "text-[#7a4a35]"}`}>
              Impact
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
