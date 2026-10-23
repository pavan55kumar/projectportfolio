import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getSupabaseAdmin } from "@/lib/supabase";

export type ExperienceItem = {
  id: string;
  role: string;
  company: string;
  period: string;
  description?: string;
  orderIndex?: number;
};

const DATA_FILE = path.join(process.cwd(), "data", "experience.json");

const defaultExperience: ExperienceItem[] = [
  {
    id: "web-intern-abc",
    role: "Web Intern",
    company: "ABC Corp",
    period: "May 2025 – July 2025",
    description: "Full-stack web application development and component engineering.",
    orderIndex: 1,
  },
  {
    id: "freelance-uiux",
    role: "Freelance UI/UX & Frontend Developer",
    company: "Independent Client Projects",
    period: "2024 – Present",
    description: "Crafting interactive 3D web interfaces, responsive design systems, and frontend features.",
    orderIndex: 2,
  },
];

async function readLocal(): Promise<ExperienceItem[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultExperience;
  } catch {
    return defaultExperience;
  }
}

async function writeLocal(data: ExperienceItem[]) {
  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write experience.json locally:", err);
  }
}

export async function GET() {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("experience")
        .select("*")
        .order("order_index", { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped: ExperienceItem[] = data.map((d: any) => ({
          id: String(d.id),
          role: d.role || "",
          company: d.company || "",
          period: d.period || "",
          description: d.description || "",
          orderIndex: Number(d.order_index ?? 0),
        }));
        return NextResponse.json(mapped);
      }
    } catch (err) {
      console.warn("Supabase experience fetch error, using local fallback:", err);
    }
  }

  const local = await readLocal();
  return NextResponse.json(local);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = (body.id || `exp-${Date.now()}`).toLowerCase().replace(/[^a-z0-9-]/g, "-");

    const newItem: ExperienceItem = {
      id,
      role: (body.role || "").trim(),
      company: (body.company || "").trim(),
      period: (body.period || "").trim(),
      description: (body.description || "").trim(),
      orderIndex: Number(body.orderIndex ?? Date.now()),
    };

    const current = await readLocal();
    const updated = [...current, newItem];
    await writeLocal(updated);

    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        await supabase.from("experience").upsert({
          id: newItem.id,
          role: newItem.role,
          company: newItem.company,
          period: newItem.period,
          description: newItem.description,
          order_index: newItem.orderIndex,
        });
      } catch (err) {
        console.warn("Supabase experience insert error:", err);
      }
    }

    return NextResponse.json({ success: true, item: newItem });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create experience item", details: String(err) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const current = await readLocal();
    const index = current.findIndex((item) => item.id === id);

    const updatedItem: ExperienceItem = {
      id,
      role: (body.role !== undefined ? body.role : current[index]?.role || "").trim(),
      company: (body.company !== undefined ? body.company : current[index]?.company || "").trim(),
      period: (body.period !== undefined ? body.period : current[index]?.period || "").trim(),
      description: (body.description !== undefined ? body.description : current[index]?.description || "").trim(),
      orderIndex: Number(body.orderIndex !== undefined ? body.orderIndex : current[index]?.orderIndex ?? 0),
    };

    if (index >= 0) {
      current[index] = updatedItem;
    } else {
      current.push(updatedItem);
    }

    await writeLocal(current);

    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        await supabase.from("experience").upsert({
          id: updatedItem.id,
          role: updatedItem.role,
          company: updatedItem.company,
          period: updatedItem.period,
          description: updatedItem.description,
          order_index: updatedItem.orderIndex,
        });
      } catch (err) {
        console.warn("Supabase experience update error:", err);
      }
    }

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update experience item", details: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const current = await readLocal();
    const filtered = current.filter((item) => item.id !== id);
    await writeLocal(filtered);

    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        await supabase.from("experience").delete().eq("id", id);
      } catch (err) {
        console.warn("Supabase experience delete error:", err);
      }
    }

    return NextResponse.json({ success: true, id });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete experience item", details: String(err) }, { status: 500 });
  }
}
