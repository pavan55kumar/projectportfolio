"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import type { EngineeringProject } from "@/data/engineeringProjects";
import ProjectVisual from "./ProjectVisual";

export default function ProjectCard({
  project,
  featured = false,
  index,
}: {
  project: EngineeringProject;
  featured?: boolean;
  index: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.55, delay: reduceMotion ? 0 : index * 0.07, ease: [0.22, 1, 0.36, 1] }}
      className={`project-card group overflow-hidden rounded-3xl border border-lab-fg/10 bg-lab-surface/90 text-lab-fg transition duration-500 hover:-translate-y-1.5 hover:border-lab-accent/30 hover:shadow-[0_25px_80px_-20px_rgba(0,0,0,0.35)] ${
        featured ? "lg:col-span-2 lg:grid lg:grid-cols-[1.35fr_0.65fr]" : ""
      }`}
    >
      <Link
        href={`/engineering-lab/${project.slug}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-lab-accent"
        aria-label={`Explore ${project.title}`}
      >
        <ProjectVisual project={project} variant={featured ? "hero" : "card"} />
      </Link>
      <div className={`flex flex-col p-5 sm:p-7 ${featured ? "lg:justify-center lg:p-9" : ""}`}>
        <div className="flex items-center justify-between gap-4">
          <p className="font-mono text-[10px] font-medium uppercase tracking-[0.2em] text-lab-accent/70">
            SELECTED PROJECT / 0{index + 1}
          </p>
          {project.status && (
            <span className="rounded-full border border-lab-fg/10 px-3 py-1 text-[10px] text-lab-fg/55">
              {project.status}
            </span>
          )}
        </div>
        <h2 className={`mt-3 font-semibold tracking-[-0.045em] text-lab-fg ${featured ? "text-3xl sm:text-4xl" : "text-2xl"}`}>
          {project.title}
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-6 text-lab-fg/60">{project.description}</p>

        {project.technologies && project.technologies.length > 0 && (
          <ul className="mt-5 flex flex-wrap gap-2" aria-label={`${project.title} technologies`}>
            {project.technologies.slice(0, featured ? 6 : 4).map((technology) => (
              <li key={technology} className="rounded-full border border-lab-fg/10 bg-lab-fg/[0.03] px-3 py-1.5 text-[10px] text-lab-fg/65">
                {technology}
              </li>
            ))}
          </ul>
        )}

        <Link
          href={`/engineering-lab/${project.slug}`}
          className="mt-7 inline-flex min-h-11 w-fit items-center gap-2 text-xs font-semibold text-lab-accent transition hover:gap-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lab-accent focus-visible:ring-offset-4 focus-visible:ring-offset-lab-surface"
        >
          Explore Project
          <FaArrowUpRightFromSquare aria-hidden="true" className="text-[10px]" />
        </Link>
      </div>
    </motion.article>
  );
}