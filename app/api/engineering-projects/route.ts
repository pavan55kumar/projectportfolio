import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getSupabaseAdmin } from "@/lib/supabase";
import { EngineeringProject, engineeringProjects as defaultProjects } from "@/data/engineeringProjects";

const DATA_FILE = path.join(process.cwd(), "data", "engineeringProjects.json");

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

export async function GET() {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("engineering_projects")
        .select("*")
        .order("order_index", { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        return NextResponse.json(data);
      }
    } catch (err) {
      console.warn("Failed to fetch engineering projects from Supabase, using local fallback:", err);
    }
  }

  const localProjects = await readLocalEngineeringProjects();
  return NextResponse.json(localProjects);
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
        await supabase.from("engineering_projects").upsert(newProject);
      } catch (err) {
        console.warn("Supabase engineering project upsert failed:", err);
      }
    }

    const current = await readLocalEngineeringProjects();
    const updated = [newProject, ...current.filter((p) => p.slug !== finalSlug && p.id !== newProject.id)];
    await writeLocalEngineeringProjects(updated);

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
          .update(updatedProject)
          .eq("id", updatedProject.id);
      } catch (err) {
        console.warn("Supabase engineering project update failed:", err);
      }
    }

    return NextResponse.json({ success: true, project: updatedProject });
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
