"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FiGrid } from "react-icons/fi";
import { LuSparkles } from "react-icons/lu";
import { SkillIcon } from "@/lib/skills-catalog";

const cn = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(" ");

export interface SkillItem {
  id: string;
  name: string;
  iconKey?: string;
  iconUrl?: string;
  category?: string;
  orderIndex?: number;
}

interface SkillsSectionProps {
  skills: SkillItem[];
  loading?: boolean;
  dark: boolean;
}

export function SkillsSection({ skills, loading, dark }: SkillsSectionProps) {
  // Mode: "marquee" (motion stream) or "grid" (structured layout)
  const [viewMode, setViewMode] = useState<"marquee" | "grid">("marquee");

  // Load user preference if stored
  useEffect(() => {
    try {
      const saved = localStorage.getItem("portfolio_skills_view_mode");
      if (saved === "grid" || saved === "marquee") {
        setViewMode(saved);
      }
    } catch {}
  }, []);

  const toggleViewMode = () => {
    const next = viewMode === "marquee" ? "grid" : "marquee";
    setViewMode(next);
    try {
      localStorage.setItem("portfolio_skills_view_mode", next);
    } catch {}
  };

  // Partition skills across 3 rows for alternating flow:
  // Row 0: Left
  // Row 1: Right (opposite)
  // Row 2: Left
  const { row0, row1, row2 } = useMemo(() => {
    if (!skills || skills.length === 0) {
      return { row0: [], row1: [], row2: [] };
    }

    const distribute = (rowIndex: number) => {
      const filtered = skills.filter((_, idx) => idx % 3 === rowIndex);
      const base = filtered.length > 0 ? filtered : skills;
      // Ensure each row has enough items for a wide continuous loop (minimum 7 items per half)
      let list = [...base];
      while (list.length < 8) {
        list = [...list, ...base];
      }
      return list;
    };

    return {
      row0: distribute(0),
      row1: distribute(1),
      row2: distribute(2),
    };
  }, [skills]);

  // Skill Card Pill Component (Matches reference image style: minimal, dashed border, clean icon & label)
  const renderCard = (skill: SkillItem, keyPrefix: string, index: number) => {
    return (
      <div
        key={`${keyPrefix}-${skill.id || skill.name}-${index}`}
        className={cn(
          "group relative shrink-0 inline-flex items-center gap-2.5 sm:gap-3 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-full border border-dashed transition-all duration-300 cursor-default select-none active:scale-95 sm:hover:-translate-y-0.5 sm:hover:scale-105",
          dark
            ? "bg-[#040e1c]/80 border-slate-700/60 hover:border-cyan-400 hover:bg-[#07182e] hover:shadow-[0_0_20px_rgba(34,211,238,0.22)] backdrop-blur-md"
            : "bg-white/95 border-neutral-300 hover:border-[#8b1a1a]/45 hover:bg-[#fff7ee] hover:shadow-[0_4px_14px_rgba(139,26,26,0.08)] shadow-xs"
        )}
      >
        {/* Subtle hover accent dot */}
        <span
          className={cn(
            "absolute top-2 right-2.5 w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none",
            dark
              ? "bg-cyan-400 shadow-[0_0_8px_#22d3ee]"
              : "bg-[#8b1a1a] shadow-[0_0_6px_rgba(139,26,26,0.5)]"
          )}
        />

        {/* Skill Logo */}
        <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
          <SkillIcon
            iconKey={skill.iconKey}
            iconUrl={skill.iconUrl}
            name={skill.name}
            className="w-full h-full object-contain"
          />
        </div>

        {/* Skill Name */}
        <span
          className={cn(
            "text-xs sm:text-sm font-medium tracking-normal whitespace-nowrap transition-colors duration-200",
            dark
              ? "text-white/90 group-hover:text-cyan-200"
              : "text-[#2a1008] group-hover:text-[#8b1a1a]"
          )}
        >
          {skill.name}
        </span>
      </div>
    );
  };

  return (
    <div className="relative w-full pt-4 sm:pt-6">
      {/* ── Section Header with Switch Symbol (Matching Reference Image top-right) ── */}
      <div className="flex items-end justify-between mb-6 sm:mb-8 gap-4">
        <div>
          {/* Accent Indicator Bar */}
          <div
            className={cn(
              "w-12 h-1 rounded-full mb-3",
              dark
                ? "bg-cyan-400 shadow-[0_0_12px_#22d3ee]"
                : "bg-[#8b1a1a] shadow-xs"
            )}
          />
          <h3
            className={cn(
              "text-xl sm:text-2xl font-extrabold tracking-wider uppercase",
              dark ? "text-white" : "text-[#2a1008]"
            )}
          >
            SKILLS &amp;{" "}
            <span className={dark ? "text-cyan-400" : "text-[#8b1a1a]"}>
              STACK
            </span>
          </h3>
        </div>

        {/* ── Switcher Button (Clean Single-Icon Toggle: Grid <-> Motion) ── */}
        <button
          type="button"
          onClick={toggleViewMode}
          title={
            viewMode === "marquee"
              ? "Switch to Grid View"
              : "Switch to Motion Stream View"
          }
          aria-label={
            viewMode === "marquee"
              ? "Switch to Grid View"
              : "Switch to Motion Stream View"
          }
          className={cn(
            "group relative inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-xl border border-dashed transition-all duration-300 outline-none cursor-pointer",
            dark
              ? "bg-[#040e1c]/80 border-slate-700/70 hover:border-cyan-400 hover:bg-[#07182e] hover:shadow-[0_0_18px_rgba(34,211,238,0.25)] text-white/80"
              : "bg-white/95 border-neutral-300 hover:border-[#8b1a1a]/40 hover:bg-[#fff7ee] hover:shadow-xs text-[#2a1008]/80"
          )}
        >
          <AnimatePresence mode="wait" initial={false}>
            {viewMode === "marquee" ? (
              <motion.span
                key="grid-mode-icon"
                initial={{ opacity: 0, scale: 0.7, rotate: -15 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.7, rotate: 15 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "flex items-center justify-center transition-colors",
                  dark
                    ? "text-white/80 group-hover:text-cyan-300"
                    : "text-[#2a1008]/80 group-hover:text-[#8b1a1a]"
                )}
              >
                <FiGrid className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </motion.span>
            ) : (
              <motion.span
                key="motion-mode-icon"
                initial={{ opacity: 0, scale: 0.7, rotate: -15 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.7, rotate: 15 }}
                transition={{ duration: 0.2 }}
                className={cn(
                  "flex items-center justify-center transition-colors",
                  dark
                    ? "text-cyan-400 drop-shadow-[0_0_8px_#22d3ee]"
                    : "text-[#8b1a1a]"
                )}
              >
                <LuSparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* ── Content: Loading State ── */}
      {loading ? (
        <div className="space-y-3 sm:space-y-4 py-4">
          {[1, 2, 3].map((rowIdx) => (
            <div
              key={rowIdx}
              className="flex items-center gap-3 overflow-hidden animate-pulse"
            >
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div
                  key={idx}
                  className={cn(
                    "h-10 sm:h-11 w-32 sm:w-36 rounded-full border border-dashed shrink-0",
                    dark
                      ? "bg-[#040e1c]/60 border-slate-800"
                      : "bg-[#fffaf2]/80 border-neutral-200"
                  )}
                />
              ))}
            </div>
          ))}
        </div>
      ) : skills.length === 0 ? (
        <div
          className={cn(
            "py-10 text-center text-xs sm:text-sm italic",
            dark ? "text-white/40" : "text-[#7a4a35]/60"
          )}
        >
          No skills added yet.
        </div>
      ) : (
        <AnimatePresence mode="wait">
          {viewMode === "marquee" ? (
            /* ── 1. MOTION MARQUEE VIEW (Matching Reference Image) ── */
            <motion.div
              key="marquee-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full overflow-hidden py-2 sm:py-3 select-none [mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)] [-webkit-mask-image:linear-gradient(to_right,transparent_0%,black_10%,black_90%,transparent_100%)]"
            >
              {/* Left Edge Fade Overlay */}
              <div
                className={cn(
                  "pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-24 md:w-36 z-20 transition-colors duration-500",
                  dark
                    ? "bg-gradient-to-r from-[#030712] via-[#030712]/80 to-transparent"
                    : "bg-gradient-to-r from-[#fffaf2] via-[#fffaf2]/80 to-transparent"
                )}
              />

              {/* Right Edge Fade Overlay */}
              <div
                className={cn(
                  "pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-24 md:w-36 z-20 transition-colors duration-500",
                  dark
                    ? "bg-gradient-to-l from-[#030712] via-[#030712]/80 to-transparent"
                    : "bg-gradient-to-l from-[#fffaf2] via-[#fffaf2]/80 to-transparent"
                )}
              />

              {/* Marquee Rows (Row 0: Left, Row 1: Right, Row 2: Left) */}
              <div className="space-y-3 sm:space-y-4">
                {/* ── ROW 1: Moves Left ── */}
                <div className="marquee-row relative flex overflow-hidden">
                  <div className="animate-marquee-left flex items-center gap-3 sm:gap-4 shrink-0 pr-3 sm:pr-4">
                    {row0.map((skill, i) => renderCard(skill, "r0-a", i))}
                  </div>
                  <div
                    aria-hidden="true"
                    className="animate-marquee-left flex items-center gap-3 sm:gap-4 shrink-0 pr-3 sm:pr-4"
                  >
                    {row0.map((skill, i) => renderCard(skill, "r0-b", i))}
                  </div>
                </div>

                {/* ── ROW 2: Moves Right (Opposite Direction) ── */}
                <div className="marquee-row relative flex overflow-hidden">
                  <div className="animate-marquee-right flex items-center gap-3 sm:gap-4 shrink-0 pr-3 sm:pr-4">
                    {row1.map((skill, i) => renderCard(skill, "r1-a", i))}
                  </div>
                  <div
                    aria-hidden="true"
                    className="animate-marquee-right flex items-center gap-3 sm:gap-4 shrink-0 pr-3 sm:pr-4"
                  >
                    {row1.map((skill, i) => renderCard(skill, "r1-b", i))}
                  </div>
                </div>

                {/* ── ROW 3: Moves Left (Alternating) ── */}
                <div className="marquee-row relative flex overflow-hidden">
                  <div className="animate-marquee-left flex items-center gap-3 sm:gap-4 shrink-0 pr-3 sm:pr-4">
                    {row2.map((skill, i) => renderCard(skill, "r2-a", i))}
                  </div>
                  <div
                    aria-hidden="true"
                    className="animate-marquee-left flex items-center gap-3 sm:gap-4 shrink-0 pr-3 sm:pr-4"
                  >
                    {row2.map((skill, i) => renderCard(skill, "r2-b", i))}
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            /* ── 2. STRUCTURED GRID VIEW (When Toggled) ── */
            <motion.div
              key="grid-view"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3.5"
            >
              {skills.map((skill, i) => (
                <motion.div
                  key={skill.id || skill.name}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    duration: 0.28,
                    delay: Math.min(i * 0.025, 0.3),
                  }}
                  className={cn(
                    "group relative inline-flex items-center gap-3 px-3.5 sm:px-4.5 py-3 sm:py-3.5 rounded-2xl border border-dashed transition-all duration-300 cursor-default select-none min-h-[50px] sm:min-h-[56px] active:scale-95 sm:hover:-translate-y-0.5 sm:hover:scale-[1.02]",
                    dark
                      ? "bg-[#040e1c]/80 border-slate-700/60 hover:border-cyan-400 hover:bg-[#07182e] hover:shadow-[0_0_20px_rgba(34,211,238,0.2)] backdrop-blur-md"
                      : "bg-white/95 border-neutral-300 hover:border-[#8b1a1a]/45 hover:bg-[#fff7ee] hover:shadow-[0_4px_14px_rgba(139,26,26,0.08)] shadow-xs"
                  )}
                >
                  {/* Subtle hover accent dot */}
                  <span
                    className={cn(
                      "absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none",
                      dark
                        ? "bg-cyan-400 shadow-[0_0_8px_#22d3ee]"
                        : "bg-[#8b1a1a] shadow-[0_0_6px_rgba(139,26,26,0.5)]"
                    )}
                  />

                  {/* Skill Logo */}
                  <div className="w-6 h-6 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110">
                    <SkillIcon
                      iconKey={skill.iconKey}
                      iconUrl={skill.iconUrl}
                      name={skill.name}
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Skill Name */}
                  <div className="min-w-0 flex-1">
                    <span
                      className={cn(
                        "text-xs sm:text-sm font-medium tracking-normal truncate block transition-colors duration-200",
                        dark
                          ? "text-white/90 group-hover:text-cyan-200"
                          : "text-[#2a1008] group-hover:text-[#8b1a1a]"
                      )}
                    >
                      {skill.name}
                    </span>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      )}
    </div>
  );
}

