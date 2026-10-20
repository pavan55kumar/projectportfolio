import Image from "next/image";
import Link from "next/link";
import { FaArrowLeft, FaGithub, FaPlay } from "react-icons/fa";
import { FaArrowUpRightFromSquare } from "react-icons/fa6";
import type { EngineeringProject } from "@/data/engineeringProjects";
import ProjectCard from "./ProjectCard";
import ProjectVisual from "./ProjectVisual";

function ProjectLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const internal = href.startsWith("/");
  const className =
    "inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-5 text-xs font-semibold text-white/80 transition hover:border-cyan-200/35 hover:bg-cyan-300/[0.06] hover:text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030712]";

  if (internal) {
    return <Link href={href} className={className}>{children}</Link>;
  }

  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}

export default function ProjectDetails({
  project,
  relatedProjects,
}: {
  project: EngineeringProject;
  relatedProjects: EngineeringProject[];
}) {
  const hasOverview = Boolean(
    project.overview || project.intendedFor || project.role || project.duration,
  );

  return (
    <main className="engineering-lab min-h-screen overflow-hidden bg-[#030712] text-white">
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 -z-0 overflow-hidden">
        <div className="absolute -left-64 top-24 h-[36rem] w-[36rem] rounded-full bg-cyan-500/[0.07] blur-[150px]" />
        <div className="absolute -right-64 top-[35rem] h-[38rem] w-[38rem] rounded-full bg-violet-600/[0.08] blur-[150px]" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8 lg:px-12">
        <Link
          href="/connect"
          className="inline-flex min-h-11 items-center gap-3 text-sm text-white/60 transition hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-4 focus-visible:ring-offset-[#030712]"
        >
          <FaArrowLeft aria-hidden="true" className="text-xs text-cyan-200" />
          Engineering Lab
        </Link>
        <Link
          href="/"
          className="inline-flex min-h-11 items-center text-xs font-medium text-white/45 transition hover:text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-4 focus-visible:ring-offset-[#030712]"
        >
          Main portfolio
        </Link>
      </header>

      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:px-12">
        <section className="pt-8 sm:pt-14">
          <p className="mb-5 font-mono text-[10px] font-medium uppercase tracking-[0.22em] text-cyan-200/55">
            ENGINEERING LAB / PROJECT
          </p>
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <div>
              <h1 className="text-5xl font-semibold tracking-[-0.06em] sm:text-7xl">
                {project.title}
              </h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/55 sm:text-lg">
                {project.description}
              </p>
              {project.status && (
                <p className="mt-5 inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs text-white/55">
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
          <div className="group mt-10 overflow-hidden rounded-3xl border border-white/10 bg-[#080d17]">
            <ProjectVisual project={project} variant="hero" />
          </div>
        </section>

        {hasOverview && (
          <section className="grid gap-8 border-b border-white/[0.08] py-12 sm:grid-cols-2 lg:grid-cols-4">
            {project.overview && (
              <div className="sm:col-span-2">
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">Overview</p>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-white/65">{project.overview}</p>
              </div>
            )}
            {project.intendedFor && (
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">Made for</p>
                <p className="mt-3 text-sm leading-6 text-white/65">{project.intendedFor}</p>
              </div>
            )}
            {(project.role || project.duration) && (
              <div>
                {project.role && (
                  <>
                    <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">Role</p>
                    <p className="mt-3 text-sm leading-6 text-white/65">{project.role}</p>
                  </>
                )}
                {project.duration && (
                  <>
                    <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/35">Duration</p>
                    <p className="mt-3 text-sm leading-6 text-white/65">{project.duration}</p>
                  </>
                )}
              </div>
            )}
          </section>
        )}

        {project.features && project.features.length > 0 && (
          <section className="grid gap-6 border-b border-white/[0.08] py-12 md:grid-cols-[0.7fr_1.3fr]">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200/60">What it does</p>
              <h2 className="mt-3 text-2xl font-semibold tracking-tight">Built into the experience</h2>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2">
              {project.features.map((feature, index) => (
                <li key={feature} className="flex gap-3 rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-sm leading-6 text-white/65">
                  <span className="font-mono text-[10px] text-cyan-200/55">0{index + 1}</span>
                  {feature}
                </li>
              ))}
            </ul>
          </section>
        )}

        {project.technologies && project.technologies.length > 0 && (
          <section className="border-b border-white/[0.08] py-12">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200/60">Technology</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">Tools behind the build</h2>
            <ul className="mt-5 flex flex-wrap gap-2">
              {project.technologies.map((technology) => (
                <li key={technology} className="rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-xs text-white/65">
                  {technology}
                </li>
              ))}
            </ul>
          </section>
        )}

        {project.screenshots && project.screenshots.length > 0 && (
          <section className="border-b border-white/[0.08] py-12">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200/60">In the product</p>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight">A closer look</h2>
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {project.screenshots.map((screenshot) => (
                <figure key={screenshot.src} className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
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
                    <figcaption className="px-4 py-3 text-xs leading-5 text-white/50">{screenshot.caption}</figcaption>
                  )}
                </figure>
              ))}
            </div>
          </section>
        )}

        {project.contributions && project.contributions.length > 0 && (
          <section className="border-b border-white/[0.08] py-12">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200/60">My contribution</p>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {project.contributions.map((contribution) => (
                <li key={contribution} className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4 text-sm leading-6 text-white/65">{contribution}</li>
              ))}
            </ul>
          </section>
        )}

        {project.team && project.team.length > 0 && (
          <section className="border-b border-white/[0.08] py-12">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200/60">The people behind it</p>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {project.team.map((member) => (
                <article key={`${member.name}-${member.role}`} className="flex gap-4 rounded-2xl border border-white/[0.08] bg-white/[0.025] p-5">
                  {member.photo ? (
                    <Image src={member.photo} alt={member.name} width={52} height={52} className="h-13 w-13 rounded-full object-cover" />
                  ) : (
                    <div aria-hidden="true" className="h-13 w-13 shrink-0 rounded-full border border-cyan-200/15 bg-gradient-to-br from-cyan-300/20 to-violet-400/20" />
                  )}
                  <div>
                    <h3 className="text-sm font-semibold">{member.name}</h3>
                    <p className="mt-1 text-xs text-cyan-100/55">{member.role}</p>
                    <p className="mt-2 text-xs leading-5 text-white/45">{member.contribution}</p>
                    <div className="mt-3 flex gap-3 text-[11px]">
                      {member.linkedin && <a href={member.linkedin} target="_blank" rel="noopener noreferrer" className="text-white/45 hover:text-cyan-100">LinkedIn</a>}
                      {member.github && <a href={member.github} target="_blank" rel="noopener noreferrer" className="text-white/45 hover:text-cyan-100">GitHub</a>}
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
                <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-200/60">Keep exploring</p>
                <h2 className="mt-3 text-2xl font-semibold tracking-tight">More from the lab</h2>
              </div>
              <Link href="/connect" className="min-h-11 self-end text-xs text-white/45 transition hover:text-cyan-100">All projects →</Link>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              {relatedProjects.map((related, index) => (
                <ProjectCard key={related.id} project={related} index={index} />
              ))}
            </div>
          </section>
        )}

        <footer className="flex flex-col gap-4 border-t border-white/[0.08] pt-6 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Pavan Kumar</span>
          <Link href="/" className="min-h-11 inline-flex items-center transition hover:text-cyan-100">Back to main portfolio →</Link>
        </footer>
      </div>
    </main>
  );
}
