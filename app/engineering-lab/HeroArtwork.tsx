"use client";

import { motion } from "framer-motion";
import { FiLayers, FiCompass, FiGlobe } from "react-icons/fi";

export default function HeroArtwork({ dark }: { dark: boolean }) {
  return (
    <div className="relative flex flex-col items-center lg:items-end justify-center w-full max-w-[520px]">
      {/* Top illustration container */}
      <div className="relative w-full h-[240px] sm:h-[280px] flex items-center justify-center">
        {/* Handwritten Annotation: "From ideas to impact" with curved arrow */}
        <div className="absolute left-2 sm:left-6 top-3 sm:top-6 z-20 pointer-events-none select-none">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className={`font-handwriting text-2xl sm:text-3xl leading-[1.05] tracking-wide ${
              dark ? "text-cyan-200/90" : "text-[#8b1a1a]"
            }`}
            style={{ transform: "rotate(-6deg)" }}
          >
            <div>From ideas</div>
            <div className="pl-4">to impact</div>
          </motion.div>

          {/* Organic curved arrow pointing towards the graphic */}
          <svg
            className={`w-16 h-14 sm:w-20 sm:h-16 mt-1 ml-6 overflow-visible ${
              dark ? "text-cyan-300/80" : "text-[#8b1a1a]/85"
            }`}
            viewBox="0 0 80 60"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M 12 6 C 30 18, 55 26, 68 46"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeDasharray="3 3"
            />
            {/* Arrowhead */}
            <path
              d="M 68 46 L 58 44 M 68 46 L 63 36"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* ── Graphic: Dark Mode (Glowing Wireframe Earth / Orbiting Globe) ── */}
        {dark ? (
          <div className="relative w-[240px] h-[240px] sm:w-[280px] sm:h-[280px] flex items-center justify-center">
            {/* Ambient outer halo */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-cyan-500/20 via-sky-600/15 to-violet-600/25 blur-2xl transform scale-110" />

            {/* Glowing atmosphere ring */}
            <div className="absolute inset-4 rounded-full border border-cyan-400/20 shadow-[0_0_60px_rgba(56,189,248,0.22)]" />

            {/* Globe SVG */}
            <svg
              viewBox="0 0 200 200"
              className="relative w-full h-full drop-shadow-[0_0_25px_rgba(56,189,248,0.3)]"
            >
              <defs>
                <radialGradient id="globeDarkGrad" cx="35%" cy="30%" r="65%">
                  <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.8" />
                  <stop offset="45%" stopColor="#0f172a" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#030712" stopOpacity="1" />
                </radialGradient>
                <linearGradient id="cyanRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.75" />
                  <stop offset="50%" stopColor="#818cf8" stopOpacity="0.4" />
                  <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.1" />
                </linearGradient>
                <linearGradient id="horizonGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.9" />
                  <stop offset="70%" stopColor="#3b82f6" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="transparent" stopOpacity="0" />
                </linearGradient>
              </defs>

              {/* Globe Base Sphere */}
              <circle cx="100" cy="100" r="76" fill="url(#globeDarkGrad)" stroke="#38bdf8" strokeOpacity="0.3" strokeWidth="1.2" />

              {/* Luminous atmosphere rim */}
              <circle cx="100" cy="100" r="76" fill="none" stroke="url(#horizonGlow)" strokeWidth="2.5" />

              {/* Latitude Rings */}
              <ellipse cx="100" cy="100" rx="76" ry="18" fill="none" stroke="#38bdf8" strokeOpacity="0.35" strokeWidth="1" strokeDasharray="4 3" />
              <ellipse cx="100" cy="74" rx="70" ry="14" fill="none" stroke="#38bdf8" strokeOpacity="0.25" strokeWidth="0.9" />
              <ellipse cx="100" cy="126" rx="70" ry="14" fill="none" stroke="#38bdf8" strokeOpacity="0.25" strokeWidth="0.9" />
              <ellipse cx="100" cy="52" rx="55" ry="10" fill="none" stroke="#38bdf8" strokeOpacity="0.2" strokeWidth="0.8" />
              <ellipse cx="100" cy="148" rx="55" ry="10" fill="none" stroke="#38bdf8" strokeOpacity="0.2" strokeWidth="0.8" />

              {/* Longitude Arcs */}
              <ellipse cx="100" cy="100" rx="28" ry="76" fill="none" stroke="#38bdf8" strokeOpacity="0.3" strokeWidth="0.9" />
              <ellipse cx="100" cy="100" rx="56" ry="76" fill="none" stroke="#38bdf8" strokeOpacity="0.25" strokeWidth="0.9" />
              <line x1="100" y1="24" x2="100" y2="176" stroke="#38bdf8" strokeOpacity="0.4" strokeWidth="1" strokeDasharray="2 3" />
              <line x1="24" y1="100" x2="176" y2="100" stroke="#38bdf8" strokeOpacity="0.35" strokeWidth="1" />

              {/* Orbital Tilted Ring */}
              <ellipse
                cx="100"
                cy="100"
                rx="92"
                ry="36"
                fill="none"
                stroke="url(#cyanRingGrad)"
                strokeWidth="1.5"
                transform="rotate(-26 100 100)"
              />

              {/* Constellation Nodes */}
              <circle cx="132" cy="78" r="2.5" fill="#67e8f9" filter="drop-shadow(0 0 4px #67e8f9)" />
              <circle cx="75" cy="115" r="2" fill="#38bdf8" />
              <circle cx="118" cy="130" r="2.2" fill="#818cf8" />
              <circle cx="84" cy="62" r="1.8" fill="#67e8f9" />
              <circle cx="150" cy="95" r="2" fill="#38bdf8" />
            </svg>
          </div>
        ) : (
          /* ── Graphic: Light Mode (Warm Mountain Peaks & Sun Glow) ── */
          <div className="relative w-[250px] h-[240px] sm:w-[290px] sm:h-[280px] flex items-center justify-center">
            {/* Warm peach sun glow */}
            <div className="absolute top-4 right-10 w-24 h-24 rounded-full bg-gradient-to-br from-[#f8d7b8] to-[#e8af84]/50 blur-xl opacity-80" />

            {/* Sun disk */}
            <div className="absolute top-8 right-14 w-14 h-14 rounded-full bg-gradient-to-b from-[#f5cfab] to-[#e7a372] border border-[#d88c57]/30 shadow-[0_0_24px_rgba(231,163,114,0.35)]" />

            {/* Mountains SVG */}
            <svg
              viewBox="0 0 240 180"
              className="relative w-full h-full drop-shadow-[0_8px_20px_rgba(139,26,26,0.08)]"
            >
              <defs>
                <linearGradient id="mtnBack" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#d8a684" stopOpacity="0.75" />
                  <stop offset="100%" stopColor="#ebd2be" stopOpacity="0.4" />
                </linearGradient>
                <linearGradient id="mtnMid" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#b8694a" stopOpacity="0.85" />
                  <stop offset="60%" stopColor="#9a472c" stopOpacity="0.85" />
                  <stop offset="100%" stopColor="#7a341e" stopOpacity="0.9" />
                </linearGradient>
                <linearGradient id="mtnFore" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#8b1a1a" stopOpacity="0.95" />
                  <stop offset="100%" stopColor="#5c1010" stopOpacity="1" />
                </linearGradient>
              </defs>

              {/* Distant Ridge */}
              <polygon
                points="10,160 55,90 100,130 150,75 200,120 235,160"
                fill="url(#mtnBack)"
                stroke="#c9956a"
                strokeWidth="0.8"
                strokeOpacity="0.4"
              />

              {/* Main Mountain Peaks */}
              <polygon
                points="25,165 85,70 120,105 175,45 220,125 240,165"
                fill="url(#mtnMid)"
                stroke="#8b1a1a"
                strokeWidth="1"
                strokeOpacity="0.3"
              />

              {/* Contour facet highlights */}
              <polygon
                points="175,45 155,95 185,125 220,125"
                fill="#d27854"
                fillOpacity="0.35"
              />
              <polygon
                points="85,70 70,115 100,125 120,105"
                fill="#d27854"
                fillOpacity="0.3"
              />

              {/* Foreground Peak */}
              <polygon
                points="115,165 160,95 205,165"
                fill="url(#mtnFore)"
                stroke="#5c1010"
                strokeWidth="1"
              />
              <polygon
                points="160,95 180,135 165,165"
                fill="#b83838"
                fillOpacity="0.35"
              />

              {/* Contour sketch lines */}
              <path d="M 85 70 L 80 160" stroke="#ebd2be" strokeWidth="0.6" strokeOpacity="0.5" strokeDasharray="3 2" />
              <path d="M 175 45 L 168 150" stroke="#ebd2be" strokeWidth="0.6" strokeOpacity="0.5" strokeDasharray="3 2" />
            </svg>
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
            ? "bg-[#070e1c]/80 border-white/10 shadow-[0_12px_32px_rgba(0,0,0,0.35)]"
            : "bg-[#fbf5eb]/90 border-[#8b1a1a]/15 shadow-[0_6px_24px_rgba(139,26,26,0.06)]"
        }`}
      >
        {/* Pill 1: 03 Projects */}
        <div className="flex items-center gap-2 sm:gap-2.5 p-1.5 sm:p-2 rounded-xl">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm ${
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
            <div className={`text-[10px] sm:text-[11px] font-medium ${dark ? "text-white/50" : "text-[#7a4a35]"}`}>
              Projects
            </div>
          </div>
        </div>

        {/* Pill 2: Different Domains */}
        <div className="flex items-center gap-2 sm:gap-2.5 p-1.5 sm:p-2 rounded-xl">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm ${
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
            <div className={`text-[10px] sm:text-[11px] font-medium ${dark ? "text-white/50" : "text-[#7a4a35]"}`}>
              Domains
            </div>
          </div>
        </div>

        {/* Pill 3: Real World Impact */}
        <div className="flex items-center gap-2 sm:gap-2.5 p-1.5 sm:p-2 rounded-xl">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm ${
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
            <div className={`text-[10px] sm:text-[11px] font-medium ${dark ? "text-white/50" : "text-[#7a4a35]"}`}>
              Impact
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
