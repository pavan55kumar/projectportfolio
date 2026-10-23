import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getSupabaseAdmin } from "@/lib/supabase";

export type PortfolioProject = {
  id: string;
  title: string;
  tech: string;
  desc: string;
  github?: string;
  labUrl?: string;
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
    github: "https://github.com/pavankumareng29/Sankat-Saathi-IBM-Z-Datathon-2026-Project",
    labUrl: "/engineering-lab/sankat-saathi",
    logo: "/projects/sankat-saathi/banner.jpg",
    emoji: "🌊",
  },
  {
    id: "atlas",
    title: "Atlas Life OS",
    tech: "React · Vite · Tailwind · Framer Motion · Supabase · PWA",
    desc: "Personal life operating system featuring an intelligent college attendance & bunk margin simulator, CGPA planner, Pomodoro focus engine, and cognitive AI morning brief.",
    github: "https://github.com/pavan55kumar/atlas",
    labUrl: "/engineering-lab/atlas",
    logo: "/projects/atlas/cover.png",
    emoji: "🧭",
  },
  {
    id: "portfolio-3d",
    title: "Project Orbital (3D Portfolio)",
    tech: "Next.js · React · Three.js · React Three Fiber · Drei · NextAuth",
    desc: "Modern personal portfolio with interactive 3D WebGL hero sphere, LinkedIn OAuth testimonials, and dedicated Engineering Lab deep-dives.",
    github: "https://github.com/pavan55kumar/projectportfolio",
    labUrl: "/engineering-lab/portfolio-3d",
    logo: "/projects/portfolio-3d/cover.png",
    emoji: "✨",
  },
  {
    id: "spam-detection",
    title: "Spam Detection",
    tech: "Python · scikit-learn · NLTK · SpaCy · Streamlit · Transformers",
    desc: "Python ML app that detects spam messages using NLP pipelines and HuggingFace Transformers.",
    github: "https://github.com/pavan55kumar/E-mail-Spam-Detection",
    emoji: "🛡️",
  },
  {
    id: "note-saver",
    title: "Note Saver App",
    tech: "Python · Flask · Jinja2 · HTML · CSS · JavaScript",
    desc: "A simple Flask web app with Python backend and dynamic HTML/CSS/JS frontend using Jinja2 templates.",
    github: "https://github.com/pavan55kumar/FLASK-note-saver",
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
          github: p.github || "",
          labUrl: p.lab_url || "",
          logo: p.logo || "",
          emoji: p.emoji || "🚀",
        }));
        return NextResponse.json(mapped);
      }
    } catch (err) {
      console.warn("Failed to fetch projects from Supabase, using local fallback:", err);
    }
  }

  const localProjects = await readLocalProjects();
  return NextResponse.json(localProjects);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, tech, desc, github, labUrl, logo, emoji } = body;

    if (!title || !desc) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const id = body.id || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || Date.now().toString();

    const newProject: PortfolioProject = {
      id,
      title: String(title),
      tech: String(tech || ""),
      desc: String(desc),
      github: github ? String(github) : "",
      labUrl: labUrl ? String(labUrl) : "",
      logo: logo ? String(logo) : "",
      emoji: emoji ? String(emoji) : "🚀",
    };

    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        await supabase.from("projects").upsert({
          id,
          title: newProject.title,
          tech: newProject.tech,
          description: newProject.desc,
          github: newProject.github || null,
          lab_url: newProject.labUrl || null,
          logo: newProject.logo || null,
          emoji: newProject.emoji,
        });
      } catch (err) {
        console.warn("Supabase upsert failed:", err);
      }
    }

    const current = await readLocalProjects();
    const updated = [newProject, ...current.filter((p) => p.id !== id)];
    await writeLocalProjects(updated);

    return NextResponse.json({ success: true, project: newProject }, { status: 201 });
  } catch (err) {
    console.error("Failed to add project:", err);
    return NextResponse.json({ error: "Failed to add project" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, title, tech, desc, github, labUrl, logo, emoji } = body;

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
        if (github !== undefined) updateData.github = github;
        if (labUrl !== undefined) updateData.lab_url = labUrl;
        if (logo !== undefined) updateData.logo = logo;
        if (emoji !== undefined) updateData.emoji = emoji;

        await supabase.from("projects").update(updateData).eq("id", id);
      } catch (err) {
        console.warn("Supabase project update failed:", err);
      }
    }

    const current = await readLocalProjects();
    const updated = current.map((p) => {
      if (p.id === id) {
        return {
          ...p,
          ...(title !== undefined ? { title: String(title) } : {}),
          ...(tech !== undefined ? { tech: String(tech) } : {}),
          ...(desc !== undefined ? { desc: String(desc) } : {}),
          ...(github !== undefined ? { github: String(github) } : {}),
          ...(labUrl !== undefined ? { labUrl: String(labUrl) } : {}),
          ...(logo !== undefined ? { logo: String(logo) } : {}),
          ...(emoji !== undefined ? { emoji: String(emoji) } : {}),
        };
      }
      return p;
    });
    await writeLocalProjects(updated);

    return NextResponse.json({ success: true });
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
