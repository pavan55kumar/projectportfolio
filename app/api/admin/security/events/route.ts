import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/security/auth";
import { querySecurityEvents, markSecurityEventReviewed, recordSecurityEvent } from "@/lib/security/logger";
import { extractClientIp, generateSourceFingerprint, maskIpAddress } from "@/lib/security/detector";
import { SecurityEventFilter } from "@/lib/security/types";

export const dynamic = "force-dynamic";

const noCacheHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0",
};

export async function GET(req: Request) {
  const auth = verifyAdminRequest(req);
  if (!auth.authorized) {
    // Record unauthorized access attempt
    const ip = extractClientIp(req);
    await recordSecurityEvent({
      event_type: "unauthorized_access",
      severity: "medium",
      source: "application",
      http_method: "GET",
      path: "/api/admin/security/events",
      status_code: 401,
      source_fingerprint: generateSourceFingerprint(ip),
      source_ip_masked: maskIpAddress(ip),
      detection_reason: "Unauthorized access attempt to security events API",
      outcome: "denied",
    });
    return NextResponse.json({ error: auth.reason || "Unauthorized" }, { status: 401, headers: noCacheHeaders });
  }

  try {
    const { searchParams } = new URL(req.url);
    const filter: SecurityEventFilter = {
      page: parseInt(searchParams.get("page") || "1", 10),
      pageSize: parseInt(searchParams.get("pageSize") || "20", 10),
      timeRange: (searchParams.get("timeRange") as SecurityEventFilter["timeRange"]) || "7d",
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      severity: (searchParams.get("severity") as SecurityEventFilter["severity"]) || "all",
      eventType: searchParams.get("eventType") || "all",
      outcome: (searchParams.get("outcome") as SecurityEventFilter["outcome"]) || "all",
      reviewed: (searchParams.get("reviewed") as SecurityEventFilter["reviewed"]) || "all",
      search: searchParams.get("search") || undefined,
      sortOrder: (searchParams.get("sortOrder") as "asc" | "desc") || "desc",
    };

    const result = await querySecurityEvents(filter);
    return NextResponse.json(result, { headers: noCacheHeaders });
  } catch (err) {
    console.error("Failed to query security events:", err);
    return NextResponse.json({ error: "Failed to query events" }, { status: 500, headers: noCacheHeaders });
  }
}

export async function PATCH(req: Request) {
  const auth = verifyAdminRequest(req);
  if (!auth.authorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401, headers: noCacheHeaders });
  }

  try {
    const { id } = await req.json();
    if (!id || typeof id !== "string") {
      return NextResponse.json({ error: "Missing event id" }, { status: 400 });
    }

    const success = await markSecurityEventReviewed(id, auth.reviewer);
    if (!success) {
      return NextResponse.json({ error: "Event not found or update failed" }, { status: 404 });
    }

    return NextResponse.json({ success: true, reviewed_by: auth.reviewer }, { headers: noCacheHeaders });
  } catch (err) {
    console.error("Failed to mark event reviewed:", err);
    return NextResponse.json({ error: "Update failed" }, { status: 500, headers: noCacheHeaders });
  }
}
