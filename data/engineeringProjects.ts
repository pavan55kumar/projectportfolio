import defaultEngineeringProjectsJson from "./engineeringProjects.json";

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
  category?: string;
  coverImage?: string;
  bannerImage?: string;
  screenshots?: ProjectScreenshot[];
  technologies?: string[];
  overview?: string;
  problem?: string;
  solution?: string;
  intendedFor?: string;
  role?: string;
  contributions?: string[];
  features?: string[];
  duration?: string;
  team?: ProjectTeamMember[];
  githubUrl?: string;
  liveUrl?: string;
  liveDemoUrl?: string;
  demoVideoUrl?: string;
  architecture?: string;
  challenges?: string;
  additionalDetails?: string;
  relatedProjectIds?: string[];
  icon?: string;
};

export const engineeringProjects: EngineeringProject[] = defaultEngineeringProjectsJson as EngineeringProject[];

export function mapEngineeringProjectFromDb(d: any): EngineeringProject {
  return {
    id: String(d.id),
    slug: String(d.slug || d.id),
    title: String(d.title || ""),
    description: String(d.description || ""),
    icon: d.icon || "portfolio",
    status: d.status || "",
    category: d.category || "",
    coverImage: d.cover_image || d.coverImage || "",
    bannerImage: d.banner_image || d.bannerImage || d.cover_image || d.coverImage || "",
    overview: d.overview || "",
    problem: d.problem || "",
    solution: d.solution || "",
    intendedFor: d.intended_for || d.intendedFor || "",
    role: d.role || "",
    duration: d.duration || "",
    technologies: Array.isArray(d.technologies) ? d.technologies : [],
    features: Array.isArray(d.features) ? d.features : [],
    contributions: Array.isArray(d.contributions) ? d.contributions : [],
    architecture: d.architecture || "",
    challenges: d.challenges || "",
    additionalDetails: d.additional_details || d.additionalDetails || "",
    githubUrl: d.github_url || d.githubUrl || "",
    liveUrl: d.live_url || d.liveUrl || "",
    liveDemoUrl: d.live_demo_url || d.liveDemoUrl || "",
    team: Array.isArray(d.team) ? d.team : [],
    relatedProjectIds: Array.isArray(d.related_project_ids) ? d.related_project_ids : d.relatedProjectIds,
  };
}

export function getEngineeringProjectSync(slug: string): EngineeringProject | undefined {
  const normalized = slug?.toLowerCase().trim();
  if (!normalized) return undefined;

  if (typeof window === "undefined") {
    try {
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require("fs");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const path = require("path");
      const filePath = path.join(process.cwd(), "data", "engineeringProjects.json");
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8");
        const list: EngineeringProject[] = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) {
          const match = list.find(
            (project) =>
              project.slug?.toLowerCase() === normalized ||
              project.id?.toLowerCase() === normalized ||
              (normalized === "project-orbital" && project.slug === "portfolio-3d")
          );
          if (match) return match;
        }
      }
    } catch {
      // Fallback
    }
  }

  return engineeringProjects.find(
    (project) =>
      project.slug.toLowerCase() === normalized ||
      project.id.toLowerCase() === normalized ||
      (normalized === "project-orbital" && project.slug === "portfolio-3d")
  );
}

export async function getEngineeringProject(slug: string): Promise<EngineeringProject | undefined> {
  const normalized = slug?.toLowerCase().trim();
  if (!normalized) return undefined;

  // 1. Try Supabase for real-time persisted updates
  try {
    const { getSupabaseAdmin } = await import("@/lib/supabase");
    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { data, error } = await supabase
        .from("engineering_projects")
        .select("*")
        .or(`slug.eq.${normalized},id.eq.${normalized}`)
        .maybeSingle();

      if (!error && data) {
        return mapEngineeringProjectFromDb(data);
      }
    }
  } catch {
    // Continue to local fallbacks
  }

  // 2. Fallback to local file or static list
  return getEngineeringProjectSync(slug);
}
