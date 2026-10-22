import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase";

export type PortfolioCertificate = {
  id: string;
  title: string;
  subtitle: string;
  issuer: string;
  year: string;
  icon: string;
  colorDark: string;
  colorLight: string;
  imageUrl?: string;
  real?: boolean;
};

// Fallback default certificates
const defaultCertificates: PortfolioCertificate[] = [
  {
    id: "microsoft-azure",
    title: "Microsoft Certificates",
    subtitle: "Azure Fundamentals · AI Essentials · Cloud Basics",
    issuer: "Microsoft",
    year: "2024",
    icon: "🏅",
    colorDark: "#0ea5e9",
    colorLight: "#c9956a",
    imageUrl: "/certificates/az1.jpeg",
    real: true,
  },
  {
    id: "ibm-z-datathon",
    title: "IBM Z Datathon 2026",
    subtitle: "Humanitarian Logistics & Cloud Systems",
    issuer: "IBM",
    year: "2026",
    icon: "🏆",
    colorDark: "#f59e0b",
    colorLight: "#d97706",
    imageUrl: "",
    real: true,
  },
];

export async function GET() {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .order("order_index", { ascending: true });

      if (!error && data && data.length > 0) {
        const mapped: PortfolioCertificate[] = data.map((c) => ({
          id: c.id,
          title: c.title,
          subtitle: c.subtitle || "",
          issuer: c.issuer,
          year: c.year,
          icon: c.icon || "🏅",
          colorDark: c.color_dark || "#0ea5e9",
          colorLight: c.color_light || "#c9956a",
          imageUrl: c.image_url || "",
          real: true,
        }));
        return NextResponse.json(mapped);
      }
    } catch (err) {
      console.warn("Failed to fetch certificates from Supabase, using defaults:", err);
    }
  }

  return NextResponse.json(defaultCertificates);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, subtitle, issuer, year, icon, colorDark, colorLight, imageUrl } = body;

    if (!title || !issuer || !year) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const id = body.id || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || Date.now().toString();

    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { error } = await supabase.from("certificates").upsert({
        id,
        title,
        subtitle: subtitle || "",
        issuer,
        year,
        icon: icon || "🏅",
        color_dark: colorDark || "#0ea5e9",
        color_light: colorLight || "#c9956a",
        image_url: imageUrl || "",
      });

      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true, id }, { status: 201 });
  } catch (err) {
    console.error("Failed to add certificate:", err);
    return NextResponse.json({ error: "Failed to add certificate" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, title, subtitle, issuer, year, icon, colorDark, colorLight, imageUrl } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing certificate id" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (supabase) {
      const updateData: Record<string, unknown> = {};
      if (title !== undefined) updateData.title = title;
      if (subtitle !== undefined) updateData.subtitle = subtitle;
      if (issuer !== undefined) updateData.issuer = issuer;
      if (year !== undefined) updateData.year = year;
      if (icon !== undefined) updateData.icon = icon;
      if (colorDark !== undefined) updateData.color_dark = colorDark;
      if (colorLight !== undefined) updateData.color_light = colorLight;
      if (imageUrl !== undefined) updateData.image_url = imageUrl;

      const { error } = await supabase.from("certificates").update(updateData).eq("id", id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to update certificate:", err);
    return NextResponse.json({ error: "Failed to update certificate" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing certificate id" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (supabase) {
      const { error } = await supabase.from("certificates").delete().eq("id", id);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete certificate:", err);
    return NextResponse.json({ error: "Failed to delete certificate" }, { status: 500 });
  }
}
