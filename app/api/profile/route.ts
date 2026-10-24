import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const noCacheHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
};

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
  heroRole: "Information Science Engineering Student",
  heroDesc:
    "Third-year Information Science Engineering student passionate about software development, AI, and building meaningful digital experiences.",
  aboutMeDesc:
    "I'm an Information Science Engineering student at NMAM Institute of Technology, Nitte, with a strong interest in software engineering, web development, and artificial intelligence. I enjoy turning ideas into practical, well-designed digital solutions through coding, experimentation, and continuous learning. My goal is to build technology that solves real-world problems while growing as a developer and problem-solver.Science and engineering",
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
        const profileObj: SiteProfile = {
          id: data.id,
          heroDesc: data.hero_desc !== undefined && data.hero_desc !== null ? data.hero_desc : defaultProfile.heroDesc,
          aboutMeDesc: data.about_desc !== undefined && data.about_desc !== null ? data.about_desc : defaultProfile.aboutMeDesc,
          heroRole: data.hero_role !== undefined && data.hero_role !== null ? data.hero_role : (defaultProfile.heroRole || ""),
          updatedAt: data.updated_at,
        };
        writeLocal(profileObj).catch(() => {});
        return NextResponse.json(profileObj, { headers: noCacheHeaders });
      }
    } catch (err) {
      console.warn("Supabase profile fetch error, using local fallback:", err);
    }
  }

  const local = await readLocal();
  return NextResponse.json(local, { headers: noCacheHeaders });
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
          console.warn("Supabase profile upsert error with hero_role:", error);
          // Fallback if hero_role column does not exist yet in Supabase
          const fallback = await supabase.from("profile").upsert({
            id: "default",
            hero_desc: heroDesc,
            about_desc: aboutMeDesc,
            updated_at: new Date().toISOString(),
          });
          if (fallback.error) {
            console.warn("Fallback profile upsert error:", fallback.error);
          }
        }
      } catch (err) {
        console.warn("Failed to update profile in Supabase:", err);
      }
    }

    return NextResponse.json({
      success: true,
      profile: profileData,
      ...profileData,
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update profile", details: String(err) },
      { status: 500 }
    );
  }
}
