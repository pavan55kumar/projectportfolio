"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowUpRightFromSquare, FaArrowRight, FaTrophy } from "react-icons/fa6";
import { FiChevronLeft, FiChevronRight, FiMoreHorizontal, FiExternalLink, FiGithub, FiCopy, FiCheck } from "react-icons/fi";
import { IoTriangle } from "react-icons/io5";
import type { EngineeringProject } from "@/data/engineeringProjects";

export default function ProjectCard({
  project,
  index,
  totalProjects = 3,
  dark = true,
}: {
  project: EngineeringProject;
  index: number;
  totalProjects?: number;
  dark?: boolean;
}) {
  // Collect images for image carousel
  const images: string[] = [];
  if (project.coverImage) images.push(project.coverImage);
  if (project.bannerImage && project.bannerImage !== project.coverImage) {
    images.push(project.bannerImage);
  }

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setActiveImageIdx((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  };

  const handleCopyLink = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/engineering-lab/${project.slug}`;
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => {
        setCopied(false);
        setMenuOpen(false);
      }, 1500);
    }
  };

  const projectNumber = String(index + 1).padStart(2, "0");
  const totalCount = String(totalProjects).padStart(2, "0");

  const featuredTechMap: Record<string, string[]> = {
    "sankat-saathi": ["React 18", "Vite", "Tailwind CSS", "Supabase (PostgreSQL & RLS)", "IBM Z / LinuxONE", "FastAPI"],
    atlas: ["React 18", "Vite", "Tailwind CSS", "Framer Motion"],
    "portfolio-3d": ["React 18", "Tailwind CSS", "Open-Meteo API", "Express.js", "Node.js", "Vercel", "PWA"],
  };

  const displayedTech =
    featuredTechMap[project.slug] ||
    featuredTechMap[project.id] ||
    project.technologies?.slice(0, 6) ||
    [];

  // Determine status badge icon and label
  const renderStatusBadge = () => {
    if (project.slug === "sankat-saathi" || project.id === "sankat-saathi") {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
            dark
              ? "bg-[#0b2238] text-cyan-300 border border-cyan-500/30"
              : "bg-[#faeedd] text-[#8b1a1a] border border-[#8b1a1a]/25"
          }`}
        >
          <FaTrophy className="text-[10px] shrink-0" />
          {project.status || "IBM Z Datathon Project"}
        </span>
      );
    }

    if (project.slug === "atlas" || project.id === "atlas") {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
            dark
              ? "bg-[#062018] text-emerald-300 border border-emerald-500/30"
              : "bg-[#ecfdf5] text-emerald-800 border border-emerald-600/25"
          }`}
        >
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          {project.status || "Active Production PWA"}
        </span>
      );
    }

    // Project Orbital / default
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
          dark
            ? "bg-[#1f1035] text-purple-300 border border-purple-500/30"
            : "bg-[#f5eefc] text-purple-800 border border-purple-500/25"
        }`}
      >
        <IoTriangle className="text-[9px] shrink-0 transform rotate-90" />
        {project.status || "Live on Vercel"}
      </span>
    );
  };

  // Live demo URL or internal link
  const liveUrl =
    project.liveUrl ||
    (project.liveDemoUrl?.startsWith("http") ? project.liveDemoUrl : undefined);
  const exploreUrl = liveUrl || `/engineering-lab/${project.slug}`;

  return (
    <motion.article
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative rounded-3xl border transition-all duration-500 overflow-hidden ${
        dark
          ? "bg-[#070d18]/90 border-white/[0.08] hover:border-cyan-400/35 hover:shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
          : "bg-[#fbf5ea] border-[#8b1a1a]/15 hover:border-[#8b1a1a]/40 hover:shadow-[0_16px_45px_rgba(139,26,26,0.08)]"
      }`}
    >
      <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.25fr] gap-6 sm:gap-8 p-4 sm:p-5 lg:p-6 items-center">
        {/* ── Left Column: Project Visual ── */}
        <div className="relative aspect-[16/10] w-full rounded-2xl overflow-hidden group/image select-none">
          <Link
            href={`/engineering-lab/${project.slug}`}
            className="block w-full h-full relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400"
            aria-label={`View deep-dive for ${project.title}`}
          >
            {images.length > 0 ? (
              <>
                <Image
                  src={images[activeImageIdx]}
                  alt={`${project.title} preview`}
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover/image:scale-[1.04]"
                  priority={index === 0}
                  unoptimized={
                    typeof images[activeImageIdx] === "string" &&
                    images[activeImageIdx].startsWith("data:")
                  }
                />
                <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/60 via-black/20 to-transparent pointer-events-none" />
              </>
            ) : (
              <div
                className={`w-full h-full flex flex-col items-center justify-center p-6 text-center select-none ${
                  dark
                    ? "bg-gradient-to-br from-[#0c192c] via-[#070e1b] to-[#16122c]"
                    : "bg-gradient-to-br from-[#faeedd] via-[#f7e6d0] to-[#f0d8c0]"
                }`}
              >
                <span className="text-4xl mb-2 opacity-80">⚡</span>
                <span
                  className={`text-[11px] font-bold uppercase tracking-wider ${
                    dark ? "text-cyan-400" : "text-[#8b1a1a]"
                  }`}
                >
                  {project.category || "Engineering Project"}
                </span>
                <span
                  className={`text-sm sm:text-base font-bold mt-1 max-w-[85%] truncate ${
                    dark ? "text-white/90" : "text-[#2a1008]/90"
                  }`}
                >
                  {project.title}
                </span>
              </div>
            )}
          </Link>

          {/* Bottom Left: 01 / 03 index pill badge */}
          <div className="absolute bottom-3 left-3 z-10 pointer-events-none">
            <span
              className={`inline-flex items-center px-3 py-1 rounded-full font-mono text-[11px] sm:text-xs font-semibold backdrop-blur-md shadow-lg ${
                dark
                  ? "bg-black/65 text-white/95 border border-white/20"
                  : "bg-[#2a1008]/75 text-white border border-white/25"
              }`}
            >
              {projectNumber} / {totalCount}
            </span>
          </div>
        </div>

        {/* ── Right Column: Project Details ── */}
        <div className="flex flex-col justify-center">
          {/* Top Row: Status badge & Menu action */}
          <div className="relative flex items-center justify-between gap-3">
            {renderStatusBadge()}

            {/* Three Dots Menu Button */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="More options"
                className={`p-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 ${
                  dark
                    ? "text-white/45 hover:text-white hover:bg-white/10 focus-visible:ring-cyan-400"
                    : "text-[#2a1008]/45 hover:text-[#2a1008] hover:bg-[#8b1a1a]/10 focus-visible:ring-[#8b1a1a]"
                }`}
              >
                <FiMoreHorizontal className="text-lg" />
              </button>

              {/* Popup Dropdown */}
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute right-0 top-8 z-30 w-48 rounded-xl p-1.5 shadow-xl border backdrop-blur-xl ${
                      dark
                        ? "bg-[#0c1424]/95 border-white/15 text-white"
                        : "bg-[#fffaf2]/95 border-[#8b1a1a]/20 text-[#2a1008]"
                    }`}
                  >
                    <Link
                      href={`/engineering-lab/${project.slug}`}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        dark ? "hover:bg-white/10 text-white/85" : "hover:bg-[#8b1a1a]/10 text-[#2a1008]"
                      }`}
                    >
                      <FaArrowRight className="text-[10px]" /> View Case Study
                    </Link>

                    {liveUrl && (
                      <a
                        href={liveUrl}
                        target={liveUrl.startsWith("http") ? "_blank" : undefined}
                        rel={liveUrl.startsWith("http") ? "noopener noreferrer" : undefined}
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          dark ? "hover:bg-white/10 text-white/85" : "hover:bg-[#8b1a1a]/10 text-[#2a1008]"
                        }`}
                      >
                        <FiExternalLink className="text-xs" /> Open Live Demo
                      </a>
                    )}

                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                          dark ? "hover:bg-white/10 text-white/85" : "hover:bg-[#8b1a1a]/10 text-[#2a1008]"
                        }`}
                      >
                        <FiGithub className="text-xs" /> GitHub Repository
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                        dark ? "hover:bg-white/10 text-white/85" : "hover:bg-[#8b1a1a]/10 text-[#2a1008]"
                      }`}
                    >
                      {copied ? (
                        <>
                          <FiCheck className="text-xs text-emerald-400" /> Copied!
                        </>
                      ) : (
                        <>
                          <FiCopy className="text-xs" /> Copy Project Link
                        </>
                      )}
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Project Title */}
          <h2
            className={`mt-3 sm:mt-4 text-2xl sm:text-3xl font-bold tracking-tight transition-colors ${
              dark ? "text-white" : "text-[#2a1008]"
            }`}
          >
            {project.title}
          </h2>

          {/* Project Description */}
          <p
            className={`mt-2 text-sm sm:text-[14px] leading-relaxed transition-colors ${
              dark ? "text-white/65" : "text-[#7a4a35]"
            }`}
          >
            {project.description}
          </p>

          {/* Technologies Tag Pills */}
          {displayedTech.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {displayedTech.map((tech) => (
                <span
                  key={tech}
                  className={`px-3 py-1 rounded-full text-[11px] font-medium transition-colors ${
                    dark
                      ? "bg-white/[0.04] border border-white/10 text-white/75 hover:border-cyan-400/40"
                      : "bg-[#8b1a1a]/[0.05] border border-[#8b1a1a]/15 text-[#7a4a35] hover:border-[#8b1a1a]/30"
                  }`}
                >
                  {tech}
                </span>
              ))}
            </div>
          )}

          {/* Bottom Action Row */}
          <div className="mt-6 sm:mt-7 flex items-center justify-between gap-4 pt-1">
            {/* Primary Button: Explore Project ↗ */}
            {exploreUrl.startsWith("http") ? (
              <a
                href={exploreUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 active:scale-[0.98] ${
                  dark
                    ? "bg-[#38bdf8] text-[#030712] shadow-lg shadow-cyan-500/25 hover:bg-[#7dd3fc] hover:shadow-cyan-400/35 focus-visible:ring-cyan-300"
                    : "bg-[#8b1a1a] text-white shadow-md shadow-[#8b1a1a]/25 hover:bg-[#721515] hover:shadow-[#8b1a1a]/40 focus-visible:ring-[#8b1a1a]"
                }`}
              >
                Live Demo
                <FaArrowUpRightFromSquare className="text-[10px]" />
              </a>
            ) : (
              <Link
                href={exploreUrl}
                className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold tracking-wide transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 active:scale-[0.98] ${
                  dark
                    ? "bg-[#38bdf8] text-[#030712] shadow-lg shadow-cyan-500/25 hover:bg-[#7dd3fc] hover:shadow-cyan-400/35 focus-visible:ring-cyan-300"
                    : "bg-[#8b1a1a] text-white shadow-md shadow-[#8b1a1a]/25 hover:bg-[#721515] hover:shadow-[#8b1a1a]/40 focus-visible:ring-[#8b1a1a]"
                }`}
              >
                Explore Project
                <FaArrowUpRightFromSquare className="text-[10px]" />
              </Link>
            )}

            {/* Secondary CTA: View Details → */}
            <Link
              href={`/engineering-lab/${project.slug}`}
              className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 rounded-lg px-2 py-1 ${
                dark
                  ? "text-white/60 hover:text-white focus-visible:ring-cyan-400"
                  : "text-[#7a4a35] hover:text-[#2a1008] focus-visible:ring-[#8b1a1a]"
              }`}
            >
              View Details
              <FaArrowRight className="text-[10px] transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}