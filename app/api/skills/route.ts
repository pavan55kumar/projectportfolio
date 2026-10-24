import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const noCacheHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
};

export type SkillItem = {
  id: string;
  name: string;
  iconKey?: string;
  iconUrl?: string;
  category?: string;
  orderIndex?: number;
};

const DATA_FILE = path.join(process.cwd(), "data", "skills.json");

const defaultSkills: SkillItem[] = [
  { id: "skill-threejs", name: "Three.js", iconKey: "threejs", category: "Frontend & 3D", orderIndex: 2 },
  { id: "skill-react", name: "React", iconKey: "react", category: "Frontend & 3D", orderIndex: 2 },
  { id: "skill-tailwind", name: "Tailwind", iconKey: "tailwind", category: "Frontend & 3D", orderIndex: 3 },
  { id: "skill-nextjs", name: "Next.js", iconKey: "nextjs", category: "Frontend & 3D", orderIndex: 3 },
  { id: "skill-gsap", name: "GSAP", iconKey: "gsap", category: "Frontend & 3D", orderIndex: 6 },
  { id: "skill-vite", name: "Vite", iconKey: "vite", category: "Frontend & 3D", orderIndex: 6 },
  { id: "skill-html5", name: "HTML5", iconKey: "html5", category: "Frontend & 3D", orderIndex: 6 },
  { id: "skill-css3", name: "CSS3", iconKey: "css3", category: "Frontend & 3D", orderIndex: 8 },
  { id: "skill-javascript", name: "JavaScript", iconKey: "javascript", category: "Languages", orderIndex: 8 },
  { id: "skill-supabase", name: "Supabase", iconKey: "supabase", category: "Backend & DB", orderIndex: 9 },
  { id: "skill-python", name: "Python", iconKey: "python", category: "Languages", orderIndex: 10 },
  { id: "skill-java", name: "Java", iconKey: "java", category: "Languages", orderIndex: 12 },
  { id: "skill-uiux", name: "UI/UX", iconKey: "uiux", category: "Design & 3D", orderIndex: 12 },
  { id: "skill-nodejs", name: "Node.js", iconKey: "nodejs", category: "Backend & DB", orderIndex: 14 },
  { id: "skill-express", name: "Express.js", iconKey: "express", category: "Backend & DB", orderIndex: 14 },
  { id: "skill-postgresql", name: "PostgreSQL", iconKey: "postgresql", category: "Backend & DB", orderIndex: 14 },
  { id: "skill-firebase", name: "Firebase", iconKey: "firebase", category: "Backend & DB", orderIndex: 18 },
  { id: "skill-git", name: "Git", iconKey: "git", category: "DevOps & Tools", orderIndex: 18 },
  { id: "skill-github", name: "GitHub", iconKey: "github", category: "DevOps & Tools", orderIndex: 19 },
];

async function readLocal(): Promise<SkillItem[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultSkills;
  } catch {
    return defaultSkills;
  }
}

async function writeLocal(data: SkillItem[]) {
  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write skills.json locally:", err);
  }
}

export async function GET() {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("skills")
        .select("*")
        .order("order_index", { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped: SkillItem[] = data.map((d: any) => ({
          id: String(d.id),
          name: d.name || "",
          iconKey: d.icon_key || "",
          iconUrl: d.icon_url || "",
          category: d.category || "General",
          orderIndex: Number(d.order_index ?? 0),
        }));
        writeLocal(mapped).catch(() => {});
        return NextResponse.json(mapped, { headers: noCacheHeaders });
      }
    } catch (err) {
      console.warn("Supabase skills fetch error, using local fallback:", err);
    }
  }

  const local = await readLocal();
  return NextResponse.json(local, { headers: noCacheHeaders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = body.id || `skill-${Date.now()}`;
    const newItem: SkillItem = {
      id,
      name: body.name || "New Skill",
      iconKey: body.iconKey || body.key || "",
      iconUrl: body.iconUrl || "",
      category: body.category || "General",
      orderIndex: Number(body.orderIndex ?? Date.now()),
    };

    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        await supabase.from("skills").upsert({
          id: newItem.id,
          name: newItem.name,
          icon_key: newItem.iconKey || null,
          icon_url: newItem.iconUrl || null,
          category: newItem.category || "General",
          order_index: newItem.orderIndex,
        });
      } catch (err) {
        console.warn("Supabase skill insert error, updating local file:", err);
      }
    }

    const current = await readLocal();
    const filtered = current.filter((s) => s.id !== newItem.id && s.name.toLowerCase() !== newItem.name.toLowerCase());
    const updated = [...filtered, newItem];
    await writeLocal(updated);

    return NextResponse.json(newItem, { status: 201 });
  } catch (err) {
    console.error("POST /api/skills error:", err);
    return NextResponse.json({ error: "Failed to add skill" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    if (!body.id) {
      return NextResponse.json({ error: "Missing skill id" }, { status: 400 });
    }

    const updatedItem: SkillItem = {
      id: body.id,
      name: body.name || "",
      iconKey: body.iconKey || "",
      iconUrl: body.iconUrl || "",
      category: body.category || "General",
      orderIndex: Number(body.orderIndex ?? 0),
    };

    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        await supabase
          .from("skills")
          .update({
            name: updatedItem.name,
            icon_key: updatedItem.iconKey || null,
            icon_url: updatedItem.iconUrl || null,
            category: updatedItem.category || "General",
            order_index: updatedItem.orderIndex,
          })
          .eq("id", updatedItem.id);
      } catch (err) {
        console.warn("Supabase skill update error, updating local file:", err);
      }
    }

    const current = await readLocal();
    const index = current.findIndex((s) => s.id === updatedItem.id);
    if (index !== -1) {
      current[index] = { ...current[index], ...updatedItem };
    } else {
      current.push(updatedItem);
    }
    await writeLocal(current);

    return NextResponse.json(updatedItem);
  } catch (err) {
    console.error("PUT /api/skills error:", err);
    return NextResponse.json({ error: "Failed to update skill" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing skill id" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        await supabase.from("skills").delete().eq("id", id);
      } catch (err) {
        console.warn("Supabase skill delete error, updating local file:", err);
      }
    }

    const current = await readLocal();
    const updated = current.filter((s) => s.id !== id);
    await writeLocal(updated);

    return NextResponse.json({ success: true, id });
  } catch (err) {
    console.error("DELETE /api/skills error:", err);
    return NextResponse.json({ error: "Failed to delete skill" }, { status: 500 });
  }
}
