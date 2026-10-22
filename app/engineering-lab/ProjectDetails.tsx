"use client";

import Image from "next/image";
import Link from "next/link";
import { FaArrowLeft, FaGithub, FaPlay } from "react-icons/fa";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import { useTheme } from "../theme-provider";
import type { EngineeringProject } from "@/data/engineeringProjects";
import ProjectCard from "./ProjectCard";
import ProjectVisual from "./ProjectVisual";
import SankatSaathiLiveDemo from "./SankatSaathiLiveDemo";
import AtlasLiveDemo from "./AtlasLiveDemo";

function ProjectLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const internal = href.startsWith("/");
  const className =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-lab-fg/15 bg-lab-fg/[0.04] px-5 text-xs font-semibold text-lab-fg/80 transition hover:border-lab-accent/40 hover:bg-lab-accent/[0.08] hover:text-lab-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lab-accent focus-visible:ring-offset-2 focus-visible:ring-offset-lab-bg";

  if (internal) {
    return <Link href={href} className={className}>{children}</Link>;
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}

const eyebrow = "text-[10px] font-semibold uppercase tracking-[0.18em] text-lab-accent/70";
const muted = "text-[10px] font-semibold uppercase tracking-[0.18em] text-lab-fg/40";

export default function ProjectDetails({
  project,
  relatedProjects,
}: {
  project: EngineeringProject;
  relatedProjects: EngineeringProject[];
}) {
  const { dark, toggle } = useTheme();
  const hasOverview = Boolean(
    project.overview || project.intendedFor || project.role || project.duration,
  );

  return (
    <main className="engineering-lab min-h-screen overflow-hidden bg-lab-bg text-lab-fg transition-colors duration-500">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute -left-64 top-24 h-[36rem] w-[36rem] rounded-full bg-lab-accent/[0.07] blur-[150px]" />
        <div className="absolute -right-64 top-[35rem] h-[38rem] w-[38rem] rounded-full bg-violet-600/[0.08] blur-[150px]" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8 lg:px-12">
        <Link
          href="/engineering-lab"
          className="inline-flex min-h-11 items-center gap-3 text-sm text-lab-fg/65 transition hover:text-lab-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lab-accent focus-visible:ring-offset-4 focus-visible:ring-offset-lab-bg"
        >
          <FaArrowLeft aria-hidden="true" className="text-xs text-lab-accent" />
          Engineering Lab
        </Link>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggle}
            aria-label={dark ? "Switch to Day Mode" : "Switch to Night Mode"}
            title={dark ? "Switch to Day Mode" : "Switch to Night Mode"}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-lab-fg/15 bg-lab-fg/[0.04] text-sm shadow-sm transition hover:border-lab-accent/40"
          >
            {dark ? "☀️" : "🌙"}
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center text-xs font-medium text-lab-fg/50 transition hover:text-lab-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-lab-accent focus-visible:ring-offset-4 focus-visible:ring-offset-lab-bg"
          >
            Main portfolio
          </Link>
        </div>
      </header>

      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:px-12">
        <section className="pt-8 sm:pt-14">
          <p className="mb-5 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-lab-accent/65">
            ENGINEERING LAB / PROJECT
          </p>
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <h1 className="text-5xl font-semibold tracking-[-0.06em] sm:text-7xl">
                {project.title}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-lab-fg/60 sm:text-lg">
                {project.description}
              </p>
              {project.status && (
                <p className="mt-5 inline-flex rounded-full border border-lab-fg/10 bg-lab-fg/[0.03] px-3 py-1.5 text-xs text-lab-fg/60">
                  {project.status}
                </p>
              )}
            </div>
            <div className="flex flex-wrap gap-2 lg:justify-end">
              {project.liveDemoUrl && (
                <ProjectLink href={project.liveDemoUrl}>
                  <FaArrowUpRightFromSquare aria-hidden="true" /> Live Demo
                </ProjectLink>
              )}
              {project.githubUrl && (
                <ProjectLink href={project.githubUrl}>
                  <FaGithub aria-hidden="true" /> GitHub Repository
                </ProjectLink>
              )}
              {project.demoVideoUrl && (
                <ProjectLink href={project.demoVideoUrl}>
                  <FaPlay aria-hidden="true" /> Demo Video
                </ProjectLink>
              )}
            </div>
          </div>
          <div className="group mt-10 overflow-hidden rounded-3xl border border-lab-fg/10 bg-lab-surface">
            <ProjectVisual project={project} variant="hero" />
          </div>
        </section>

        {hasOverview && (
          <section className="grid gap-8 border-b border-lab-fg/10 py-12 sm:grid-cols-2 lg:grid-cols-4">
            {project.overview && (
              <div className="sm:col-span-2">
                <p className={muted}>Overview</p>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-lab-fg/70">{project.overview}</p>
              </div>
            )}
            {project.intendedFor && (
              <div>
                <p className={muted}>Made for</p>
                <p className="mt-3 text-sm leading-6 text-lab-fg/70">{project.intendedFor}</p>
              </div>
            )}
            {(project.role || project.duration) && (
              <div>
                {project.role && (
                  <>
                    <p className={muted}>Role</p>
                    <p className="mt-3 text-sm leading-6 text-lab-fg/70">{project.role}</p>
                  </>
                )}
                {project.duration && (
                  <>
                    <p className={`mt-5 ${muted}`}>Duration</p>
                    <p className="mt-3 text-sm leading-6 text-lab-fg/70">{project.duration}</p>
                  </>
                )}
              </div>
            )}
          </section>
        )}

        {/* Interactive Live Demo */}
        {project.slug === "sankat-saathi" && (
          <section className="border-b border-lab-fg/10 py-12">
            <p className={eyebrow}>Live System Simulation</p>
            <h2 className="mt-3 mb-8 text-2xl font-semibold tracking-tight">Interactive Emergency Coordination Engine</h2>
            <SankatSaathiLiveDemo />
          </section>
        )}

        {project.slug === "atlas" && (
          <section className="border-b border-lab-fg/10 py-12">
            <p className={eyebrow}>Interactive Life OS</p>
            <h2 className="mt-3 mb-8 text-2xl font-semibold tracking-tight">Explore the Productivity Engines</h2>
            <AtlasLiveDemo />
          </section>
        )}

        {project.features && project.features.length > 0 && (
          <section className="grid gap-6 border-b border-lab-fg/10 py-12 md:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className={eyebrow}>What it does</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">Built into the experience</h2>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {project.features.map((feature, index) => (
                <li key={feature} className="flex gap-3 rounded-xl border border-lab-fg/10 bg-lab-fg/[0.025] p-4 text-sm leading-6 text-lab-fg/70">
                  <span className="font-mono text-[10px] text-lab-accent/70">0{index + 1}</span>
                  {feature}
                </li>
              ))}
            </ul>
          </section>
        )}

        {project.technologies && project.technologies.length > 0 && (
          <section className="border-b border-lab-fg/10 py-12">
            <p className={eyebrow}>Technology</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">Tools behind the build</h2>
            <ul className="mt-5 flex flex-wrap gap-2">
              {project.technologies.map((technology) => (
                <li key={technology} className="rounded-full border border-lab-fg/10 bg-lab-fg/[0.04] px-4 py-2 text-xs text-lab-fg/70">
                  {technology}
                </li>
              ))}
            </ul>
          </section>
        )}

        {project.screenshots && project.screenshots.length > 0 && (
          <section className="border-b border-lab-fg/10 py-12">
            <p className={eyebrow}>In the product</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">A closer look</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {project.screenshots.map((screenshot) => (
                <figure key={screenshot.src} className="overflow-hidden rounded-2xl border border-lab-fg/10 bg-lab-fg/[0.02]">
                  <div className="group relative aspect-[1.55] overflow-hidden">
                    <Image
                      src={screenshot.src}
                      alt={screenshot.alt}
                      fill
                      sizes="(max-width: 768px) 100vw, 50vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  </div>
                  {screenshot.caption && (
                    <figcaption className="px-4 py-3 text-xs leading-5 text-lab-fg/55">{screenshot.caption}</figcaption>
                  )}
                </figure>
              ))}
            </div>
          </section>
        )}

        {project.contributions && project.contributions.length > 0 && (
          <section className="border-b border-lab-fg/10 py-12">
            <p className={eyebrow}>My contribution</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {project.contributions.map((contribution) => (
                <li key={contribution} className="rounded-xl border border-lab-fg/10 bg-lab-fg/[0.025] p-4 text-sm leading-6 text-lab-fg/70">{contribution}</li>
              ))}
            </ul>
          </section>
        )}

        {project.team && project.team.length > 0 && (
          <section className="border-b border-lab-fg/10 py-12">
            <p className={eyebrow}>The people behind it</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {project.team.map((member) => (
                <article key={`${member.name}-${member.role}`} className="flex gap-4 rounded-2xl border border-lab-fg/10 bg-lab-fg/[0.03] p-5">
                  {member.photo ? (
                    <div className="relative h-[52px] w-[52px] shrink-0 overflow-hidden rounded-full border-2 border-lab-accent/40 shadow-sm">
                      <Image
                        src={member.photo}
                        alt={member.name}
                        width={52}
                        height={52}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div aria-hidden="true" className="h-[52px] w-[52px] shrink-0 rounded-full border border-lab-accent/20 bg-gradient-to-br from-cyan-300/20 to-violet-400/20" />
                  )}
                  <div>
                    <h3 className="text-sm font-semibold">{member.name}</h3>
                    <p className="mt-1 text-xs text-lab-accent/70">{member.role}</p>
                    <p className="mt-2 text-xs leading-5 text-lab-fg/55">{member.contribution}</p>
                    <div className="mt-3 flex gap-3 text-[11px]">
                      {member.linkedin && <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-lab-fg/55 hover:text-lab-accent">LinkedIn</a>}
                      {member.github && <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-lab-fg/55 hover:text-lab-accent">GitHub</a>}
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {relatedProjects.length > 0 && (
          <section className="py-14">
            <div className="mb-6 flex items-end justify-between gap-4">
              <div>
                <p className={eyebrow}>Keep exploring</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight">More from the lab</h2>
              </div>
              <Link href="/engineering-lab" className="inline-flex min-h-11 items-center self-end text-xs text-lab-fg/55 transition hover:text-lab-accent">All projects →</Link>
            </div>
            <div className="flex flex-col gap-6">
              {relatedProjects.map((related, index) => (
                <ProjectCard
                  key={related.id}
                  project={related}
                  index={index}
                  totalProjects={relatedProjects.length}
                  dark={dark}
                />
              ))}
            </div>
          </section>
        )}

        <footer className="flex flex-col gap-4 border-t border-lab-fg/10 pt-6 text-xs text-lab-fg/40 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Pavan Kumar</span>
          <Link href="/" className="inline-flex min-h-11 items-center transition hover:text-lab-accent">Back to main portfolio →</Link>
        </footer>
      </div>
    </main>
  );
}