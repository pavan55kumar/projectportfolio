import Link from "next/link";
import { FaArrowDown, FaArrowRight } from "react-icons/fa";
import { engineeringProjects } from "@/data/engineeringProjects";
import ProjectCard from "../engineering-lab/ProjectCard";

export default function EngineeringLabPage() {
  const [featured, ...supporting] = engineeringProjects;

  return (
    <main className="engineering-lab relative min-h-screen overflow-hidden bg-[#030712] text-white">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-48 top-0 h-[34rem] w-[34rem] rounded-full bg-cyan-500/[0.08] blur-[140px]" />
        <div className="absolute -right-52 top-[45rem] h-[38rem] w-[38rem] rounded-full bg-violet-600/[0.08] blur-[150px]" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_65%)]" />
      </div>

      <header className="relative z-10 mx-auto flex max-w-7xl items-center justify-between px-5 py-6 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="text-sm font-bold tracking-tight text-white transition hover:text-cyan-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-4 focus-visible:ring-offset-[#030712]"
        >
          PAVAN<span className="text-cyan-300">.</span>
        </Link>
        <nav aria-label="Page navigation" className="flex items-center gap-5">
          <span className="hidden text-xs font-medium text-cyan-100 sm:inline">Engineering Lab</span>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-4 text-xs font-medium text-white/65 transition hover:border-cyan-200/25 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200 focus-visible:ring-offset-2 focus-visible:ring-offset-[#030712]"
          >
            Main portfolio <FaArrowRight aria-hidden="true" className="text-[9px]" />
          </Link>
        </nav>
      </header>

      <div className="relative z-10 mx-auto max-w-7xl px-5 pb-20 sm:px-8 lg:px-12">
        <section className="grid min-h-[440px] items-center gap-8 py-16 sm:py-20 lg:grid-cols-[1fr_auto] lg:py-24">
          <div>
            <p className="mb-6 inline-flex items-center gap-3 rounded-full border border-white/10 bg-white/[0.035] px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan-300 shadow-[0_0_12px_rgba(103,232,249,0.8)]" />
              Selected work <span className="text-white/20">/</span> Engineering Lab
            </p>
            <h1 className="max-w-5xl text-[clamp(3.5rem,9vw,8rem)] font-semibold leading-[0.94] tracking-[-0.07em]">
              Things I&apos;ve
              <br />
              <span className="bg-gradient-to-r from-cyan-200 via-sky-400 to-violet-400 bg-clip-text text-transparent">
                built.
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-7 text-white/50 sm:text-lg">
              A selection of projects shaped by curiosity, thoughtful engineering,
              and a desire to make useful things.
            </p>
          </div>
          <a
            href="#projects"
            className="group hidden min-h-12 items-center gap-3 self-end pb-2 text-xs font-medium text-white/45 transition hover:text-cyan-100 lg:inline-flex"
          >
            Scroll to explore
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10 transition group-hover:border-cyan-200/30 group-hover:bg-cyan-300/[0.06]">
              <FaArrowDown aria-hidden="true" className="text-[10px]" />
            </span>
          </a>
        </section>

        <section id="projects" aria-label="Selected projects" className="scroll-mt-8 pb-20">
          <div className="mb-5 flex items-center justify-between border-b border-white/[0.08] pb-4">
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/40">The work</p>
            <p className="font-mono text-[10px] text-white/30">{String(engineeringProjects.length).padStart(2, "0")} PROJECTS</p>
          </div>
          <div className="grid gap-5 lg:grid-cols-2">
            {featured && <ProjectCard project={featured} featured index={0} />}
            {supporting.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index + 1} />
            ))}
          </div>
        </section>

        <footer className="flex flex-col gap-4 border-t border-white/[0.08] pt-6 text-xs text-white/35 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Pavan Kumar</span>
          <Link href="/" className="inline-flex min-h-11 items-center gap-2 transition hover:text-cyan-100">
            Back to the main portfolio <FaArrowRight aria-hidden="true" className="text-[9px]" />
          </Link>
        </footer>
      </div>
    </main>
  );
}
