import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export type PortfolioProject = {
  title: string;
  tech: string;
  desc: string;
  github?: string;
  labUrl?: string;
  logo?: string;
  emoji?: string;
  id?: string;
};

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
      console.warn("Failed to fetch projects from Supabase, using defaults:", err);
    }
  }

  return NextResponse.json(defaultProjects);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, tech, desc, github, labUrl, logo, emoji } = body;

    if (!title || !desc) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const id = body.id || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || Date.now().toString();

    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { error } = await supabase.from("projects").upsert({
        id,
        title,
        tech: tech || "",
        description: desc,
        github: github || null,
        lab_url: labUrl || null,
        logo: logo || null,
        emoji: emoji || "🚀",
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, id }, { status: 201 });
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
      const updateData: Record<string, unknown> = {};
      if (title !== undefined) updateData.title = title;
      if (tech !== undefined) updateData.tech = tech;
      if (desc !== undefined) updateData.description = desc;
      if (github !== undefined) updateData.github = github;
      if (labUrl !== undefined) updateData.lab_url = labUrl;
      if (logo !== undefined) updateData.logo = logo;
      if (emoji !== undefined) updateData.emoji = emoji;

      const { error } = await supabase.from("projects").update(updateData).eq("id", id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

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
      const { error } = await supabase.from("projects").delete().eq("id", id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete project:", err);
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 });
  }
}
