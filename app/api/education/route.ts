import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getSupabaseAdmin } from "@/lib/supabase";

export type EducationItem = {
  id: string;
  levelTag: string;
  degree: string;
  institution: string;
  period: string;
  status?: string;
  orderIndex?: number;
};

const DATA_FILE = path.join(process.cwd(), "data", "education.json");

const defaultEducation: EducationItem[] = [
  {
    id: "btech-ise",
    levelTag: "B.TECH",
    degree: "B.Tech Information Science & Engineering",
    institution: "N.M.A.M. Institute of Technology, Nitte",
    period: "2024 - 2028",
    status: "In Progress",
    orderIndex: 1,
  },
  {
    id: "puc-science",
    levelTag: "PRE-UNIVERSITY",
    degree: "Pre-University Course (PUC)",
    institution: "Science · College Name",
    period: "2022 - 2024",
    status: "Completed",
    orderIndex: 2,
  },
  {
    id: "sslc-school",
    levelTag: "SECONDARY EDUCATION",
    degree: "Secondary School (SSLC)",
    institution: "School Name",
    period: "2022",
    status: "Completed",
    orderIndex: 3,
  },
];

async function readLocal(): Promise<EducationItem[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultEducation;
  } catch {
    return defaultEducation;
  }
}

async function writeLocal(data: EducationItem[]) {
  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write education.json locally:", err);
  }
}

export async function GET() {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("education")
        .select("*")
        .order("order_index", { ascending: true });

      if (!error && Array.isArray(data) && data.length > 0) {
        const mapped: EducationItem[] = data.map((d: any) => ({
          id: String(d.id),
          levelTag: d.level_tag || "EDUCATION",
          degree: d.degree || "",
          institution: d.institution || "",
          period: d.period || "",
          status: d.status || "",
          orderIndex: Number(d.order_index ?? 0),
        }));
        return NextResponse.json(mapped);
      }
    } catch (err) {
      console.warn("Supabase education fetch error, using local fallback:", err);
    }
  }

  const local = await readLocal();
  return NextResponse.json(local);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const id = (body.id || `edu-${Date.now()}`).toLowerCase().replace(/[^a-z0-9-]/g, "-");

    const newItem: EducationItem = {
      id,
      levelTag: (body.levelTag || "EDUCATION").toUpperCase().trim(),
      degree: (body.degree || "").trim(),
      institution: (body.institution || "").trim(),
      period: (body.period || "").trim(),
      status: (body.status || "").trim(),
      orderIndex: Number(body.orderIndex ?? Date.now()),
    };

    const current = await readLocal();
    const updated = [...current, newItem];
    await writeLocal(updated);

    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        await supabase.from("education").upsert({
          id: newItem.id,
          level_tag: newItem.levelTag,
          degree: newItem.degree,
          institution: newItem.institution,
          period: newItem.period,
          status: newItem.status,
          order_index: newItem.orderIndex,
        });
      } catch (err) {
        console.warn("Supabase education insert error:", err);
      }
    }

    return NextResponse.json({ success: true, item: newItem });
  } catch (err) {
    return NextResponse.json({ error: "Failed to create education item", details: String(err) }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const current = await readLocal();
    const index = current.findIndex((item) => item.id === id);

    const updatedItem: EducationItem = {
      id,
      levelTag: (body.levelTag !== undefined ? body.levelTag : current[index]?.levelTag || "EDUCATION").toUpperCase().trim(),
      degree: (body.degree !== undefined ? body.degree : current[index]?.degree || "").trim(),
      institution: (body.institution !== undefined ? body.institution : current[index]?.institution || "").trim(),
      period: (body.period !== undefined ? body.period : current[index]?.period || "").trim(),
      status: (body.status !== undefined ? body.status : current[index]?.status || "").trim(),
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
        await supabase.from("education").upsert({
          id: updatedItem.id,
          level_tag: updatedItem.levelTag,
          degree: updatedItem.degree,
          institution: updatedItem.institution,
          period: updatedItem.period,
          status: updatedItem.status,
          order_index: updatedItem.orderIndex,
        });
      } catch (err) {
        console.warn("Supabase education update error:", err);
      }
    }

    return NextResponse.json({ success: true, item: updatedItem });
  } catch (err) {
    return NextResponse.json({ error: "Failed to update education item", details: String(err) }, { status: 500 });
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
        await supabase.from("education").delete().eq("id", id);
      } catch (err) {
        console.warn("Supabase education delete error:", err);
      }
    }

    return NextResponse.json({ success: true, id });
  } catch (err) {
    return NextResponse.json({ error: "Failed to delete education item", details: String(err) }, { status: 500 });
  }
}
