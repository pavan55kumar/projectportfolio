"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FaArrowRight } from "react-icons/fa6";
import {
  FiMoreHorizontal,
  FiGithub,
  FiCopy,
  FiCheck,
} from "react-icons/fi";
import type { EngineeringProject } from "@/data/engineeringProjects";

export default function ProjectCard({
  project,
  index,
  totalProjects = 5,
  dark = true,
}: {
  project: EngineeringProject;
  index: number;
  totalProjects?: number;
  dark?: boolean;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  // Check if project has an uploaded cover or banner image
  const uploadedImage = project.coverImage || project.bannerImage;

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

  const featuredTechMap: Record<string, string[]> = {
    "sankat-saathi": [
      "React 18",
      "Vite",
      "Tailwind CSS",
      "Supabase",
      "IBM Z",
      "FastAPI",
    ],
    atlas: ["React 18", "Vite", "Tailwind CSS", "Framer Motion", "PWA"],
    "portfolio-3d": [
      "React 18",
      "Three.js",
      "Open-Meteo API",
      "Express.js",
      "Node.js",
      "WebGL",
    ],
    "weather-app": [
      "React 18",
      "Express.js",
      "Tailwind CSS",
      "Open-Meteo API",
      "Leaflet",
    ],
    "spam-detection": [
      "Python",
      "scikit-learn",
      "NLTK",
      "Streamlit",
      "Transformers",
    ],
    "note-saver": ["Python", "Flask", "Jinja2", "SQLite", "JavaScript"],
  };

  const allTech =
    featuredTechMap[project.slug] ||
    featuredTechMap[project.id] ||
    project.technologies ||
    [];

  const visibleTech = allTech.slice(0, 3);
  const remainingCount = Math.max(0, allTech.length - 3);

  // Status badge config
  const renderStatusBadge = () => {
    const slug = project.slug || project.id;

    if (slug === "sankat-saathi") {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold transition-colors ${
            dark
              ? "bg-[#0b2238] text-cyan-300 border border-cyan-500/30"
              : "bg-[#faeedd] text-[#8b1a1a] border border-[#8b1a1a]/25"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${dark ? "bg-cyan-400 shadow-[0_0_6px_#22d3ee]" : "bg-[#8b1a1a]"}`} />
          {project.status || "IBM Z Datathon Project"}
        </span>
      );
    }

    if (slug === "atlas") {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold transition-colors ${
            dark
              ? "bg-[#062018] text-emerald-300 border border-emerald-500/30"
              : "bg-[#ecfdf5] text-emerald-800 border border-emerald-600/25"
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
          {project.status || "Active Production PWA"}
        </span>
      );
    }

    if (slug === "portfolio-3d" || slug === "project-orbital") {
      return (
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold transition-colors ${
            dark
              ? "bg-[#1b0d2e] text-purple-300 border border-purple-500/30"
              : "bg-[#f5eefc] text-purple-800 border border-purple-500/25"
          }`}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-purple-400" />
          {project.status || "Live on Vercel"}
        </span>
      );
    }

    // Default / Engineering Lab
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold transition-colors ${
          dark
            ? "bg-[#0b2238] text-cyan-300 border border-cyan-500/30"
            : "bg-[#faeedd] text-[#8b1a1a] border border-[#8b1a1a]/25"
        }`}
      >
        <span className={`h-1.5 w-1.5 rounded-full ${dark ? "bg-cyan-400" : "bg-[#8b1a1a]"}`} />
        {project.status || "Engineering Lab"}
      </span>
    );
  };


  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.5, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative rounded-2xl sm:rounded-3xl border transition-all duration-300 overflow-hidden ${
        dark
          ? "bg-[#070d18]/90 border-white/[0.08] hover:border-cyan-400/30 hover:shadow-[0_15px_40px_rgba(0,0,0,0.5)]"
          : "bg-[#fbf5ea] border-[#8b1a1a]/15 hover:border-[#8b1a1a]/35 hover:shadow-lg"
      }`}
    >
      <div className="p-3.5 sm:p-5 lg:p-6 grid grid-cols-[130px_1fr] min-[480px]:grid-cols-[150px_1fr] sm:grid-cols-[190px_1fr] lg:grid-cols-[230px_1fr] gap-3.5 sm:gap-5 lg:gap-6 items-center">
        {/* ── Left Column: Clean Uploaded Project Image ── */}
        <Link
          href={`/engineering-lab/${project.slug}`}
          className="block w-full h-full relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 rounded-xl sm:rounded-2xl overflow-hidden group/image"
          aria-label={`View deep-dive for ${project.title}`}
        >
          <div
            className={`relative w-full h-full min-h-[160px] sm:min-h-[185px] rounded-xl sm:rounded-2xl overflow-hidden border transition-all duration-300 ${
              dark
                ? "bg-[#040a16] border-white/10 group-hover/image:border-cyan-400/40 shadow-sm"
                : "bg-[#faeedd] border-[#8b1a1a]/20 group-hover/image:border-[#8b1a1a]/40 shadow-sm"
            }`}
          >
            {uploadedImage ? (
              <>
                <Image
                  src={uploadedImage}
                  alt={project.title}
                  fill
                  sizes="(max-width: 640px) 150px, (max-width: 1024px) 200px, 240px"
                  className="object-cover transition-transform duration-500 group-hover/image:scale-105"
                  unoptimized={uploadedImage.startsWith("data:")}
                  priority={index === 0}
                />
                {/* Subtle dark gradient overlay at bottom for clean index visibility */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent pointer-events-none" />
              </>
            ) : (
              <div
                className={`w-full h-full flex flex-col items-center justify-center p-4 text-center select-none ${
                  dark ? "bg-[#08111e] text-white/50" : "bg-[#f5e7d5] text-[#7a4a35]"
                }`}
              >
                <span className="text-3xl mb-1">⚡</span>
                <span className="text-[10px] font-bold uppercase tracking-wider">{project.category || "Project"}</span>
              </div>
            )}

            {/* Bottom index bar */}
            <div className="absolute bottom-2 inset-x-2.5 z-10 flex items-center justify-between pointer-events-none">
              <span className="font-mono text-[9px] sm:text-[10px] font-bold tracking-wider text-white drop-shadow-md">
                {String(index + 1).padStart(2, "0")} / {String(totalProjects).padStart(2, "0")}
              </span>
              <span className={`h-1.5 w-1.5 rounded-full ${dark ? "bg-cyan-400 shadow-[0_0_8px_#22d3ee]" : "bg-[#faeedd]"}`} />
            </div>
          </div>
        </Link>

        {/* ── Right Column: Project Info & Actions ── */}
        <div className="flex flex-col justify-between h-full min-w-0">
          {/* Top Row: Status badge & Menu */}
          <div className="flex items-center justify-between gap-2">
            <div className="min-w-0 truncate">
              {renderStatusBadge()}
            </div>

            {/* Three Dots Menu Button */}
            <div className="relative shrink-0">
              <button
                type="button"
                onClick={() => setMenuOpen(!menuOpen)}
                aria-label="More options"
                className={`p-1 sm:p-1.5 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 ${
                  dark
                    ? "text-white/40 hover:text-white hover:bg-white/10 focus-visible:ring-cyan-400"
                    : "text-[#2a1008]/40 hover:text-[#2a1008] hover:bg-[#8b1a1a]/10 focus-visible:ring-[#8b1a1a]"
                }`}
              >
                <FiMoreHorizontal className="text-base sm:text-lg" />
              </button>

              {/* Popup Dropdown */}
              <AnimatePresence>
                {menuOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className={`absolute right-0 top-8 z-30 w-44 rounded-xl p-1.5 shadow-xl border backdrop-blur-xl ${
                      dark
                        ? "bg-[#0c1424]/95 border-white/15 text-white"
                        : "bg-[#fffaf2]/95 border-[#8b1a1a]/20 text-[#2a1008]"
                    }`}
                  >
                    <Link
                      href={`/engineering-lab/${project.slug}`}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        dark
                          ? "hover:bg-white/10 text-white/85"
                          : "hover:bg-[#8b1a1a]/10 text-[#2a1008]"
                      }`}
                    >
                      <FaArrowRight className="text-[10px]" /> View Case Study
                    </Link>

                    {project.githubUrl && (
                      <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setMenuOpen(false)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          dark
                            ? "hover:bg-white/10 text-white/85"
                            : "hover:bg-[#8b1a1a]/10 text-[#2a1008]"
                        }`}
                      >
                        <FiGithub className="text-xs" /> GitHub Repository
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={handleCopyLink}
                      className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        dark
                          ? "hover:bg-white/10 text-white/85"
                          : "hover:bg-[#8b1a1a]/10 text-[#2a1008]"
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
          <Link
            href={`/engineering-lab/${project.slug}`}
            className="block mt-1 sm:mt-1.5 group/title focus-visible:outline-none"
          >
            <h3
              className={`text-base sm:text-lg lg:text-xl font-bold tracking-tight transition-colors line-clamp-1 ${
                dark
                  ? "text-white group-hover/title:text-cyan-300"
                  : "text-[#2a1008] group-hover/title:text-[#8b1a1a]"
              }`}
            >
              {project.title}
            </h3>
          </Link>

          {/* Project Description (line-clamped for crisp layout) */}
          <p
            className={`mt-1 text-[11px] sm:text-xs leading-relaxed line-clamp-2 transition-colors ${
              dark ? "text-white/60" : "text-[#7a4a35]"
            }`}
          >
            {project.description}
          </p>

          {/* Tech Tags with +N badge */}
          {visibleTech.length > 0 && (
            <div className="mt-2.5 sm:mt-3 flex flex-wrap gap-1 sm:gap-1.5 items-center">
              {visibleTech.map((tech) => (
                <span
                  key={tech}
                  className={`px-2 sm:px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-medium transition-colors ${
                    dark
                      ? "bg-white/[0.04] border border-white/10 text-white/70 hover:border-cyan-400/40"
                      : "bg-[#8b1a1a]/[0.05] border border-[#8b1a1a]/15 text-[#7a4a35]"
                  }`}
                >
                  {tech}
                </span>
              ))}

              {remainingCount > 0 && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] sm:text-[11px] font-semibold transition-colors ${
                    dark
                      ? "bg-white/[0.06] border border-white/10 text-cyan-300/80"
                      : "bg-[#8b1a1a]/10 border border-[#8b1a1a]/20 text-[#8b1a1a]"
                  }`}
                >
                  +{remainingCount}
                </span>
              )}
            </div>
          )}

          {/* Bottom Action Row: View Details Link */}
          <div className="mt-3 sm:mt-4 flex items-center justify-end pt-1">
            <Link
              href={`/engineering-lab/${project.slug}`}
              className={`inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 rounded-lg py-1 px-1.5 ${
                dark
                  ? "text-cyan-400 hover:text-cyan-300 focus-visible:ring-cyan-400 hover:translate-x-0.5"
                  : "text-[#8b1a1a] hover:text-[#721515] focus-visible:ring-[#8b1a1a] hover:translate-x-0.5"
              }`}
            >
              <span>View Details</span>
              <FaArrowRight className="text-[11px] transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </div>
    </motion.article>
  );
}