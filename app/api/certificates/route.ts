import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { getSupabaseAdmin } from "@/lib/supabase";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const noCacheHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
};

export type PortfolioCertificate = {
  id: string;
  title: string;
  subtitle: string;
  issuer: string;
  year: string;
  icon: string;
  category?: string;
  colorDark: string;
  colorLight: string;
  imageUrl?: string;
  images?: string[];
  real?: boolean;
};

const DATA_FILE = path.join(process.cwd(), "data", "certificates.json");

function parseCertificateImages(imageUrl?: unknown, images?: unknown): string[] {
  // 1. If images is already an array:
  if (Array.isArray(images) && images.length > 0) {
    return images.map((s) => String(s).trim()).filter(Boolean);
  }

  // 2. If imageUrl is an array:
  if (Array.isArray(imageUrl) && imageUrl.length > 0) {
    return imageUrl.map((s) => String(s).trim()).filter(Boolean);
  }

  // 3. If images is a stringified JSON array:
  if (typeof images === "string" && images.trim().startsWith("[")) {
    try {
      const parsed = JSON.parse(images.trim());
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((s) => String(s).trim()).filter(Boolean);
      }
    } catch {}
  }

  // 4. If imageUrl is provided:
  if (typeof imageUrl === "string" && imageUrl.trim()) {
    const trimmed = imageUrl.trim();

    // 4a. Check if it's a JSON array string:
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((s) => String(s).trim()).filter(Boolean);
        }
      } catch {}
    }

    // 4b. Single data: URL (CRITICAL: NEVER split on comma, base64 headers contain ;base64,)
    if (trimmed.startsWith("data:")) {
      return [trimmed];
    }

    // 4c. Comma-separated regular file paths or URLs
    if (trimmed.includes(",")) {
      return trimmed
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }

    return [trimmed];
  }

  return [];
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
    category: "Course Certificate",
    colorDark: "#0ea5e9",
    colorLight: "#c9956a",
    imageUrl: "/certificates/az1.jpeg",
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
    category: "Achievement",
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
          category: c.category || (c.id === "ibm-z-datathon" ? "Achievement" : "Course Certificate"),
          images: imgs,
          imageUrl: imgs[0] || c.imageUrl || "",
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
        const mapped: PortfolioCertificate[] = data
          .filter((c) => c && c.title && !c.title.toLowerCase().includes("add your certificate"))
          .map((c) => {
            const imgs = parseCertificateImages(c.image_url, c.images);
            return {
              id: c.id,
              title: c.title,
              subtitle: c.subtitle || "",
              issuer: c.issuer,
              year: c.year,
              icon: c.icon || "🏅",
              category: c.category || (c.id === "ibm-z-datathon" ? "Achievement" : "Course Certificate"),
              colorDark: c.color_dark || "#0ea5e9",
              colorLight: c.color_light || "#c9956a",
              imageUrl: imgs[0] || c.image_url || "",
              images: imgs,
              real: imgs.length > 0,
            };
          });
        writeLocalCertificates(mapped).catch(() => {});
        return NextResponse.json(mapped, { headers: noCacheHeaders });
      }
    } catch (err) {
      console.warn("Failed to fetch certificates from Supabase, using local fallback:", err);
    }
  }

  const localCerts = await readLocalCertificates();
  const filteredLocalCerts = localCerts.filter(
    (c) => c && c.title && !c.title.toLowerCase().includes("add your certificate")
  );
  return NextResponse.json(filteredLocalCerts, { headers: noCacheHeaders });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { title, subtitle, issuer, year, icon, category, colorDark, colorLight, imageUrl, images } = body;

    if (!title || !issuer || !year) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const id = body.id || title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || Date.now().toString();

    const certImages = parseCertificateImages(imageUrl, images);
    const primaryImage = certImages[0] || (typeof imageUrl === "string" ? imageUrl : "");
    const serializedImages = JSON.stringify(certImages);

    const newCert: PortfolioCertificate = {
      id,
      title: String(title),
      subtitle: String(subtitle || ""),
      issuer: String(issuer),
      year: String(year),
      icon: String(icon || "🏅"),
      category: category ? String(category) : "Course Certificate",
      colorDark: String(colorDark || "#0ea5e9"),
      colorLight: String(colorLight || "#c9956a"),
      imageUrl: primaryImage,
      images: certImages,
      real: certImages.length > 0,
    };

    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        const payload: Record<string, unknown> = {
          id,
          title: newCert.title,
          subtitle: newCert.subtitle,
          issuer: newCert.issuer,
          year: newCert.year,
          icon: newCert.icon,
          category: newCert.category,
          color_dark: newCert.colorDark,
          color_light: newCert.colorLight,
          image_url: certImages.length > 1 ? serializedImages : (primaryImage || null),
          images: certImages,
        };

        const { error: upsertErr } = await supabase.from("certificates").upsert(payload);
        if (upsertErr) {
          // If 'category' or 'images' column doesn't exist in Supabase yet, fallback gracefully
          delete payload.images;
          delete payload.category;
          payload.image_url = certImages.length > 1 ? serializedImages : (primaryImage || null);
          await supabase.from("certificates").upsert(payload);
        }
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
    const { id, title, subtitle, issuer, year, icon, category, colorDark, colorLight, imageUrl, images } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing certificate id" }, { status: 400 });
    }

    let certImages = images !== undefined ? parseCertificateImages(undefined, images) : undefined;
    if (certImages === undefined && imageUrl !== undefined) {
      certImages = parseCertificateImages(imageUrl);
    }

    const primaryImage = certImages && certImages.length > 0 ? certImages[0] : (typeof imageUrl === "string" ? imageUrl : undefined);
    const serializedImages = certImages ? JSON.stringify(certImages) : undefined;

    const supabase = getSupabaseAdmin();
    if (supabase) {
      try {
        const updateData: Record<string, unknown> = {};
        if (title !== undefined) updateData.title = title;
        if (subtitle !== undefined) updateData.subtitle = subtitle;
        if (issuer !== undefined) updateData.issuer = issuer;
        if (year !== undefined) updateData.year = year;
        if (icon !== undefined) updateData.icon = icon;
        if (category !== undefined) updateData.category = category;
        if (colorDark !== undefined) updateData.color_dark = colorDark;
        if (colorLight !== undefined) updateData.color_light = colorLight;

        if (certImages !== undefined) {
          updateData.images = certImages;
          updateData.image_url = certImages.length > 1 ? serializedImages : (primaryImage || null);
        } else if (imageUrl !== undefined) {
          updateData.image_url = imageUrl;
        }

        const { error: patchErr } = await supabase.from("certificates").update(updateData).eq("id", id);
        if (patchErr) {
          // Fallback if 'category' or 'images' column doesn't exist in Supabase yet
          delete updateData.images;
          delete updateData.category;
          if (certImages !== undefined) {
            updateData.image_url = certImages.length > 1 ? serializedImages : (primaryImage || null);
          }
          await supabase.from("certificates").update(updateData).eq("id", id);
        }
      } catch (err) {
        console.warn("Supabase certificate update failed:", err);
      }
    }

    const current = await readLocalCertificates();
    const updated = current.map((c) => {
      if (c.id === id) {
        const updatedImages = certImages !== undefined ? certImages : parseCertificateImages(c.imageUrl, c.images);
        return {
          ...c,
          ...(title !== undefined ? { title: String(title) } : {}),
          ...(subtitle !== undefined ? { subtitle: String(subtitle) } : {}),
          ...(issuer !== undefined ? { issuer: String(issuer) } : {}),
          ...(year !== undefined ? { year: String(year) } : {}),
          ...(icon !== undefined ? { icon: String(icon) } : {}),
          ...(category !== undefined ? { category: String(category) } : {}),
          ...(colorDark !== undefined ? { colorDark: String(colorDark) } : {}),
          ...(colorLight !== undefined ? { colorLight: String(colorLight) } : {}),
          ...(primaryImage !== undefined ? { imageUrl: primaryImage } : {}),
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
