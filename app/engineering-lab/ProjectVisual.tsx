import Image from "next/image";
import {
  FaCompass,
  FaCubes,
  FaHandsHelping,
} from "react-icons/fa";
import type { EngineeringProject } from "@/data/engineeringProjects";

const projectArt = {
  portfolio: {
    icon: FaCubes,
    label: "Interactive 3D",
    symbol: "01",
  },
  atlas: {
    icon: FaCompass,
    label: "Student productivity",
    symbol: "02",
  },
  relief: {
    icon: FaHandsHelping,
    label: "Relief coordination",
    symbol: "03",
  },
};

export default function ProjectVisual({
  project,
  variant = "card",
}: {
  project: EngineeringProject;
  variant?: "card" | "hero";
}) {
  const art = projectArt[project.icon];
  const Icon = art.icon;
  const image = variant === "hero"
    ? project.bannerImage || project.coverImage
    : project.coverImage;

  return (
    <div
      className={`project-art project-art--${project.icon} project-art--${variant} relative isolate overflow-hidden`}
    >
      {image ? (
        <Image
          src={image}
          alt={`${project.title} application`}
          fill
          sizes={variant === "hero" ? "(max-width: 1024px) 100vw, 60vw" : "(max-width: 768px) 100vw, 70vw"}
          className="object-cover transition-transform duration-700 group-hover:scale-[1.035]"
        />
      ) : (
        <>
          <div aria-hidden="true" className="project-art__grid absolute inset-0" />
          <div aria-hidden="true" className="project-art__orb absolute" />
          <div aria-hidden="true" className="project-art__orbit project-art__orbit--one absolute" />
          <div aria-hidden="true" className="project-art__orbit project-art__orbit--two absolute" />
          <div className="project-art__mark absolute inset-0 flex flex-col items-center justify-center">
            <span className="project-art__index font-mono text-[10px] tracking-[0.3em]">
              PROJECT / {art.symbol}
            </span>
            <span className="project-art__icon mt-5 flex items-center justify-center rounded-2xl border border-white/15 bg-[#07101e]/55 shadow-2xl backdrop-blur">
              <Icon aria-hidden="true" />
            </span>
            <span className="mt-5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/65 sm:text-xs">
              {art.label}
            </span>
            <span className="absolute bottom-5 right-5 rounded-full border border-white/10 bg-[#030712]/50 px-3 py-1.5 text-[8px] font-medium uppercase tracking-[0.16em] text-white/40 backdrop-blur">
              Original project artwork
            </span>
          </div>
          <span aria-hidden="true" className="project-art__corner project-art__corner--tl" />
          <span aria-hidden="true" className="project-art__corner project-art__corner--br" />
        </>
      )}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#030712]/45 to-transparent" />
    </div>
  );
}
