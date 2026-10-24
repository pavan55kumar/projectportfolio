"use client";

import React from "react";
import type { EngineeringProject } from "@/data/engineeringProjects";

interface ProjectVisualGadgetProps {
  project: EngineeringProject;
  index: number;
  totalProjects: number;
  dark?: boolean;
}

export default function ProjectVisualGadget({
  project,
  index,
  totalProjects,
  dark = true,
}: ProjectVisualGadgetProps) {
  const projectNumber = String(index + 1).padStart(2, "0");
  const totalCount = String(totalProjects).padStart(2, "0");
  const slug = project.slug || project.id;

  // ── 01. SANKAT SAATHI GADGET ──
  if (slug === "sankat-saathi") {
    return (
      <div
        className={`w-full h-full min-h-[160px] sm:min-h-[185px] rounded-xl sm:rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between border transition-all duration-300 relative overflow-hidden select-none ${
          dark
            ? "bg-[#040a16] border-cyan-500/25 shadow-[inset_0_1px_15px_rgba(34,211,238,0.06)]"
            : "bg-[#faeedd] border-[#8b1a1a]/25 shadow-sm"
        }`}
      >
        {/* Subtle grid pattern background */}
        <div
          className={`absolute inset-0 opacity-15 pointer-events-none ${
            dark
              ? "bg-[linear-gradient(rgba(34,211,238,0.2)_1px,transparent_1px),linear-gradient(90deg,rgba(34,211,238,0.2)_1px,transparent_1px)]"
              : "bg-[linear-gradient(rgba(139,26,26,0.15)_1px,transparent_1px),linear-gradient(90deg,rgba(139,26,26,0.15)_1px,transparent_1px)]"
          } bg-[size:16px_16px]`}
        />

        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <span className={`h-1.5 w-1.5 rounded-full ${dark ? "bg-cyan-400" : "bg-[#8b1a1a]"}`} />
            <span className={`h-1.5 w-1.5 rounded-full ${dark ? "bg-cyan-400/60" : "bg-[#8b1a1a]/60"}`} />
            <span className={`h-1.5 w-1.5 rounded-full ${dark ? "bg-cyan-400/30" : "bg-[#8b1a1a]/30"}`} />
          </div>
          <span
            className={`font-mono text-[8px] sm:text-[9px] font-bold tracking-wider ${
              dark ? "text-cyan-400" : "text-[#8b1a1a]"
            }`}
          >
            SOS-GRID // LIVE
          </span>
        </div>

        {/* Metrics Row */}
        <div className="relative z-10 grid grid-cols-3 gap-1 pt-1">
          <div
            className={`rounded px-1 py-1 text-center border ${
              dark ? "bg-cyan-950/40 border-cyan-500/20" : "bg-white/60 border-[#8b1a1a]/15"
            }`}
          >
            <span className={`block font-mono text-[9px] sm:text-[10px] font-bold ${dark ? "text-cyan-300" : "text-[#8b1a1a]"}`}>
              98.4%
            </span>
          </div>
          <div
            className={`rounded px-1 py-1 text-center border ${
              dark ? "bg-white/[0.03] border-white/10" : "bg-white/60 border-[#8b1a1a]/15"
            }`}
          >
            <span className={`block font-mono text-[9px] sm:text-[10px] font-semibold ${dark ? "text-white/80" : "text-[#2a1008]"}`}>
              1,426
            </span>
          </div>
          <div
            className={`rounded px-1 py-1 text-center border ${
              dark ? "bg-white/[0.03] border-white/10" : "bg-white/60 border-[#8b1a1a]/15"
            }`}
          >
            <span className={`block font-mono text-[9px] sm:text-[10px] font-semibold ${dark ? "text-white/80" : "text-[#2a1008]"}`}>
              24ms
            </span>
          </div>
        </div>

        {/* Dynamic Wave Chart */}
        <div className="relative z-10 w-full my-auto py-1">
          <svg viewBox="0 0 160 48" className="w-full h-10 sm:h-12 overflow-visible">
            <defs>
              <linearGradient id="sankatGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={dark ? "#22d3ee" : "#8b1a1a"} stopOpacity="0.4" />
                <stop offset="100%" stopColor={dark ? "#22d3ee" : "#8b1a1a"} stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M 0,34 C 20,34 30,12 55,22 C 80,32 95,8 115,18 C 130,26 142,12 160,18 L 160,48 L 0,48 Z"
              fill="url(#sankatGradient)"
            />
            <path
              d="M 0,34 C 20,34 30,12 55,22 C 80,32 95,8 115,18 C 130,26 142,12 160,18"
              fill="none"
              stroke={dark ? "#22d3ee" : "#8b1a1a"}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle
              cx="115"
              cy="18"
              r="2.5"
              fill={dark ? "#22d3ee" : "#8b1a1a"}
            />
          </svg>
        </div>

        {/* Bottom index */}
        <div className="relative z-10 flex items-center justify-between pt-1">
          <span
            className={`font-mono text-[9px] sm:text-[10px] font-semibold tracking-wider ${
              dark ? "text-white/50" : "text-[#7a4a35]"
            }`}
          >
            {projectNumber} / {totalCount}
          </span>
          <span
            className={`h-1 w-6 rounded-full ${
              dark ? "bg-cyan-500/40" : "bg-[#8b1a1a]/30"
            }`}
          />
        </div>
      </div>
    );
  }

  // ── 02. ATLAS GADGET ──
  if (slug === "atlas") {
    return (
      <div
        className={`w-full h-full min-h-[160px] sm:min-h-[185px] rounded-xl sm:rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between border transition-all duration-300 relative overflow-hidden select-none ${
          dark
            ? "bg-[#070b18] border-purple-500/25 shadow-[inset_0_1px_15px_rgba(168,85,247,0.06)]"
            : "bg-[#faeedd] border-[#8b1a1a]/25 shadow-sm"
        }`}
      >
        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <span
            className={`font-mono text-[8px] sm:text-[9px] font-bold tracking-wider ${
              dark ? "text-purple-300" : "text-[#8b1a1a]"
            }`}
          >
            ATLAS // OS
          </span>
          <span
            className={`font-mono text-[7px] sm:text-[8px] px-1.5 py-0.5 rounded font-bold ${
              dark
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "bg-emerald-100 text-emerald-800 border border-emerald-400/30"
            }`}
          >
            36:45 FIT
          </span>
        </div>

        {/* Center: Attendance margin stats + circular radial ring gauge */}
        <div className="relative z-10 flex items-center justify-between gap-1 my-auto py-1">
          <div className="flex flex-col gap-1.5">
            <div
              className={`rounded px-1.5 py-0.5 border ${
                dark ? "bg-white/[0.03] border-white/10" : "bg-white/60 border-[#8b1a1a]/15"
              }`}
            >
              <div className="flex items-center gap-1 font-mono text-[8px] sm:text-[9px]">
                <span className={dark ? "text-white/60" : "text-[#7a4a35]"}>CS-</span>
                <span className={`font-bold ${dark ? "text-cyan-300" : "text-[#8b1a1a]"}`}>+4 Margin</span>
              </div>
            </div>

            <div
              className={`rounded px-1.5 py-0.5 border ${
                dark ? "bg-white/[0.03] border-white/10" : "bg-white/60 border-[#8b1a1a]/15"
              }`}
            >
              <div className="flex items-center gap-1 font-mono text-[8px] sm:text-[9px]">
                <span className={dark ? "text-white/60" : "text-[#7a4a35]"}>AI-</span>
                <span className={`font-bold ${dark ? "text-cyan-300" : "text-[#8b1a1a]"}`}>+2 Margin</span>
              </div>
            </div>
          </div>

          {/* Radial progress ring */}
          <div className="relative w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 44 44" className="w-full h-full -rotate-90">
              <circle
                cx="22"
                cy="22"
                r="17"
                fill="none"
                stroke={dark ? "rgba(255,255,255,0.08)" : "rgba(139,26,26,0.1)"}
                strokeWidth="3.5"
              />
              <circle
                cx="22"
                cy="22"
                r="17"
                fill="none"
                stroke={dark ? "#c084fc" : "#8b1a1a"}
                strokeWidth="3.5"
                strokeDasharray="106.8"
                strokeDashoffset="15"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className={`font-mono text-[9px] sm:text-[10px] font-bold ${dark ? "text-purple-200" : "text-[#8b1a1a]"}`}>
                86%
              </span>
            </div>
          </div>
        </div>

        {/* Bottom index */}
        <div className="relative z-10 flex items-center justify-between pt-1">
          <span
            className={`font-mono text-[9px] sm:text-[10px] font-semibold tracking-wider ${
              dark ? "text-white/50" : "text-[#7a4a35]"
            }`}
          >
            {projectNumber} / {totalCount}
          </span>
          <span
            className={`h-1.5 w-6 rounded-full ${
              dark ? "bg-purple-500/40" : "bg-[#8b1a1a]/30"
            }`}
          />
        </div>
      </div>
    );
  }

  // ── 03. PORTFOLIO 3D GADGET ──
  if (slug === "portfolio-3d" || slug === "project-orbital") {
    return (
      <div
        className={`w-full h-full min-h-[160px] sm:min-h-[185px] rounded-xl sm:rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between border transition-all duration-300 relative overflow-hidden select-none ${
          dark
            ? "bg-[#060a18] border-indigo-500/25 shadow-[inset_0_1px_15px_rgba(99,102,241,0.06)]"
            : "bg-[#faeedd] border-[#8b1a1a]/25 shadow-sm"
        }`}
      >
        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <span
            className={`font-mono text-[8px] sm:text-[9px] font-bold tracking-wider ${
              dark ? "text-indigo-300" : "text-[#8b1a1a]"
            }`}
          >
            WEBGL // SCENE.3D
          </span>
          <span
            className={`font-mono text-[7px] sm:text-[8px] px-1 py-0.5 rounded font-bold ${
              dark
                ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/25"
                : "bg-emerald-100 text-emerald-800 border border-emerald-400/25"
            }`}
          >
            60 FPS
          </span>
        </div>

        {/* Center: 3D isometric cube + telemetry badges */}
        <div className="relative z-10 flex items-center justify-between gap-1 my-auto py-1">
          {/* Isometric 3D Cube */}
          <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center shrink-0">
            <svg viewBox="0 0 60 52" className="w-full h-full overflow-visible">
              <polygon
                points="30,5 50,16 30,27 10,16"
                fill={dark ? "#38bdf8" : "#c9956a"}
                fillOpacity="0.85"
              />
              <polygon
                points="10,16 30,27 30,48 10,37"
                fill={dark ? "#6366f1" : "#8b1a1a"}
                fillOpacity="0.75"
              />
              <polygon
                points="30,27 50,16 50,37 30,48"
                fill={dark ? "#818cf8" : "#a83232"}
                fillOpacity="0.9"
              />
              <polyline
                points="10,16 30,5 50,16 30,27 10,16 10,37 30,48 50,37 50,16"
                fill="none"
                stroke={dark ? "#22d3ee" : "#faeedd"}
                strokeWidth="1"
                strokeOpacity="0.7"
              />
            </svg>
          </div>

          {/* Right badges */}
          <div className="flex flex-col gap-1.5 items-end">
            <span
              className={`font-mono text-[7px] sm:text-[8px] px-1.5 py-0.5 rounded border ${
                dark
                  ? "bg-white/[0.04] border-white/10 text-white/70"
                  : "bg-white/70 border-[#8b1a1a]/15 text-[#7a4a35]"
              }`}
            >
              FOV: 45°
            </span>
            <span
              className={`font-mono text-[7px] sm:text-[8px] px-1.5 py-0.5 rounded border ${
                dark
                  ? "bg-purple-950/40 border-purple-500/30 text-purple-300"
                  : "bg-purple-100 border-purple-400/30 text-purple-800"
              }`}
            >
              OAuth ✓
            </span>
          </div>
        </div>

        {/* Bottom index */}
        <div className="relative z-10 flex items-center justify-between pt-1">
          <span
            className={`font-mono text-[9px] sm:text-[10px] font-semibold tracking-wider ${
              dark ? "text-white/50" : "text-[#7a4a35]"
            }`}
          >
            {projectNumber} / {totalCount}
          </span>
          <span
            className={`font-mono text-[8px] sm:text-[9px] font-medium ${
              dark ? "text-cyan-400/80" : "text-[#8b1a1a]"
            }`}
          >
            .10 GLSL
          </span>
        </div>
      </div>
    );
  }

  // ── 04. WEATHER APP GADGET ──
  if (slug === "weather-app") {
    return (
      <div
        className={`w-full h-full min-h-[160px] sm:min-h-[185px] rounded-xl sm:rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between border transition-all duration-300 relative overflow-hidden select-none ${
          dark
            ? "bg-[#040e14] border-cyan-500/25 shadow-[inset_0_1px_15px_rgba(34,211,238,0.06)]"
            : "bg-[#faeedd] border-[#8b1a1a]/25 shadow-sm"
        }`}
      >
        {/* Top Header */}
        <div className="relative z-10 flex items-center justify-between">
          <span
            className={`font-mono text-[8px] sm:text-[9px] font-bold tracking-wider ${
              dark ? "text-sky-300" : "text-[#8b1a1a]"
            }`}
          >
            METEO // RADAR
          </span>
          <span
            className={`font-mono text-[7px] sm:text-[8px] px-1.5 py-0.5 rounded font-bold ${
              dark
                ? "bg-cyan-500/15 text-cyan-300 border border-cyan-500/25"
                : "bg-sky-100 text-sky-800 border border-sky-400/25"
            }`}
          >
            AQI 32
          </span>
        </div>

        {/* Center: Temperature + Spline curve */}
        <div className="relative z-10 my-auto py-1">
          <span
            className={`block font-mono text-sm sm:text-base font-bold ${
              dark ? "text-white" : "text-[#2a1008]"
            }`}
          >
            27.5°C
          </span>

          <svg viewBox="0 0 160 38" className="w-full h-8 sm:h-9 overflow-visible mt-1">
            <path
              d="M 0,22 C 30,12 55,30 85,15 C 115,4 135,28 160,18"
              fill="none"
              stroke={dark ? "#22d3ee" : "#8b1a1a"}
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="85" cy="15" r="2.5" fill={dark ? "#22d3ee" : "#8b1a1a"} />
          </svg>
        </div>

        {/* Bottom index & Days */}
        <div className="relative z-10 flex items-center justify-between pt-1">
          <span
            className={`font-mono text-[9px] sm:text-[10px] font-semibold tracking-wider ${
              dark ? "text-white/50" : "text-[#7a4a35]"
            }`}
          >
            {projectNumber} / {totalCount}
          </span>
          <div className="flex items-center gap-1 font-mono text-[8px] sm:text-[9px]">
            <span className={dark ? "text-white/60" : "text-[#7a4a35]"}>WED</span>
            <span className={`font-bold ${dark ? "text-cyan-400" : "text-[#8b1a1a]"}`}>THU</span>
          </div>
        </div>
      </div>
    );
  }

  // ── 05. DEFAULT / NOTE SAVER / SPAM DETECTION GADGET ──
  return (
    <div
      className={`w-full h-full min-h-[160px] sm:min-h-[185px] rounded-xl sm:rounded-2xl p-2.5 sm:p-3 flex flex-col justify-between border transition-all duration-300 relative overflow-hidden select-none ${
        dark
          ? "bg-[#060816] border-violet-500/25 shadow-[inset_0_1px_15px_rgba(139,92,246,0.06)]"
          : "bg-[#faeedd] border-[#8b1a1a]/25 shadow-sm"
      }`}
    >
      {/* Top Header */}
      <div className="relative z-10 flex items-center justify-between">
        <span
          className={`font-mono text-[8px] sm:text-[9px] font-bold tracking-wider truncate max-w-[70%] ${
            dark ? "text-violet-300" : "text-[#8b1a1a]"
          }`}
        >
          {project.category?.toUpperCase() || "CORE // ENGINE"}
        </span>
        <span
          className={`font-mono text-[7px] sm:text-[8px] px-1 py-0.5 rounded font-bold ${
            dark
              ? "bg-violet-500/15 text-violet-300 border border-violet-500/25"
              : "bg-violet-100 text-violet-800 border border-violet-400/25"
          }`}
        >
          v2.4
        </span>
      </div>

      {/* Middle code / telemetry */}
      <div className="relative z-10 my-auto py-1 font-mono text-[8px] sm:text-[9px] space-y-1">
        <div className={`truncate ${dark ? "text-white/80" : "text-[#2a1008]"}`}>
          &gt; init_pipeline()
        </div>
        <div className={`truncate ${dark ? "text-cyan-300" : "text-[#8b1a1a]"}`}>
          ✓ 100% synchronized
        </div>
        <div className={`truncate ${dark ? "text-white/40" : "text-[#7a4a35]"}`}>
          latency: sub-10ms
        </div>
      </div>

      {/* Bottom index */}
      <div className="relative z-10 flex items-center justify-between pt-1">
        <span
          className={`font-mono text-[9px] sm:text-[10px] font-semibold tracking-wider ${
            dark ? "text-white/50" : "text-[#7a4a35]"
          }`}
        >
          {projectNumber} / {totalCount}
        </span>
        <span
          className={`font-mono text-[8px] sm:text-[9px] font-medium ${
            dark ? "text-violet-400" : "text-[#8b1a1a]"
          }`}
        >
          REST API
        </span>
      </div>
    </div>
  );
}
