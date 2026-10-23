import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
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
  images?: string[];
  real?: boolean;
};

const DATA_FILE = path.join(process.cwd(), "data", "certificates.json");

function parseCertificateImages(imageUrl?: string, images?: string[]): string[] {
  if (Array.isArray(images) && images.length > 0) {
    return images.map((s) => String(s).trim()).filter(Boolean);
  }
  if (!imageUrl || typeof imageUrl !== "string") return [];
  const trimmed = imageUrl.trim();
  if (trimmed.startsWith("[")) {
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) return parsed.map((s) => String(s).trim()).filter(Boolean);
    } catch {}
  }
  if (trimmed.includes(",")) {
    return trimmed.split(",").map((s) => s.trim()).filter(Boolean);
  }
  return trimmed ? [trimmed] : [];
}

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
    imageUrl: "/certificates/az1.jpeg,/certificates/az2.jpeg,/certificates/az3.jpeg",
    images: [
      "/certificates/az1.jpeg",
      "/certificates/az2.jpeg",
      "/certificates/az3.jpeg",
    ],
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
    images: [],
    real: false,
  },
];

async function readLocalCertificates(): Promise<PortfolioCertificate[]> {
  try {
    const raw = await fs.readFile(DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed.map((c) => {
        const imgs = parseCertificateImages(c.imageUrl || c.image_url, c.images);
        return {
          ...c,
          images: imgs,
          imageUrl: c.imageUrl || imgs.join(","),
          real: c.real !== undefined ? Boolean(c.real) : imgs.length > 0,
        };
      });
    }
    return defaultCertificates;
  } catch {
    return defaultCertificates;
  }
}

async function writeLocalCertificates(items: PortfolioCertificate[]): Promise<void> {
  try {
    await fs.mkdir(path.dirname(DATA_FILE), { recursive: true });
    await fs.writeFile(DATA_FILE, JSON.stringify(items, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to write local certificates file:", err);
  }
}

export async function GET() {
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("certificates")
        .select("*")
        .order("order_index", { ascending: true });

      if (!error && data && data.length > 0) {
        const mapped: PortfolioCertificate[] = data.map((c) => {
          const imgs = parseCertificateImages(c.image_url);
          return {
            id: c.id,
            title: c.title,
            subtitle: c.subtitle || "",
            issuer: c.issuer,
            year: c.year,
            icon: c.icon || "🏅",
            colorDark: c.color_dark || "#0ea5e9",
            colorLight: c.color_light || "#c9956a",
            imageUrl: c.image_url || imgs.join(","),
            images: imgs,
            real: imgs.length > 0,
          };
        });
        return NextResponse.json(mapped);
      }
    } catch (err) {
      console.warn("Failed to fetch certificates from Supabase, using local fallback:", err);
    }
  }

  const localCerts = await readLocalCertificates();
  return NextResponse.json(localCerts);
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, subtitle, issuer, year, icon, colorDark, colorLight, imageUrl, images } = body;

    if (!title || !issuer || !year) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const id = body.id || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || Date.now().toString();

    const certImages = parseCertificateImages(imageUrl, images);
    const finalImageUrl = certImages.join(",") || (imageUrl ? String(imageUrl) : "");

    const newCert: PortfolioCertificate = {
      id,
      title: String(title),
      subtitle: String(subtitle || ""),
      issuer: String(issuer),
      year: String(year),
      icon: String(icon || "🏅"),
      colorDark: String(colorDark || "#0ea5e9"),
      colorLight: String(colorLight || "#c9956a"),
      imageUrl: finalImageUrl,
      images: certImages,
      real: certImages.length > 0,
    };

    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        await supabase.from("certificates").upsert({
          id,
          title: newCert.title,
          subtitle: newCert.subtitle,
          issuer: newCert.issuer,
          year: newCert.year,
          icon: newCert.icon,
          color_dark: newCert.colorDark,
          color_light: newCert.colorLight,
          image_url: newCert.imageUrl || null,
        });
      } catch (err) {
        console.warn("Supabase upsert failed:", err);
      }
    }

    const current = await readLocalCertificates();
    const updated = [newCert, ...current.filter((c) => c.id !== id)];
    await writeLocalCertificates(updated);

    return NextResponse.json({ success: true, certificate: newCert }, { status: 201 });
  } catch (err) {
    console.error("Failed to add certificate:", err);
    return NextResponse.json({ error: "Failed to add certificate" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, title, subtitle, issuer, year, icon, colorDark, colorLight, imageUrl, images } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing certificate id" }, { status: 400 });
    }

    let finalImageUrl = imageUrl;
    let certImages = images;
    if (images !== undefined) {
      certImages = parseCertificateImages(undefined, images);
      finalImageUrl = certImages.join(",");
    } else if (imageUrl !== undefined) {
      certImages = parseCertificateImages(imageUrl);
      finalImageUrl = certImages.join(",") || imageUrl;
    }

    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        const updateData: Record<string, unknown> = {};
        if (title !== undefined) updateData.title = title;
        if (subtitle !== undefined) updateData.subtitle = subtitle;
        if (issuer !== undefined) updateData.issuer = issuer;
        if (year !== undefined) updateData.year = year;
        if (icon !== undefined) updateData.icon = icon;
        if (colorDark !== undefined) updateData.color_dark = colorDark;
        if (colorLight !== undefined) updateData.color_light = colorLight;
        if (finalImageUrl !== undefined) updateData.image_url = finalImageUrl;

        await supabase.from("certificates").update(updateData).eq("id", id);
      } catch (err) {
        console.warn("Supabase certificate update failed:", err);
      }
    }

    const current = await readLocalCertificates();
    const updated = current.map((c) => {
      if (c.id === id) {
        const updatedImages = certImages !== undefined ? certImages : parseCertificateImages(finalImageUrl || c.imageUrl, c.images);
        return {
          ...c,
          ...(title !== undefined ? { title: String(title) } : {}),
          ...(subtitle !== undefined ? { subtitle: String(subtitle) } : {}),
          ...(issuer !== undefined ? { issuer: String(issuer) } : {}),
          ...(year !== undefined ? { year: String(year) } : {}),
          ...(icon !== undefined ? { icon: String(icon) } : {}),
          ...(colorDark !== undefined ? { colorDark: String(colorDark) } : {}),
          ...(colorLight !== undefined ? { colorLight: String(colorLight) } : {}),
          ...(finalImageUrl !== undefined ? { imageUrl: String(finalImageUrl) } : {}),
          images: updatedImages,
          real: updatedImages.length > 0,
        };
      }
      return c;
    });
    await writeLocalCertificates(updated);

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
      try {
        await supabase.from("certificates").delete().eq("id", id);
      } catch (err) {
        console.warn("Supabase delete certificate failed:", err);
      }
    }

    const current = await readLocalCertificates();
    const updated = current.filter((c) => c.id !== id);
    await writeLocalCertificates(updated);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Failed to delete certificate:", err);
    return NextResponse.json({ error: "Failed to delete certificate" }, { status: 500 });
  }
}
