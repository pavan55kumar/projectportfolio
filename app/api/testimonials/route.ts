import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getSupabaseAdmin } from "@/lib/supabase";

const DATA_FILE = path.join(process.cwd(), "data", "testimonials.json");

export type Testimonial = {
  id: string;
  name: string;
  role: string;
  message: string;
  linkedin?: string;
  avatarImage?: string;
  initials: string;
  avatarColor: string;
  date: string;
  provider?: string;
  approved?: boolean;
};

async function readLocalTestimonials(): Promise<Testimonial[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.filter((t) => !t.seed && !t.id?.startsWith("s"));
    }
    return [];
  } catch {
    return [];
  }
}

async function writeLocalTestimonials(items: Testimonial[]): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(items, null, 2), "utf-8");
}

export async function GET() {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });

      if (!error && data && data.length > 0) {
        // Map database columns to frontend camelCase
        const mapped: Testimonial[] = data.map((t) => ({
          id: t.id,
          name: t.name,
          role: t.role,
          message: t.message,
          linkedin: t.linkedin || undefined,
          avatarImage: t.avatar_image || undefined,
          initials: t.initials,
          avatarColor: t.avatar_color,
          date: t.date,
          provider: t.provider,
          approved: t.approved,
        }));
        return NextResponse.json(mapped);
      }
    } catch (err) {
      console.warn("Supabase fetch failed, falling back to local file:", err);
    }
  }

  const localItems = await readLocalTestimonials();
  return NextResponse.json(localItems);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, role, message, linkedin, avatarImage, initials, avatarColor, provider, date } = body;

    if (!name || !role || !message) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newTestimonial: Testimonial = {
      id: Date.now().toString(),
      name: String(name).slice(0, 100),
      role: String(role).slice(0, 120),
      message: String(message).slice(0, 1000),
      linkedin: linkedin ? String(linkedin).slice(0, 300) : undefined,
      avatarImage: avatarImage ? String(avatarImage) : undefined,
      initials: initials || String(name).split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase(),
      avatarColor: avatarColor || "#0A66C2",
      date: date || new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      provider: provider || "google",
      approved: true,
    };

    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        const { error } = await supabase.from("testimonials").insert({
          id: newTestimonial.id,
          name: newTestimonial.name,
          role: newTestimonial.role,
          message: newTestimonial.message,
          linkedin: newTestimonial.linkedin || null,
          avatar_image: newTestimonial.avatarImage || null,
          initials: newTestimonial.initials,
          avatar_color: newTestimonial.avatarColor,
          date: newTestimonial.date,
          provider: newTestimonial.provider,
          approved: true,
        });

        if (error) {
          console.error("Supabase insert error:", error);
        }
      } catch (err) {
        console.warn("Failed to insert into Supabase, saving locally:", err);
      }
    }

    // Always update local backup as well
    const current = await readLocalTestimonials();
    const updated = [newTestimonial, ...current];
    await writeLocalTestimonials(updated);

    return NextResponse.json(newTestimonial, { status: 201 });
  } catch (error) {
    console.error("Failed to save testimonial:", error);
    return NextResponse.json({ error: "Failed to save testimonial" }, { status: 500 });
  }
}

// Admin PATCH: update testimonial (e.g., change profile picture / avatarImage)
export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, avatarImage, name, role, message, approved } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing testimonial ID" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (supabase) {
      const updateData: Record<string, unknown> = {};
      if (avatarImage !== undefined) updateData.avatar_image = avatarImage;
      if (name !== undefined) updateData.name = name;
      if (role !== undefined) updateData.role = role;
      if (message !== undefined) updateData.message = message;
      if (approved !== undefined) updateData.approved = approved;

      await supabase.from("testimonials").update(updateData).eq("id", id);
    }

    // Update local cache as well
    const current = await readLocalTestimonials();
    const updated = current.map((item) => {
      if (item.id === id) {
        return {
          ...item,
          ...(avatarImage !== undefined ? { avatarImage } : {}),
          ...(name !== undefined ? { name } : {}),
          ...(role !== undefined ? { role } : {}),
          ...(message !== undefined ? { message } : {}),
          ...(approved !== undefined ? { approved } : {}),
        };
      }
      return item;
    });
    await writeLocalTestimonials(updated);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to update testimonial:", err);
    return NextResponse.json({ error: "Failed to update testimonial" }, { status: 500 });
  }
}

// Admin DELETE: delete testimonial
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing testimonial ID" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (supabase) {
      await supabase.from("testimonials").delete().eq("id", id);
    }

    const current = await readLocalTestimonials();
    const updated = current.filter((item) => item.id !== id);
    await writeLocalTestimonials(updated);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete testimonial:", err);
    return NextResponse.json({ error: "Failed to delete testimonial" }, { status: 500 });
  }
}
