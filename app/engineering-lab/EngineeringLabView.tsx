"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa6";
import { useTheme } from "../theme-provider";
import { engineeringProjects } from "@/data/engineeringProjects";
import ProjectCard from "./ProjectCard";
import HeroArtwork from "./HeroArtwork";

export default function EngineeringLabView() {
  const { dark, toggle } = useTheme();

  return (
    <main
      className={`engineering-lab relative min-h-screen transition-colors duration-500 overflow-x-hidden ${
        dark ? "bg-[#030712] text-white" : "bg-[#f5ede0] text-[#2a1008]"
      }`}
    >
      {/* ── Background Ambient Layers ── */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 overflow-hidden -z-0">
        {dark ? (
          <>
            <div className="absolute -left-48 top-0 h-[36rem] w-[36rem] rounded-full bg-cyan-500/[0.08] blur-[150px]" />
            <div className="absolute -right-52 top-[32rem] h-[40rem] w-[40rem] rounded-full bg-violet-600/[0.08] blur-[160px]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.015)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" />
          </>
        ) : (
          <>
            <div className="absolute -left-48 top-0 h-[36rem] w-[36rem] rounded-full bg-[#c9956a]/[0.12] blur-[140px]" />
            <div className="absolute -right-52 top-[30rem] h-[40rem] w-[40rem] rounded-full bg-[#8b1a1a]/[0.06] blur-[150px]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(139,26,26,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(139,26,26,0.03)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" />
          </>
        )}
      </div>

      {/* ── Top Navigation Header ── */}
      <header className="relative z-20 mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8 lg:px-12">
        <Link
          href="/"
          className={`text-base font-bold tracking-tight transition-opacity hover:opacity-85 focus-visible:outline-none focus-visible:ring-2 ${
            dark ? "text-white focus-visible:ring-cyan-300" : "text-[#2a1008] focus-visible:ring-[#8b1a1a]"
          }`}
        >
          PAVAN
          <span className={dark ? "text-cyan-400" : "text-[#8b1a1a]"}>.</span>
        </Link>

        <div className="flex items-center gap-3 sm:gap-5">
          {/* Theme Switcher Button */}
          <button
            type="button"
            onClick={toggle}
            aria-label={dark ? "Switch to Day Mode" : "Switch to Night Mode"}
            title={dark ? "Switch to Day Mode" : "Switch to Night Mode"}
            className={`flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-full border text-sm sm:text-base transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 ${
              dark
                ? "border-white/15 bg-white/[0.04] text-white hover:border-cyan-400/50 hover:bg-white/[0.08] focus-visible:ring-cyan-400"
                : "border-[#8b1a1a]/20 bg-[#faeedd] text-[#8b1a1a] hover:border-[#8b1a1a]/45 hover:bg-[#faeedd]/90 shadow-sm focus-visible:ring-[#8b1a1a]"
            }`}
          >
            {dark ? "☀️" : "🌙"}
          </button>

          {/* Main Portfolio Link */}
          <Link
            href="/"
            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 sm:px-4 py-2 text-xs font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 ${
              dark
                ? "border-white/10 bg-white/[0.03] text-white/70 hover:border-cyan-400/35 hover:text-white focus-visible:ring-cyan-400"
                : "border-[#8b1a1a]/20 bg-[#fbf5ea] text-[#7a4a35] hover:border-[#8b1a1a]/45 hover:text-[#2a1008] shadow-sm focus-visible:ring-[#8b1a1a]"
            }`}
          >
            <span>Main portfolio</span>
            <FaArrowRight className="text-[10px]" />
          </Link>
        </div>
      </header>

      {/* ── Main Container ── */}
      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-24 sm:px-8 lg:px-12">
        {/* ── Hero Section ── */}
        <section className="pt-6 sm:pt-10 lg:pt-14 pb-14 sm:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-10 lg:gap-8 items-center">
            {/* Left Hero Column */}
            <div>
              {/* Eyebrow Pill */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-5 sm:mb-6"
              >
                <span
                  className={`inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.2em] border transition-colors ${
                    dark
                      ? "bg-white/[0.035] border-white/10 text-white/60"
                      : "bg-[#8b1a1a]/[0.05] border-[#8b1a1a]/15 text-[#7a4a35]"
                  }`}
                >
                  <span
                    className={`h-2 w-2 rounded-full shrink-0 ${
                      dark ? "bg-cyan-400 shadow-[0_0_10px_#22d3ee]" : "bg-[#8b1a1a]"
                    }`}
                  />
                  Selected work <span className="opacity-40">·</span> Engineering Lab
                </span>
              </motion.div>

              {/* Main Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.08 }}
                className="text-[clamp(3rem,7.5vw,6.5rem)] font-extrabold leading-[0.96] tracking-[-0.055em]"
              >
                Things I&apos;ve
                <br />
                <span
                  className={
                    dark
                      ? "bg-gradient-to-r from-cyan-200 via-sky-400 to-indigo-400 bg-clip-text text-transparent"
                      : "text-[#8b1a1a]"
                  }
                >
                  built.
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.16 }}
                className={`mt-6 sm:mt-7 max-w-lg text-base sm:text-lg leading-relaxed transition-colors ${
                  dark ? "text-white/60" : "text-[#7a4a35]"
                }`}
              >
                A selection of projects shaped by curiosity, thoughtful engineering,
                and a desire to make useful things.
              </motion.p>
            </div>

            {/* Right Hero Column: Illustration + Callout + Stats */}
            <div className="flex justify-center lg:justify-end">
              <HeroArtwork dark={dark} />
            </div>
          </div>
        </section>

        {/* ── "Featured Work / My Projects" Divider Bar ── */}
        <section className="scroll-mt-10" id="projects">
          <div className="mb-8 flex items-center justify-between gap-4">
            <div className="flex flex-col">
              <span
                className={`text-[10px] sm:text-[11px] font-semibold uppercase tracking-[0.22em] ${
                  dark ? "text-white/40" : "text-[#7a4a35]/80"
                }`}
              >
                FEATURED WORK
              </span>
              <h2
                className={`text-2xl sm:text-3xl font-bold tracking-tight mt-1 ${
                  dark ? "text-white" : "text-[#2a1008]"
                }`}
              >
                My{" "}
                <span className={dark ? "text-cyan-300" : "text-[#8b1a1a]"}>
                  Projects
                </span>
              </h2>
            </div>

            {/* Connecting Divider Line */}
            <div
              className={`hidden sm:block flex-1 h-[1px] mx-6 transition-colors ${
                dark ? "bg-white/[0.08]" : "bg-[#8b1a1a]/15"
              }`}
            />

            {/* Right: 03 PROJECTS */}
            <span
              className={`font-mono text-xs font-semibold tracking-wider ${
                dark ? "text-white/45" : "text-[#7a4a35]"
              }`}
            >
              {String(engineeringProjects.length).padStart(2, "0")} PROJECTS
            </span>
          </div>

          {/* ── Project Cards Vertical Stack ── */}
          <div className="flex flex-col gap-6 sm:gap-8">
            {engineeringProjects.map((project, index) => (
              <ProjectCard
                key={project.id}
                project={project}
                index={index}
                totalProjects={engineeringProjects.length}
                dark={dark}
              />
            ))}
          </div>
        </section>

        {/* ── Footer ── */}
        <footer
          className={`mt-20 pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-xs transition-colors ${
            dark ? "border-white/[0.08] text-white/40" : "border-[#8b1a1a]/15 text-[#7a4a35]"
          }`}
        >
          <span>© {new Date().getFullYear()} Pavan Kumar · Engineering Lab</span>
          <Link
            href="/"
            className={`inline-flex items-center gap-2 transition-colors ${
              dark ? "hover:text-cyan-300" : "hover:text-[#8b1a1a]"
            }`}
          >
            ← Back to the main portfolio
          </Link>
        </footer>
      </div>
    </main>
  );
}
