import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/security/auth";
import { fetchUmamiAnalytics } from "@/lib/security/analytics";

export const dynamic = "force-dynamic";

const noCacheHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
};

export async function GET(req: Request) {
  const auth = verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: auth.reason || "Unauthorized" }, { status: 401, headers: noCacheHeaders });
  }

  try {
    const { searchParams } = new URL(req.url);
    const timeRange = (searchParams.get("timeRange") as "24h" | "7d" | "30d") || "7d";

    const result = await fetchUmamiAnalytics(timeRange);
    return NextResponse.json(result, { headers: noCacheHeaders });
  } catch (err) {
    console.error("Failed to fetch analytics:", err);
    return NextResponse.json(
      { connected: false, message: "Analytics fetch failed" },
      { status: 500, headers: noCacheHeaders }
    );
  }
}
