"use client";

import React from "react";
import {
  SiReact,
  SiNextdotjs,
  SiThreedotjs,
  SiTailwindcss,
  SiTypescript,
  SiGreensock,
  SiHtml5,
  SiCss3,
  SiNodedotjs,
  SiExpress,
  SiSupabase,
  SiPostgresql,
  SiMongodb,
  SiFirebase,
  SiDocker,
  SiGit,
  SiGithub,
  SiC,
  SiCplusplus,
  SiFigma,
  SiBlender,
  SiRedux,
  SiVite,
  SiGraphql,
  SiPrisma,
  SiLinux,
  SiAmazonwebservices,
  SiPostman,
} from "react-icons/si";
import { FiPenTool, FiCpu } from "react-icons/fi";
import { FaJava } from "react-icons/fa";

export type SkillCategory =
  | "Frontend & 3D"
  | "Languages"
  | "Backend & DB"
  | "Design & 3D"
  | "DevOps & Tools";

export interface CatalogSkill {
  key: string;
  name: string;
  category: SkillCategory;
  color?: string;
}

export const SKILLS_CATALOG: CatalogSkill[] = [
  // ── 1. FRONTEND & 3D (Initial 8 include React, Three.js, Next.js, Tailwind, GSAP) ──
  { key: "react", name: "React", category: "Frontend & 3D", color: "#00d8ff" },
  { key: "threejs", name: "Three.js", category: "Frontend & 3D", color: "#00ffff" },
  { key: "nextjs", name: "Next.js", category: "Frontend & 3D", color: "#ffffff" },
  { key: "tailwind", name: "Tailwind", category: "Frontend & 3D", color: "#38bdf8" },
  { key: "gsap", name: "GSAP", category: "Frontend & 3D", color: "#0ae448" },
  { key: "vite", name: "Vite", category: "Frontend & 3D", color: "#bd34fe" },
  { key: "redux", name: "Redux", category: "Frontend & 3D", color: "#764abc" },
  { key: "html5", name: "HTML5", category: "Frontend & 3D", color: "#e34f26" },
  { key: "css3", name: "CSS3", category: "Frontend & 3D", color: "#1572b6" },

  // ── 2. LANGUAGES (Initial 8 include JavaScript, Python) ──
  { key: "javascript", name: "JavaScript", category: "Languages", color: "#f7df1e" },
  { key: "python", name: "Python", category: "Languages", color: "#3776ab" },
  { key: "typescript", name: "TypeScript", category: "Languages", color: "#3178c6" },
  { key: "c", name: "C", category: "Languages", color: "#a8b9cc" },
  { key: "cpp", name: "C++", category: "Languages", color: "#00599c" },
  { key: "java", name: "Java", category: "Languages", color: "#e76f00" },

  // ── 3. DESIGN & 3D (Initial 8 includes UI/UX) ──
  { key: "uiux", name: "UI/UX", category: "Design & 3D", color: "#00e5ff" },
  { key: "figma", name: "Figma", category: "Design & 3D", color: "#f24e1e" },
  { key: "blender", name: "Blender", category: "Design & 3D", color: "#ea7600" },

  // ── 4. BACKEND & DATABASES ──
  { key: "nodejs", name: "Node.js", category: "Backend & DB", color: "#5fa04e" },
  { key: "express", name: "Express.js", category: "Backend & DB", color: "#ffffff" },
  { key: "supabase", name: "Supabase", category: "Backend & DB", color: "#3ecf8e" },
  { key: "postgresql", name: "PostgreSQL", category: "Backend & DB", color: "#4169e1" },
  { key: "mongodb", name: "MongoDB", category: "Backend & DB", color: "#47a248" },
  { key: "firebase", name: "Firebase", category: "Backend & DB", color: "#ffca28" },
  { key: "prisma", name: "Prisma", category: "Backend & DB", color: "#2d3748" },
  { key: "graphql", name: "GraphQL", category: "Backend & DB", color: "#e10098" },

  // ── 5. DEVOPS, CLOUD & TOOLS ──
  { key: "git", name: "Git", category: "DevOps & Tools", color: "#f05032" },
  { key: "github", name: "GitHub", category: "DevOps & Tools", color: "#ffffff" },
  { key: "docker", name: "Docker", category: "DevOps & Tools", color: "#2496ed" },
  { key: "linux", name: "Linux", category: "DevOps & Tools", color: "#fcc624" },
  { key: "aws", name: "AWS", category: "DevOps & Tools", color: "#ff9900" },
  { key: "postman", name: "Postman", category: "DevOps & Tools", color: "#ff6c37" },
];

