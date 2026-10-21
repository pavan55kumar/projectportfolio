import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

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
};

async function readTestimonials(): Promise<Testimonial[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      // Filter out any mock/seed testimonials
      return parsed.filter((t) => !t.seed && !t.id?.startsWith("s"));
    }
    return [];
  } catch {
    return [];
  }
}

async function writeTestimonials(items: Testimonial[]): Promise<void> {
  await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(items, null, 2), "utf-8");
}

export async function GET() {
  const testimonials = await readTestimonials();
  return NextResponse.json(testimonials);
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
      provider: provider || "linkedin",
    };

    const current = await readTestimonials();
    const updated = [newTestimonial, ...current];
    await writeTestimonials(updated);

    return NextResponse.json(newTestimonial, { status: 201 });
  } catch (error) {
    console.error("Failed to save testimonial:", error);
    return NextResponse.json({ error: "Failed to save testimonial" }, { status: 500 });
  }
}
