import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getSupabaseAdmin } from "@/lib/supabase";

export type SiteProfile = {
  id: string;
  heroDesc: string;
  aboutMeDesc: string;
  heroRole?: string;
  updatedAt?: string;
};

const DATA_FILE = path.join(process.cwd(), "data", "profile.json");

const defaultProfile: SiteProfile = {
  id: "default",
  heroDesc:
    "2nd-year B.Tech student at NMAMIT, exploring web development, AI, and interactive projects that push the boundary of what's possible.",
  aboutMeDesc:
    "I am a 2nd-year B.Tech student in Information Science and Engineering at N.M.A.M Institute of Technology, Nitte. Passionate about web development, 3D visuals, and interactive UI design. Skilled in C, Python, HTML, CSS, and React; I enjoy building websites and experimenting with AI-powered tools and creative prompts.",
  heroRole: "Full-Stack Developer & AI Enthusiast",
};

async function readLocal(): Promise<SiteProfile> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(raw);
  } catch {
    return defaultProfile;
  }
}

async function writeLocal(data: SiteProfile) {
  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to write profile.json locally:", err);
  }
}

export async function GET() {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("profile")
        .select("*")
        .eq("id", "default")
        .maybeSingle();

      if (!error && data) {
        return NextResponse.json({
          id: data.id,
          heroDesc: data.hero_desc || defaultProfile.heroDesc,
          aboutMeDesc: data.about_desc || defaultProfile.aboutMeDesc,
          heroRole: data.hero_role || defaultProfile.heroRole,
          updatedAt: data.updated_at,
        });
      }
    } catch (err) {
      console.warn("Supabase profile fetch error, using local fallback:", err);
    }
  }

  const local = await readLocal();
  return NextResponse.json(local);
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const heroDesc = (body.heroDesc ?? "").trim() || defaultProfile.heroDesc;
    const aboutMeDesc = (body.aboutMeDesc ?? "").trim() || defaultProfile.aboutMeDesc;
    const heroRole = (body.heroRole ?? "").trim() || defaultProfile.heroRole;

    const profileData: SiteProfile = {
      id: "default",
      heroDesc,
      aboutMeDesc,
      heroRole,
      updatedAt: new Date().toISOString(),
    };

    // 1. Save locally
    await writeLocal(profileData);

    // 2. Save to Supabase if available
    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        const { error } = await supabase.from("profile").upsert({
          id: "default",
          hero_desc: heroDesc,
          about_desc: aboutMeDesc,
          hero_role: heroRole,
          updated_at: new Date().toISOString(),
        });
        if (error) {
          console.warn("Supabase profile upsert error:", error);
        }
      } catch (err) {
        console.warn("Failed to update profile in Supabase:", err);
      }
    }

    return NextResponse.json({ success: true, profile: profileData });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update profile", details: String(err) },
      { status: 500 }
    );
  }
}