// Helper to normalize any input string into a catalog key
export function normalizeSkillKey(input: string): string {
  if (!input) return "other";
  const cleaned = input.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (cleaned.includes("react")) return "react";
  if (cleaned.includes("three")) return "threejs";
  if (cleaned.includes("next")) return "nextjs";
  if (cleaned.includes("tailwind")) return "tailwind";
  if (cleaned.includes("javascript") || cleaned === "js") return "javascript";
  if (cleaned.includes("python") || cleaned === "py") return "python";
  if (cleaned.includes("uiux") || cleaned.includes("ux") || cleaned.includes("ui")) return "uiux";
  if (cleaned.includes("gsap") || cleaned.includes("greensock")) return "gsap";
  if (cleaned.includes("typescript") || cleaned === "ts") return "typescript";
  if (cleaned.includes("html")) return "html5";
  if (cleaned.includes("css")) return "css3";
  if (cleaned.includes("node")) return "nodejs";
  if (cleaned.includes("express")) return "express";
  if (cleaned.includes("supabase")) return "supabase";
  if (cleaned.includes("postgres") || cleaned.includes("psql")) return "postgresql";
  if (cleaned.includes("mongo")) return "mongodb";
  if (cleaned.includes("firebase")) return "firebase";
  if (cleaned.includes("docker")) return "docker";
  if (cleaned.includes("github")) return "github";
  if (cleaned === "git") return "git";
  if (cleaned === "c") return "c";
  if (cleaned === "cpp" || cleaned.includes("cplus")) return "cpp";
  if (cleaned.includes("java") && !cleaned.includes("script")) return "java";
  if (cleaned.includes("figma")) return "figma";
  if (cleaned.includes("blender")) return "blender";
  if (cleaned.includes("redux")) return "redux";
  if (cleaned.includes("vite")) return "vite";
  if (cleaned.includes("graphql")) return "graphql";
  if (cleaned.includes("prisma")) return "prisma";
  if (cleaned.includes("linux")) return "linux";
  if (cleaned.includes("aws")) return "aws";
  if (cleaned.includes("postman")) return "postman";
  return cleaned;
}

