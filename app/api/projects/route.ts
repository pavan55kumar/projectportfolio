import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getSupabaseAdmin } from "@/lib/supabase";

export type PortfolioProject = {
  id: string;
  title: string;
  tech: string;
  desc: string;
  category?: string;
  github?: string;
  labUrl?: string;
  liveUrl?: string;
  logo?: string;
  emoji?: string;
  order_index?: number;
};

const DATA_FILE = path.join(process.cwd(), "data", "projects.json");

// Fallback default projects
const defaultProjects: PortfolioProject[] = [
  {
    id: "sankat-saathi",
    title: "Sankat Saathi (संकट साथी)",
    tech: "React 18 · Vite · Tailwind · Supabase · IBM Z · Haversine AI",
    desc: "AI-powered humanitarian flood relief platform that optimizes emergency citizen SOS requests, explains urgency scores, and coordinates warehouse supply dispatches.",
    category: "Hackathon",
    github: "https://github.com/pavankumareng29/Sankat-Saathi-IBM-Z-Datathon-2026-Project",
    labUrl: "/engineering-lab/sankat-saathi",
    liveUrl: "",
    logo: "/projects/sankat-saathi/banner.jpg",
    emoji: "🌊",
  },
  {
    id: "atlas",
    title: "Atlas Life OS",
    tech: "React · Vite · Tailwind · Framer Motion · Supabase · PWA",
    desc: "Personal life operating system featuring an intelligent college attendance & bunk margin simulator, CGPA planner, Pomodoro focus engine, and cognitive AI morning brief.",
    category: "Personal",
    github: "https://github.com/pavan55kumar/atlas",
    labUrl: "/engineering-lab/atlas",
    liveUrl: "",
    logo: "/projects/atlas/cover.png",
    emoji: "🧭",
  },
  {
    id: "portfolio-3d",
    title: "Project Orbital (3D Portfolio)",
    tech: "Next.js · React · Three.js · React Three Fiber · Drei · NextAuth",
    desc: "Modern personal portfolio with interactive 3D WebGL hero sphere, LinkedIn OAuth testimonials, and dedicated Engineering Lab deep-dives.",
    category: "Personal",
    github: "https://github.com/pavan55kumar/projectportfolio",
    labUrl: "/engineering-lab/portfolio-3d",
    liveUrl: "https://projectportfolio-one.vercel.app",
    logo: "",
    emoji: "✨",
  },
  {
    id: "spam-detection",
    title: "Spam Detection",
    tech: "Python · scikit-learn · NLTK · SpaCy · Streamlit · Transformers",
    desc: "Python ML app that detects spam messages using NLP pipelines and HuggingFace Transformers.",
    category: "Academic",
    github: "https://github.com/pavan55kumar/E-mail-Spam-Detection",
    liveUrl: "",
    emoji: "🛡️",
  },
  {
    id: "note-saver",
    title: "Note Saver App",
    tech: "Python · Flask · Jinja2 · HTML · CSS · JavaScript",
    desc: "A simple Flask web app with Python backend and dynamic HTML/CSS/JS frontend using Jinja2 templates.",
    category: "Personal",
    github: "https://github.com/pavan55kumar/FLASK-note-saver",
    liveUrl: "",
    emoji: "📝",
  },
];

async function readLocalProjects(): Promise<PortfolioProject[]> {
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

async function writeLocalProjects(items: PortfolioProject[]): Promise<void> {
  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(items, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to write local projects file:", err);
  }
}

export const dynamic = "force-dynamic";
export const revalidate = 0;

const noCacheHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
};

// Helper to sync to engineering_projects table and data/engineeringProjects.json
async function syncToEngineeringProjectsTable(p: PortfolioProject) {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const engUpdate: Record<string, unknown> = {};
      if (p.title) engUpdate.title = p.title;
      if (p.desc) engUpdate.description = p.desc;
      if (p.liveUrl !== undefined) engUpdate.live_url = p.liveUrl || null;
      // Note: We do NOT sync p.logo to cover_image or banner_image.
      // Main portfolio project image and Engineering Lab images are kept completely independent.
      if (p.github !== undefined) engUpdate.github_url = p.github;

      await supabase
        .from("engineering_projects")
        .update(engUpdate)
        .or(`id.eq.${p.id},slug.eq.${p.id}`);
    } catch (err) {
      console.warn("Sync to engineering_projects table failed:", err);
    }
  }

  try {
    const engFile = path.join(process.cwd(), "data", "engineeringProjects.json");
    const raw = await fs.readFile(engFile, "utf-8").catch(() => "[]");
    const list = JSON.parse(raw);
    if (Array.isArray(list)) {
      let modified = false;
      const updatedList = list.map((item: any) => {
        if (item.id === p.id || item.slug === p.id) {
          modified = true;
          return {
            ...item,
            ...(p.title ? { title: p.title } : {}),
            ...(p.desc ? { description: p.desc } : {}),
            ...(p.liveUrl !== undefined ? { liveUrl: p.liveUrl } : {}),
            // Note: We do NOT overwrite coverImage or bannerImage with p.logo.
            // Main portfolio image and Engineering Lab images remain separate.
            ...(p.github !== undefined ? { githubUrl: p.github } : {}),
          };
        }
        return item;
      });
      if (modified) {
        await fs.writeFile(engFile, JSON.stringify(updatedList, null, 2), "utf-8");
      }
    }
  } catch (err) {
    console.warn("Failed to sync to data/engineeringProjects.json:", err);
  }
}

