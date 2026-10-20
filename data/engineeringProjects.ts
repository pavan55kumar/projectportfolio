export type ProjectScreenshot = {
  src: string;
  alt: string;
  caption?: string;
};

export type ProjectTeamMember = {
  name: string;
  role: string;
  contribution: string;
  photo?: string;
  linkedin?: string;
  github?: string;
};

export type EngineeringProject = {
  id: string;
  slug: string;
  title: string;
  description: string;
  status?: string;
  coverImage?: string;
  bannerImage?: string;
  screenshots?: ProjectScreenshot[];
  technologies?: string[];
  overview?: string;
  intendedFor?: string;
  role?: string;
  contributions?: string[];
  features?: string[];
  duration?: string;
  team?: ProjectTeamMember[];
  githubUrl?: string;
  liveDemoUrl?: string;
  demoVideoUrl?: string;
  relatedProjectIds?: string[];
  icon: "portfolio" | "atlas" | "relief";
};

// Add images under public/projects/<slug>/ and teammates under public/team/.
// Keep optional URLs, dates, and contributor details empty until they are verified.
export const engineeringProjects: EngineeringProject[] = [
  {
    id: "portfolio-3d",
    slug: "portfolio-3d",
    title: "3D Portfolio",
    description: "An interactive personal portfolio built around a live 3D experience.",
    icon: "portfolio",
    overview:
      "A personal portfolio bringing together an interactive 3D hero, selected projects, certifications, testimonials, and contact information.",
    intendedFor: "Visitors exploring my work and background.",
    role: "Personal portfolio project",
    technologies: [
      "Next.js",
      "React",
      "TypeScript",
      "React Three Fiber",
      "Drei",
      "Framer Motion",
      "Tailwind CSS",
      "NextAuth",
    ],
    features: [
      "Interactive 3D hero scene",
      "Responsive project and certification sections",
      "Theme and language controls",
      "Google sign-in for testimonials",
    ],
    liveDemoUrl: "/",
    relatedProjectIds: ["atlas", "sankat-saathi"],
  },
  {
    id: "atlas",
    slug: "atlas",
    title: "Atlas",
    description: "A productivity and student dashboard application.",
    icon: "atlas",
    relatedProjectIds: ["portfolio-3d", "sankat-saathi"],
  },
  {
    id: "sankat-saathi",
    slug: "sankat-saathi",
    title: "Sankat Saathi",
    description: "A disaster-relief coordination platform.",
    icon: "relief",
    relatedProjectIds: ["portfolio-3d", "atlas"],
  },
];

export function getEngineeringProject(slug: string) {
  return engineeringProjects.find((project) => project.slug === slug);
}
