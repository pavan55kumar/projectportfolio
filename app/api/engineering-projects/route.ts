import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getSupabaseAdmin } from "@/lib/supabase";
import { EngineeringProject, engineeringProjects as defaultProjects } from "@/data/engineeringProjects";

const DATA_FILE = path.join(process.cwd(), "data", "engineeringProjects.json");

function mapFromDb(d: any): EngineeringProject {
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
  };
}

function mapToDb(p: Partial<EngineeringProject>): Record<string, unknown> {
  const db: Record<string, unknown> = {};
  if (p.id !== undefined) db.id = p.id;
  if (p.slug !== undefined) db.slug = p.slug;
  if (p.title !== undefined) db.title = p.title;
  if (p.description !== undefined) db.description = p.description;
  if (p.icon !== undefined) db.icon = p.icon;
  if (p.status !== undefined) db.status = p.status;
  if (p.category !== undefined) db.category = p.category;
  if (p.coverImage !== undefined) db.cover_image = p.coverImage;
  if (p.bannerImage !== undefined) db.banner_image = p.bannerImage;
  if (p.overview !== undefined) db.overview = p.overview;
  if (p.problem !== undefined) db.problem = p.problem;
  if (p.solution !== undefined) db.solution = p.solution;
  if (p.intendedFor !== undefined) db.intended_for = p.intendedFor;
  if (p.role !== undefined) db.role = p.role;
  if (p.duration !== undefined) db.duration = p.duration;
  if (p.technologies !== undefined) db.technologies = p.technologies;
  if (p.features !== undefined) db.features = p.features;
  if (p.contributions !== undefined) db.contributions = p.contributions;
  if (p.architecture !== undefined) db.architecture = p.architecture;
  if (p.challenges !== undefined) db.challenges = p.challenges;
  if (p.additionalDetails !== undefined) db.additional_details = p.additionalDetails;
  if (p.githubUrl !== undefined) db.github_url = p.githubUrl;
  if (p.liveUrl !== undefined) db.live_url = p.liveUrl;
  if (p.liveDemoUrl !== undefined) db.live_demo_url = p.liveDemoUrl;
  if (p.team !== undefined) db.team = p.team;
  return db;
}

async function readLocalEngineeringProjects(): Promise<EngineeringProject[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return defaultProjects;
  } catch {
    return defaultProjects;
  }
}