export function SkillIcon({
  iconKey,
  iconUrl,
  name,
  className,
  size,
}: {
  iconKey?: string;
  iconUrl?: string;
  name?: string;
  className?: string;
  size?: number;
}) {
  const sizeStyle = size
    ? { width: `${size}px`, height: `${size}px`, fontSize: `${size}px` }
    : undefined;

  // If custom uploaded image
  if (iconUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={iconUrl}
        alt={name || "Skill logo"}
        style={sizeStyle}
        className={className || "w-6 h-6 object-contain"}
      />
    );
  }

  const key = normalizeSkillKey(iconKey || name || "");

  const iconContent = (() => {
    switch (key) {
      case "react":
        return <SiReact className="w-full h-full text-[#00d8ff]" />;
      case "threejs":
        return <SiThreedotjs className="w-full h-full text-[#00ffff]" />;
      case "nextjs":
        return <SiNextdotjs className="w-full h-full text-white" />;
      case "tailwind":
        return <SiTailwindcss className="w-full h-full text-[#38bdf8]" />;
      case "javascript":
        return (
          <div className="w-full h-full rounded-md bg-[#f7df1e] flex items-end justify-end p-0.5 font-black text-[10px] text-black leading-none select-none">
            JS
          </div>
        );
      case "python":
        return (
          <svg
            viewBox="0 0 110 110"
            className="w-full h-full"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M54.2 3.5C27 3.5 28.7 15.3 28.7 15.3l.03 12.2h25.9v3.7H18.2S3.5 29.5 3.5 56.6s12.9 26.2 12.9 26.2h7.7V72.2s-.4-12.9 12.7-12.9h25.7s12.2.2 12.2-11.8V15.7S78.9 3.5 54.2 3.5zm-14 8.2a4 4 0 1 1 0 8 4 4 0 0 1 0-8z"
              fill="#3776AB"
            />
            <path
              d="M55.8 106.5c27.2 0 25.5-11.8 25.5-11.8l-.03-12.2H55.3v-3.7h36.4s14.7 1.7 14.7-25.4-12.9-26.2-12.9-26.2h-7.7v10.6s.4 12.9-12.7 12.9H47.4s-12.2-.2-12.2 11.8v32.1s-2 11.9 20.6 11.9zm14-8.2a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"
              fill="#FFD438"
            />
          </svg>
        );
      case "uiux":
        return <FiPenTool className="w-full h-full text-[#00e5ff]" />;
      case "gsap":
        return <SiGreensock className="w-full h-full text-[#0ae448]" />;
      case "typescript":
        return <SiTypescript className="w-full h-full text-[#3178c6]" />;
      case "html5":
        return <SiHtml5 className="w-full h-full text-[#e34f26]" />;
      case "css3":
        return <SiCss3 className="w-full h-full text-[#1572b6]" />;
      case "nodejs":
        return <SiNodedotjs className="w-full h-full text-[#5fa04e]" />;
      case "express":
        return <SiExpress className="w-full h-full text-white" />;
      case "supabase":
        return <SiSupabase className="w-full h-full text-[#3ecf8e]" />;
      case "postgresql":
        return <SiPostgresql className="w-full h-full text-[#4169e1]" />;
      case "mongodb":
        return <SiMongodb className="w-full h-full text-[#47a248]" />;
      case "firebase":
        return <SiFirebase className="w-full h-full text-[#ffca28]" />;
      case "docker":
        return <SiDocker className="w-full h-full text-[#2496ed]" />;
      case "git":
        return <SiGit className="w-full h-full text-[#f05032]" />;
      case "github":
        return <SiGithub className="w-full h-full text-white" />;
      case "c":
        return <SiC className="w-full h-full text-[#a8b9cc]" />;
      case "cpp":
        return <SiCplusplus className="w-full h-full text-[#00599c]" />;
      case "java":
        return <FaJava className="w-full h-full text-[#e76f00]" />;
      case "figma":
        return <SiFigma className="w-full h-full text-[#f24e1e]" />;
      case "blender":
        return <SiBlender className="w-full h-full text-[#ea7600]" />;
      case "redux":
        return <SiRedux className="w-full h-full text-[#764abc]" />;
      case "vite":
        return <SiVite className="w-full h-full text-[#bd34fe]" />;
      case "graphql":
        return <SiGraphql className="w-full h-full text-[#e10098]" />;
      case "prisma":
        return <SiPrisma className="w-full h-full text-[#2d3748]" />;
      case "linux":
        return <SiLinux className="w-full h-full text-[#fcc624]" />;
      case "aws":
        return <SiAmazonwebservices className="w-full h-full text-[#ff9900]" />;
      case "postman":
        return <SiPostman className="w-full h-full text-[#ff6c37]" />;
      default:
        return <FiCpu className="w-full h-full text-cyan-300" />;
    }
  })();

  const wrapperClass = className || (size ? "" : "w-6 h-6");
  return (
    <div
      style={sizeStyle}
      className={`inline-flex items-center justify-center shrink-0 ${wrapperClass}`}
    >
      {iconContent}
    </div>
  );
}
