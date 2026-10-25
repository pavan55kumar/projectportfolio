import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/security/auth";
import { getSecurityMetrics, getSecurityAlerts, recordSecurityEvent } from "@/lib/security/logger";
import { extractClientIp, generateSourceFingerprint, maskIpAddress } from "@/lib/security/detector";

export const dynamic = "force-dynamic";

const noCacheHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
};

export async function GET(req: Request) {
  const auth = verifyAdminRequest(req);
  if (!auth.authorized) {
    const ip = extractClientIp(req);
    await recordSecurityEvent({
      event_type: "unauthorized_access",
      severity: "medium",
      source: "application",
      http_method: "GET",
      path: "/api/admin/security/metrics",
      status_code: 401,
      source_fingerprint: generateSourceFingerprint(ip),
      source_ip_masked: maskIpAddress(ip),
      detection_reason: "Unauthorized access attempt to security metrics API",
      outcome: "denied",
    });
    return NextResponse.json({ error: auth.reason || "Unauthorized" }, { status: 401, headers: noCacheHeaders });
  }

  try {
    const { searchParams } = new URL(req.url);
    const timeRange = (searchParams.get("timeRange") as "24h" | "7d" | "30d") || "7d";

    const [metrics, alerts] = await Promise.all([
      getSecurityMetrics(timeRange),
      getSecurityAlerts(),
    ]);

    return NextResponse.json(
      {
        metrics,
        alerts,
      },
      { headers: noCacheHeaders }
    );
  } catch (err) {
    console.error("Failed to fetch security metrics:", err);
    return NextResponse.json({ error: "Failed to fetch metrics" }, { status: 500, headers: noCacheHeaders });
  }
}