async function writeLocalEngineeringProjects(items: EngineeringProject[]): Promise<void> {
  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(items, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to write local engineering projects file:", err);
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

const noCacheHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
};

// Helper to sync shared fields to projects table and data/projects.json
async function syncToProjectsTable(proj: EngineeringProject) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const projUpdate: Record<string, unknown> = {};
      if (proj.title) projUpdate.title = proj.title;
      if (proj.description) projUpdate.description = proj.description;
      if (proj.liveUrl !== undefined) projUpdate.live_url = proj.liveUrl || null;
      if (proj.coverImage) projUpdate.logo = proj.coverImage;
      if (proj.githubUrl !== undefined) projUpdate.github = proj.githubUrl;

      // Update matching project in Supabase by id or slug
      await supabase
        .from("projects")
        .update(projUpdate)
        .or(`id.eq.${proj.id},id.eq.${proj.slug}`);
    } catch (err) {
      console.warn("Sync to projects table failed:", err);
    }
  }

  try {
    const projectsFile = path.join(process.cwd(), "data", "projects.json");
    const raw = await fs.readFile(projectsFile, "utf-8").catch(() => "[]");
    const list = JSON.parse(raw);
    if (Array.isArray(list)) {
      let modified = false;
      const updatedList = list.map((item: any) => {
        if (item.id === proj.id || item.id === proj.slug) {
          modified = true;
          return {
            ...item,
            ...(proj.title ? { title: proj.title } : {}),
            ...(proj.description ? { desc: proj.description } : {}),
            ...(proj.liveUrl !== undefined ? { liveUrl: proj.liveUrl } : {}),
            ...(proj.coverImage ? { logo: proj.coverImage } : {}),
            ...(proj.githubUrl !== undefined ? { github: proj.githubUrl } : {}),
          };
        }
        return item;
      });
      if (modified) {
        await fs.writeFile(projectsFile, JSON.stringify(updatedList, null, 2), "utf-8");
      }
    }
  } catch (err) {
    console.warn("Failed to sync to data/projects.json:", err);
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get("slug")?.toLowerCase().trim();
  const id = searchParams.get("id")?.toLowerCase().trim();
  const filter = slug || id;

  const supabase = getSupabaseAdmin();

  // 1. Single project lookup by slug or id
  if (filter) {
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from("engineering_projects")
          .select("*")
          .or(`slug.eq.${filter},id.eq.${filter}`)
          .maybeSingle();

        if (!error && data) {
          return NextResponse.json(mapFromDb(data), { headers: noCacheHeaders });
        }
      } catch (err) {
        console.warn("Failed single fetch from Supabase:", err);
      }
    }

    const localProjects = await readLocalEngineeringProjects();
    const match = localProjects.find(
      (p) =>
        p.slug?.toLowerCase() === filter ||
        p.id?.toLowerCase() === filter ||
        (filter === "project-orbital" && p.slug === "portfolio-3d")
    );
    if (match) {
      return NextResponse.json(match, { headers: noCacheHeaders });
    }
    return NextResponse.json({ error: "Project not found" }, { status: 404, headers: noCacheHeaders });
  }

  // 2. Fetch all projects
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("engineering_projects")
        .select("*")
        .order("order_index", { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped = data.map(mapFromDb);
        // Persist fresh Supabase data to local JSON in background
        writeLocalEngineeringProjects(mapped).catch(() => {});
        return NextResponse.json(mapped, { headers: noCacheHeaders });
      }
    } catch (err) {
      console.warn("Failed to fetch engineering projects from Supabase, using local fallback:", err);
    }
  }

  const localProjects = await readLocalEngineeringProjects();
  return NextResponse.json(localProjects, { headers: noCacheHeaders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, slug, description } = body;

    if (!title || !description) {
      return NextResponse.json({ error: "Title and description are required" }, { status: 400 });
    }

    const finalSlug = (slug || title)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const newProject: EngineeringProject = {
      id: body.id || finalSlug,
      slug: finalSlug,
      title: String(title),
      description: String(description),
      icon: body.icon || "portfolio",
      status: body.status || "In Development",
      category: body.category || "Engineering",
      coverImage: body.coverImage || "/projects/portfolio-3d/cover.png",
      bannerImage: body.bannerImage || body.coverImage || "/projects/portfolio-3d/cover.png",
      overview: body.overview || "",
      problem: body.problem || "",
      solution: body.solution || "",
      role: body.role || "",
      duration: body.duration || "",
      technologies: Array.isArray(body.technologies)
        ? body.technologies
        : typeof body.technologies === "string"
        ? body.technologies.split(",").map((s: string) => s.trim()).filter(Boolean)
        : [],
      features: Array.isArray(body.features)
        ? body.features
        : typeof body.features === "string"
        ? body.features.split("\n").map((s: string) => s.trim()).filter(Boolean)
        : [],
      contributions: Array.isArray(body.contributions)
        ? body.contributions
        : typeof body.contributions === "string"
        ? body.contributions.split("\n").map((s: string) => s.trim()).filter(Boolean)
        : [],
      architecture: body.architecture || "",
      challenges: body.challenges || "",
      additionalDetails: body.additionalDetails || "",
      githubUrl: body.githubUrl || "",
      liveUrl: body.liveUrl || "",
      liveDemoUrl: body.liveDemoUrl || body.liveUrl || "",
      team: body.team || [],
    };

    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        await supabase.from("engineering_projects").upsert(mapToDb(newProject));
      } catch (err) {
        console.warn("Supabase engineering project upsert failed:", err);
      }
    }

    const current = await readLocalEngineeringProjects();
    const updated = [newProject, ...current.filter((p) => p.slug !== finalSlug && p.id !== newProject.id)];
    await writeLocalEngineeringProjects(updated);

    // Sync to projects table for main portfolio
    await syncToProjectsTable(newProject);

    return NextResponse.json({ success: true, project: newProject }, { status: 201 });
  } catch (err) {
    console.error("Failed to add engineering project:", err);
    return NextResponse.json({ error: "Failed to add project" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, slug } = body;

    if (!id && !slug) {
      return NextResponse.json({ error: "Missing project id or slug" }, { status: 400 });
    }

    const current = await readLocalEngineeringProjects();
    const index = current.findIndex(
      (p) => (id && p.id === id) || (slug && p.slug === slug)
    );

    if (index === -1) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    const existing = current[index];
    const updatedProject: EngineeringProject = {
      ...existing,
      ...(body.title !== undefined ? { title: String(body.title) } : {}),
      ...(body.description !== undefined ? { description: String(body.description) } : {}),
      ...(body.icon !== undefined ? { icon: String(body.icon) } : {}),
      ...(body.status !== undefined ? { status: String(body.status) } : {}),
      ...(body.category !== undefined ? { category: String(body.category) } : {}),
      ...(body.coverImage !== undefined ? { coverImage: String(body.coverImage) } : {}),
      ...(body.bannerImage !== undefined ? { bannerImage: String(body.bannerImage) } : {}),
      ...(body.overview !== undefined ? { overview: String(body.overview) } : {}),
      ...(body.problem !== undefined ? { problem: String(body.problem) } : {}),
      ...(body.solution !== undefined ? { solution: String(body.solution) } : {}),
      ...(body.role !== undefined ? { role: String(body.role) } : {}),
      ...(body.duration !== undefined ? { duration: String(body.duration) } : {}),
      ...(body.architecture !== undefined ? { architecture: String(body.architecture) } : {}),
      ...(body.challenges !== undefined ? { challenges: String(body.challenges) } : {}),
      ...(body.additionalDetails !== undefined ? { additionalDetails: String(body.additionalDetails) } : {}),
      ...(body.githubUrl !== undefined ? { githubUrl: String(body.githubUrl) } : {}),
      ...(body.liveUrl !== undefined ? { liveUrl: String(body.liveUrl) } : {}),
      ...(body.liveDemoUrl !== undefined ? { liveDemoUrl: String(body.liveDemoUrl) } : {}),
      ...(body.technologies !== undefined
        ? {
            technologies: Array.isArray(body.technologies)
              ? body.technologies
              : typeof body.technologies === "string"
              ? body.technologies.split(",").map((s: string) => s.trim()).filter(Boolean)
              : [],
          }
        : {}),
      ...(body.features !== undefined
        ? {
            features: Array.isArray(body.features)
              ? body.features
              : typeof body.features === "string"
              ? body.features.split("\n").map((s: string) => s.trim()).filter(Boolean)
              : [],
          }
        : {}),
      ...(body.contributions !== undefined
        ? {
            contributions: Array.isArray(body.contributions)
              ? body.contributions
              : typeof body.contributions === "string"
              ? body.contributions.split("\n").map((s: string) => s.trim()).filter(Boolean)
              : [],
          }
        : {}),
    };

    current[index] = updatedProject;
    await writeLocalEngineeringProjects(current);

    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        await supabase
          .from("engineering_projects")
          .update(mapToDb(updatedProject))
          .eq("id", updatedProject.id);
      } catch (err) {
        console.warn("Supabase engineering project update failed:", err);
      }
    }

    // Sync to projects table for main portfolio
    await syncToProjectsTable(updatedProject);

    return NextResponse.json({ success: true, project: updatedProject }, { headers: noCacheHeaders });
  } catch (err) {
    console.error("Failed to update engineering project:", err);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");

    if (!id && !slug) {
      return NextResponse.json({ error: "Missing project id or slug" }, { status: 400 });
    }

    const current = await readLocalEngineeringProjects();
    const updated = current.filter((p) => (id ? p.id !== id : true) && (slug ? p.slug !== slug : true));
    await writeLocalEngineeringProjects(updated);

    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        if (id) await supabase.from("engineering_projects").delete().eq("id", id);
        else if (slug) await supabase.from("engineering_projects").delete().eq("slug", slug);
      } catch (err) {
        console.warn("Supabase engineering project delete failed:", err);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete engineering project:", err);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
