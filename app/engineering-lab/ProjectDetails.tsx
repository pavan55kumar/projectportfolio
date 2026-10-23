"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  FaArrowLeft,
  FaGithub,
  FaArrowUpRightFromSquare,
  FaChevronDown,
} from "react-icons/fa6";
import {
  FiCheckCircle,
  FiAlertTriangle,
  FiCpu,
  FiCode,
  FiExternalLink,
  FiUsers,
} from "react-icons/fi";
import { useTheme } from "../theme-provider";
import type { EngineeringProject } from "@/data/engineeringProjects";
import ProjectLivePreview from "./ProjectLivePreview";

export default function ProjectDetails({
  project,
}: {
  project: EngineeringProject;
  relatedProjects?: EngineeringProject[];
}) {
  const router = useRouter();
  const { dark, toggle } = useTheme();

  // Accordion open/close states for technical deep-dives
  const [openAccordion, setOpenAccordion] = useState<string | null>(null);

  const toggleAccordion = (section: string) => {
    setOpenAccordion((prev) => (prev === section ? null : section));
  };

  const liveUrlToUse =
    project.liveUrl ||
    (project.liveDemoUrl?.startsWith("http") ? project.liveDemoUrl : undefined);

  const displayImage = project.bannerImage || project.coverImage || "/projects/portfolio-3d/cover.png";

  return (
    <main
      className={`engineering-lab min-h-screen transition-colors duration-500 overflow-x-hidden ${
        dark ? "bg-[#030712] text-white" : "bg-[#f5ede0] text-[#2a1008]"
      }`}
    >
      {/* ── Background Subtle Ambient Glow ── */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        {dark ? (
          <>
            <div className="absolute -left-64 top-16 h-[36rem] w-[36rem] rounded-full bg-cyan-500/[0.05] blur-[160px]" />
            <div className="absolute -right-64 top-[32rem] h-[38rem] w-[38rem] rounded-full bg-violet-600/[0.05] blur-[160px]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" />
          </>
        ) : (
          <>
            <div className="absolute -left-64 top-16 h-[36rem] w-[36rem] rounded-full bg-[#c9956a]/[0.1] blur-[150px]" />
            <div className="absolute -right-64 top-[32rem] h-[38rem] w-[38rem] rounded-full bg-[#8b1a1a]/[0.05] blur-[160px]" />
            <div className="absolute inset-0 bg-[linear-gradient(rgba(139,26,26,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(139,26,26,0.025)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_75%)]" />
          </>
        )}
      </div>

      {/* ── Top Navigation Bar ── */}
      <header className="relative z-20 mx-auto flex max-w-6xl items-center justify-between px-5 py-5 sm:px-8">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              if (window.history.length > 1) {
                router.back();
              } else {
                router.push("/engineering-lab");
              }
            }}
            className={`inline-flex items-center gap-2 rounded-xl border px-3.5 py-2 text-xs font-semibold transition-all duration-200 ${
              dark
                ? "border-white/10 bg-white/[0.03] text-white/70 hover:border-cyan-400/40 hover:text-white"
                : "border-[#8b1a1a]/15 bg-white text-[#7a4a35] hover:border-[#8b1a1a]/35 hover:text-[#2a1008] shadow-xs"
            }`}
          >
            <FaArrowLeft className="text-[10px]" />
            <span>Back</span>
          </button>

          <Link
            href="/engineering-lab"
            className={`hidden sm:inline-flex text-xs font-medium transition-colors ${
              dark ? "text-white/45 hover:text-white/80" : "text-[#7a4a35]/60 hover:text-[#2a1008]"
            }`}
          >
            Engineer&apos;s Lab
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggle}
            aria-label={dark ? "Switch to Day Mode" : "Switch to Night Mode"}
            title={dark ? "Switch to Day Mode" : "Switch to Night Mode"}
            className={`flex h-9 w-9 items-center justify-center rounded-xl border text-sm transition-all duration-200 ${
              dark
                ? "border-white/10 bg-white/[0.04] text-white hover:border-cyan-400/40"
                : "border-[#8b1a1a]/15 bg-white text-[#8b1a1a] hover:border-[#8b1a1a]/30 shadow-xs"
            }`}
          >
            {dark ? "☀️" : "🌙"}
          </button>

          <Link
            href="/"
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-all duration-200 ${
              dark
                ? "border-white/10 bg-white/[0.02] text-white/60 hover:text-white hover:border-cyan-400/30"
                : "border-[#8b1a1a]/15 bg-white text-[#7a4a35] hover:text-[#2a1008] shadow-xs"
            }`}
          >
            <span>Portfolio</span>
            <span className="text-[10px]">↗</span>
          </Link>
        </div>
      </header>

      {/* ── Main Content Container ── */}
      <div className="relative z-10 mx-auto max-w-6xl px-5 pb-24 sm:px-8">
        {/* ── SECTION A: COMPACT PROJECT HEADER ── */}
        <section className="pt-6 sm:pt-10 pb-8 sm:pb-12 border-b border-white/10 dark:border-white/10">
          <div className="flex flex-wrap items-center gap-2.5 mb-4">
            {project.status && (
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border ${
                  dark
                    ? "bg-cyan-500/10 border-cyan-400/30 text-cyan-300"
                    : "bg-[#8b1a1a]/10 border-[#8b1a1a]/25 text-[#8b1a1a]"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                {project.status}
              </span>
            )}

            {project.category && (
              <span
                className={`px-3 py-1 rounded-full text-xs font-medium border ${
                  dark
                    ? "border-white/10 bg-white/[0.02] text-white/60"
                    : "border-[#8b1a1a]/15 bg-white text-[#7a4a35]"
                }`}
              >
                {project.category}
              </span>
            )}
          </div>

          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <div className="max-w-3xl">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
                {project.title}
              </h1>
              <p
                className={`mt-4 text-base sm:text-lg leading-relaxed ${
                  dark ? "text-white/70" : "text-[#5a3020]"
                }`}
              >
                {project.description}
              </p>
            </div>

            {/* Quick Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              {liveUrlToUse && (
                <a
                  href={liveUrlToUse}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all shadow-md active:scale-95 ${
                    dark
                      ? "bg-cyan-400 text-[#030712] shadow-cyan-500/20 hover:bg-cyan-300"
                      : "bg-[#8b1a1a] text-white shadow-[#8b1a1a]/20 hover:bg-[#721515]"
                  }`}
                >
                  <span>Open Live Website</span>
                  <FaArrowUpRightFromSquare className="text-[10px]" />
                </a>
              )}

              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold border transition-all ${
                    dark
                      ? "border-white/15 bg-white/[0.04] text-white hover:bg-white/10 hover:border-white/30"
                      : "border-[#8b1a1a]/20 bg-white text-[#2a1008] hover:bg-[#faeedd]"
                  }`}
                >
                  <FaGithub className="text-sm" />
                  <span>GitHub</span>
                </a>
              )}

              {/* Jump to Preview Anchor Button */}
              <a
                href="#live-preview"
                className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-medium border transition-colors ${
                  dark
                    ? "border-white/10 text-white/60 hover:text-white hover:border-white/20"
                    : "border-[#8b1a1a]/15 text-[#7a4a35] hover:text-[#2a1008] bg-white/60"
                }`}
              >
                <span>Preview</span>
                <span className="text-[10px]">↓</span>
              </a>
            </div>
          </div>

          {/* Compact Tech Stack Pills */}
          {project.technologies && project.technologies.length > 0 && (
            <div className="mt-6 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 mr-2 shrink-0">
                Stack:
              </span>
              {project.technologies.map((tech) => (
                <span
                  key={tech}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    dark
                      ? "border-white/10 bg-white/[0.03] text-white/80"
                      : "border-[#8b1a1a]/15 bg-white/80 text-[#2a1008]"
                  }`}
                >
                  {tech}
                </span>
              ))}
            </div>
          )}
        </section>

        {/* ── SECTION B: PROJECT COVER IMAGE ── */}
        <section className="py-8 sm:py-10">
          <div
            className={`relative w-full aspect-[16/9] sm:aspect-[21/9] max-h-[460px] rounded-2xl sm:rounded-3xl overflow-hidden border shadow-xl ${
              dark ? "border-white/10 bg-[#070e1b]" : "border-[#8b1a1a]/15 bg-[#fbf5ea]"
            }`}
          >
            <Image
              src={displayImage}
              alt={`${project.title} Banner`}
              fill
              sizes="(max-width: 1200px) 100vw, 1152px"
              className="object-cover"
              priority
            />
            <div
              className={`absolute inset-0 pointer-events-none ${
                dark
                  ? "bg-gradient-to-t from-[#030712]/70 via-transparent to-transparent"
                  : "bg-gradient-to-t from-[#f5ede0]/60 via-transparent to-transparent"
              }`}
            />
          </div>
        </section>

        {/* ── SECTION C: CONCISE PROJECT INFORMATION ── */}
        <div className="space-y-12 sm:space-y-16 py-4">
          {/* Overview */}
          {project.overview && (
            <section className="max-w-3xl">
              <p
                className={`text-[11px] font-bold uppercase tracking-[0.2em] mb-3 ${
                  dark ? "text-cyan-400" : "text-[#8b1a1a]"
                }`}
              >
                Overview
              </p>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-4">
                What this system accomplishes
              </h2>
              <p
                className={`text-base sm:text-lg leading-relaxed ${
                  dark ? "text-white/75" : "text-[#5a3020]"
                }`}
              >
                {project.overview}
              </p>
            </section>
          )}

          {/* Problem & Solution Columns */}
          {(project.problem || project.solution) && (
            <section className="grid gap-6 md:grid-cols-2">
              {project.problem && (
                <div
                  className={`p-6 sm:p-7 rounded-2xl border transition-all ${
                    dark
                      ? "border-white/10 bg-[#060d19]/80 text-white"
                      : "border-[#8b1a1a]/15 bg-[#fffaf2] text-[#2a1008] shadow-xs"
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-3 text-rose-500 font-bold text-xs uppercase tracking-wider">
                    <FiAlertTriangle className="text-sm shrink-0" />
                    <span>The Problem</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">The Real-World Challenge</h3>
                  <p
                    className={`text-sm sm:text-base leading-relaxed ${
                      dark ? "text-white/70" : "text-[#5a3020]"
                    }`}
                  >
                    {project.problem}
                  </p>
                </div>
              )}

              {project.solution && (
                <div
                  className={`p-6 sm:p-7 rounded-2xl border transition-all ${
                    dark
                      ? "border-cyan-500/20 bg-[#051122]/80 text-white"
                      : "border-emerald-600/20 bg-emerald-50/50 text-[#2a1008] shadow-xs"
                  }`}
                >
                  <div
                    className={`flex items-center gap-2.5 mb-3 font-bold text-xs uppercase tracking-wider ${
                      dark ? "text-cyan-400" : "text-emerald-700"
                    }`}
                  >
                    <FiCheckCircle className="text-sm shrink-0" />
                    <span>The Solution</span>
                  </div>
                  <h3 className="text-lg font-bold mb-2">The Engineering Approach</h3>
                  <p
                    className={`text-sm sm:text-base leading-relaxed ${
                      dark ? "text-white/70" : "text-[#5a3020]"
                    }`}
                  >
                    {project.solution}
                  </p>
                </div>
              )}
            </section>
          )}

          {/* Key Features */}
          {project.features && project.features.length > 0 && (
            <section>
              <div className="mb-6">
                <p
                  className={`text-[11px] font-bold uppercase tracking-[0.2em] mb-2 ${
                    dark ? "text-cyan-400" : "text-[#8b1a1a]"
                  }`}
                >
                  Capabilities
                </p>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Key Features</h2>
              </div>

              <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
                {project.features.map((feature, idx) => (
                  <div
                    key={feature}
                    className={`p-4 sm:p-5 rounded-2xl border flex gap-3.5 items-start transition-all ${
                      dark
                        ? "border-white/10 bg-[#070e1c]/60 hover:border-cyan-400/30"
                        : "border-[#8b1a1a]/15 bg-white/70 hover:border-[#8b1a1a]/30 shadow-xs"
                    }`}
                  >
                    <span
                      className={`font-mono text-xs font-bold shrink-0 mt-0.5 px-2 py-0.5 rounded-md border ${
                        dark
                          ? "border-cyan-500/30 text-cyan-400 bg-cyan-950/40"
                          : "border-[#8b1a1a]/20 text-[#8b1a1a] bg-[#faeedd]"
                      }`}
                    >
                      {String(idx + 1).padStart(2, "0")}
                    </span>
                    <p
                      className={`text-xs sm:text-sm leading-relaxed ${
                        dark ? "text-white/80" : "text-[#2a1008]"
                      }`}
                    >
                      {feature}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Role & Contributions */}
          {(project.role || (project.contributions && project.contributions.length > 0)) && (
            <section
              className={`p-6 sm:p-8 rounded-2xl sm:rounded-3xl border ${
                dark ? "border-white/10 bg-white/[0.02]" : "border-[#8b1a1a]/15 bg-[#fffaf2]"
              }`}
            >
              <p
                className={`text-[11px] font-bold uppercase tracking-[0.2em] mb-2 ${
                  dark ? "text-cyan-400" : "text-[#8b1a1a]"
                }`}
              >
                Involvement
              </p>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
                My Role &amp; Contributions
              </h2>

              {project.role && (
                <p
                  className={`text-sm sm:text-base font-semibold mb-5 ${
                    dark ? "text-cyan-300" : "text-[#8b1a1a]"
                  }`}
                >
                  {project.role}
                </p>
              )}

              {project.contributions && project.contributions.length > 0 && (
                <ul className="grid gap-3 sm:grid-cols-2">
                  {project.contributions.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed text-slate-300 dark:text-slate-300 light:text-[#5a3020]"
                    >
                      <span className="text-cyan-400 mt-1 shrink-0">✦</span>
                      <span className={dark ? "text-white/75" : "text-[#5a3020]"}>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          )}
        </div>

        {/* ── SECTION D: REAL LIVE WEBSITE PREVIEW ── */}
        <section id="live-preview" className="pt-16 sm:pt-20 pb-12 scroll-mt-12">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6">
            <div>
              <p
                className={`text-[11px] font-bold uppercase tracking-[0.2em] mb-2 ${
                  dark ? "text-cyan-400" : "text-[#8b1a1a]"
                }`}
              >
                Interactive Deployment
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Live Website Preview
              </h2>
              <p
                className={`text-xs sm:text-sm mt-1 max-w-xl ${
                  dark ? "text-white/60" : "text-[#7a4a35]"
                }`}
              >
                Interact with the deployed application below, or open it in a full tab for the complete experience.
              </p>
            </div>

            {liveUrlToUse && (
              <a
                href={liveUrlToUse}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold border transition-all shrink-0 ${
                  dark
                    ? "border-cyan-400/40 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20"
                    : "border-[#8b1a1a]/20 bg-white text-[#8b1a1a] hover:bg-[#faeedd]"
                }`}
              >
                <span>Launch Fullscreen App</span>
                <FiExternalLink className="text-[11px]" />
              </a>
            )}
          </div>

          <ProjectLivePreview
            url={liveUrlToUse}
            title={project.title}
            coverImage={displayImage}
            githubUrl={project.githubUrl}
            dark={dark}
          />
        </section>

        {/* ── SECTION E: EXPANDABLE TECHNICAL DETAILS (ACCORDIONS) ── */}
        {(project.architecture || project.challenges || (project.team && project.team.length > 0)) && (
          <section className="py-12 border-t border-white/10 dark:border-white/10">
            <div className="mb-8">
              <p
                className={`text-[11px] font-bold uppercase tracking-[0.2em] mb-2 ${
                  dark ? "text-cyan-400" : "text-[#8b1a1a]"
                }`}
              >
                Deep Dive
              </p>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Technical Architecture &amp; Engineering
              </h2>
              <p
                className={`text-xs sm:text-sm mt-1 ${
                  dark ? "text-white/60" : "text-[#7a4a35]"
                }`}
              >
                Expand the sections below for detailed insights on system architecture and implementation hurdles.
              </p>
            </div>

            <div className="space-y-4">
              {/* Accordion 1: Architecture */}
              {project.architecture && (
                <div
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    dark
                      ? "border-white/10 bg-[#050c18]"
                      : "border-[#8b1a1a]/15 bg-[#fffaf2]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion("architecture")}
                    className="w-full p-5 sm:p-6 flex items-center justify-between gap-4 text-left font-bold text-base sm:text-lg focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-xl border ${
                          dark
                            ? "border-cyan-500/30 bg-cyan-950/40 text-cyan-400"
                            : "border-[#8b1a1a]/20 bg-[#faeedd] text-[#8b1a1a]"
                        }`}
                      >
                        <FiCpu />
                      </div>
                      <span>Architecture &amp; System Implementation</span>
                    </div>
                    <FaChevronDown
                      className={`text-xs transition-transform duration-300 ${
                        openAccordion === "architecture" ? "rotate-180 text-cyan-400" : "opacity-60"
                      }`}
                    />
                  </button>

                  {openAccordion === "architecture" && (
                    <div
                      className={`px-5 pb-6 sm:px-6 sm:pb-7 pt-1 border-t text-sm sm:text-base leading-relaxed ${
                        dark
                          ? "border-white/10 text-white/75"
                          : "border-[#8b1a1a]/10 text-[#5a3020]"
                      }`}
                    >
                      <p>{project.architecture}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Accordion 2: Challenges */}
              {project.challenges && (
                <div
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    dark
                      ? "border-white/10 bg-[#050c18]"
                      : "border-[#8b1a1a]/15 bg-[#fffaf2]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion("challenges")}
                    className="w-full p-5 sm:p-6 flex items-center justify-between gap-4 text-left font-bold text-base sm:text-lg focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-xl border ${
                          dark
                            ? "border-cyan-500/30 bg-cyan-950/40 text-cyan-400"
                            : "border-[#8b1a1a]/20 bg-[#faeedd] text-[#8b1a1a]"
                        }`}
                      >
                        <FiCode />
                      </div>
                      <span>Technical Challenges &amp; Solutions</span>
                    </div>
                    <FaChevronDown
                      className={`text-xs transition-transform duration-300 ${
                        openAccordion === "challenges" ? "rotate-180 text-cyan-400" : "opacity-60"
                      }`}
                    />
                  </button>

                  {openAccordion === "challenges" && (
                    <div
                      className={`px-5 pb-6 sm:px-6 sm:pb-7 pt-1 border-t text-sm sm:text-base leading-relaxed ${
                        dark
                          ? "border-white/10 text-white/75"
                          : "border-[#8b1a1a]/10 text-[#5a3020]"
                      }`}
                    >
                      <p>{project.challenges}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Accordion 3: Team & Collaborators */}
              {project.team && project.team.length > 0 && (
                <div
                  className={`rounded-2xl border transition-all overflow-hidden ${
                    dark
                      ? "border-white/10 bg-[#050c18]"
                      : "border-[#8b1a1a]/15 bg-[#fffaf2]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion("team")}
                    className="w-full p-5 sm:p-6 flex items-center justify-between gap-4 text-left font-bold text-base sm:text-lg focus:outline-none"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2 rounded-xl border ${
                          dark
                            ? "border-cyan-500/30 bg-cyan-950/40 text-cyan-400"
                            : "border-[#8b1a1a]/20 bg-[#faeedd] text-[#8b1a1a]"
                        }`}
                      >
                        <FiUsers />
                      </div>
                      <span>Team &amp; Collaborators</span>
                    </div>
                    <FaChevronDown
                      className={`text-xs transition-transform duration-300 ${
                        openAccordion === "team" ? "rotate-180 text-cyan-400" : "opacity-60"
                      }`}
                    />
                  </button>

                  {openAccordion === "team" && (
                    <div
                      className={`px-5 pb-6 sm:px-6 sm:pb-7 pt-4 border-t ${
                        dark ? "border-white/10" : "border-[#8b1a1a]/10"
                      }`}
                    >
                      <div className="grid gap-4 sm:grid-cols-2">
                        {project.team.map((member) => (
                          <div
                            key={member.name}
                            className={`p-4 rounded-xl border flex items-center gap-4 ${
                              dark ? "border-white/10 bg-white/[0.02]" : "border-[#8b1a1a]/10 bg-white"
                            }`}
                          >
                            {member.photo ? (
                              <Image
                                src={member.photo}
                                alt={member.name}
                                width={48}
                                height={48}
                                className="w-12 h-12 rounded-full object-cover border border-cyan-400/30"
                              />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center font-bold text-cyan-400">
                                {member.name.charAt(0)}
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <h4 className="font-bold text-sm">{member.name}</h4>
                              <p className="text-xs text-slate-400">{member.role}</p>
                              {member.contribution && (
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                                  {member.contribution}
                                </p>
                              )}
                              <div className="flex items-center gap-3 mt-2 text-xs">
                                {member.github && (
                                  <a
                                    href={member.github}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-cyan-400 hover:underline"
                                  >
                                    GitHub
                                  </a>
                                )}
                                {member.linkedin && (
                                  <a
                                    href={member.linkedin}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-cyan-400 hover:underline"
                                  >
                                    LinkedIn
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </section>
        )}

        {/* ── SECTION F: PROJECT NAVIGATION & FOOTER ── */}
        <footer className="mt-16 pt-8 border-t border-white/10 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-4">
            <Link
              href="/engineering-lab"
              className={`inline-flex items-center gap-2 font-semibold transition-colors ${
                dark ? "text-cyan-400 hover:text-cyan-300" : "text-[#8b1a1a] hover:underline"
              }`}
            >
              <span>← Back to Engineer&apos;s Lab</span>
            </Link>
            <span className="opacity-30">|</span>
            <Link
              href="/"
              className={`transition-colors ${
                dark ? "text-white/60 hover:text-white" : "text-[#7a4a35] hover:text-[#2a1008]"
              }`}
            >
              Main Portfolio
            </Link>
          </div>

          <span className="opacity-50 text-[11px]">
            © {new Date().getFullYear()} Pavan Kumar · Engineering Lab
          </span>
        </footer>
      </div>
    </main>
  );
}