export async function GET() {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .order("order_index", { ascending: true });

      if (!error && data && data.length > 0) {
        const mapped: PortfolioProject[] = data.map((p) => ({
          id: p.id,
          title: p.title,
          tech: p.tech,
          desc: p.description,
          category: p.category || "Personal",
          github: p.github || "",
          labUrl: p.lab_url || "",
          liveUrl: p.live_url || "",
          logo: p.logo || "",
          emoji: p.emoji || "🚀",
        }));
        // Update local file in background so local JSON stays fresh
        writeLocalProjects(mapped).catch(() => {});
        return NextResponse.json(mapped, { headers: noCacheHeaders });
      }
    } catch (err) {
      console.warn("Failed to fetch projects from Supabase, using local fallback:", err);
    }
  }

  const localProjects = await readLocalProjects();
  return NextResponse.json(localProjects, { headers: noCacheHeaders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, tech, desc, category, github, labUrl, liveUrl, logo, emoji } = body;

    if (!title || !desc) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const id = body.id || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || Date.now().toString();

    const newProject: PortfolioProject = {
      id,
      title: String(title),
      tech: String(tech || ""),
      desc: String(desc),
      category: category ? String(category) : "Personal",
      github: github ? String(github) : "",
      labUrl: labUrl ? String(labUrl) : "",
      liveUrl: liveUrl ? String(liveUrl) : "",
      logo: logo ? String(logo) : "",
      emoji: emoji ? String(emoji) : "🚀",
    };

    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        const payload: Record<string, unknown> = {
          id,
          title: newProject.title,
          tech: newProject.tech,
          description: newProject.desc,
          category: newProject.category,
          github: newProject.github || null,
          lab_url: newProject.labUrl || null,
          live_url: newProject.liveUrl || null,
          logo: newProject.logo || null,
          emoji: newProject.emoji,
        };
        const { error: upsertErr } = await supabase.from("projects").upsert(payload);
        if (upsertErr) {
          // Fallback if category column doesn't exist in Supabase yet
          delete payload.category;
          await supabase.from("projects").upsert(payload);
        }
      } catch (err) {
        console.warn("Supabase upsert failed:", err);
      }
    }

    const current = await readLocalProjects();
    const updated = [newProject, ...current.filter((p) => p.id !== id)];
    await writeLocalProjects(updated);

    // Sync to engineering_projects table
    await syncToEngineeringProjectsTable(newProject);

    return NextResponse.json({ success: true, project: newProject }, { status: 201, headers: noCacheHeaders });
  } catch (err) {
    console.error("Failed to add project:", err);
    return NextResponse.json({ error: "Failed to add project" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, title, tech, desc, category, github, labUrl, liveUrl, logo, emoji } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing project id" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        const updateData: Record<string, unknown> = {};
        if (title !== undefined) updateData.title = title;
        if (tech !== undefined) updateData.tech = tech;
        if (desc !== undefined) updateData.description = desc;
        if (category !== undefined) updateData.category = category;
        if (github !== undefined) updateData.github = github;
        if (labUrl !== undefined) updateData.lab_url = labUrl;
        if (liveUrl !== undefined) updateData.live_url = liveUrl;
        if (logo !== undefined) updateData.logo = logo;
        if (emoji !== undefined) updateData.emoji = emoji;

        const { error: patchErr } = await supabase.from("projects").update(updateData).eq("id", id);
        if (patchErr && updateData.category !== undefined) {
          delete updateData.category;
          await supabase.from("projects").update(updateData).eq("id", id);
        }
      } catch (err) {
        console.warn("Supabase project update failed:", err);
      }
    }

    const current = await readLocalProjects();
    let updatedTarget: PortfolioProject | null = null;
    const updated = current.map((p) => {
      if (p.id === id) {
        const res: PortfolioProject = {
          ...p,
          ...(title !== undefined ? { title: String(title) } : {}),
          ...(tech !== undefined ? { tech: String(tech) } : {}),
          ...(desc !== undefined ? { desc: String(desc) } : {}),
          ...(category !== undefined ? { category: String(category) } : {}),
          ...(github !== undefined ? { github: String(github) } : {}),
          ...(labUrl !== undefined ? { labUrl: String(labUrl) } : {}),
          ...(liveUrl !== undefined ? { liveUrl: String(liveUrl) } : {}),
          ...(logo !== undefined ? { logo: String(logo) } : {}),
          ...(emoji !== undefined ? { emoji: String(emoji) } : {}),
        };
        updatedTarget = res;
        return res;
      }
      return p;
    });
    await writeLocalProjects(updated);

    if (updatedTarget) {
      await syncToEngineeringProjectsTable(updatedTarget);
    }

    return NextResponse.json({ success: true }, { headers: noCacheHeaders });
  } catch (err) {
    console.error("Failed to update project:", err);
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
  }
}


export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing project id" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        await supabase.from("projects").delete().eq("id", id);
      } catch (err) {
        console.warn("Supabase delete failed:", err);
      }
    }

    const current = await readLocalProjects();
    const updated = current.filter((p) => p.id !== id);
    await writeLocalProjects(updated);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete project:", err);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
