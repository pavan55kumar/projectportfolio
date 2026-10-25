import { NextResponse } from "next/server";
import { verifyAdminRequest } from "@/lib/security/auth";
import { exportSecurityEventsCsv, recordSecurityEvent } from "@/lib/security/logger";
import { extractClientIp, generateSourceFingerprint, maskIpAddress } from "@/lib/security/detector";
import { SecurityEventFilter } from "@/lib/security/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = verifyAdminRequest(req);
  if (!auth.authorized) {
    const ip = extractClientIp(req);
    await recordSecurityEvent({
      event_type: "unauthorized_access",
      severity: "high",
      source: "application",
      http_method: "GET",
      path: "/api/admin/security/export",
      status_code: 401,
      source_fingerprint: generateSourceFingerprint(ip),
      source_ip_masked: maskIpAddress(ip),
      detection_reason: "Unauthorized attempt to export security audit events",
      outcome: "denied",
    });
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const filter: SecurityEventFilter = {
      timeRange: (searchParams.get("timeRange") as any) || "30d",
      startDate: searchParams.get("startDate") || undefined,
      endDate: searchParams.get("endDate") || undefined,
      severity: (searchParams.get("severity") as any) || "all",
      eventType: searchParams.get("eventType") || "all",
      outcome: (searchParams.get("outcome") as any) || "all",
      reviewed: (searchParams.get("reviewed") as any) || "all",
      search: searchParams.get("search") || undefined,
    };

    const csvContent = await exportSecurityEventsCsv(filter);
    const filename = `security-audit-events-${new Date().toISOString().slice(0, 10)}.csv`;

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Cache-Control": "no-store, no-cache, must-revalidate",
      },
    });
  } catch (err) {
    console.error("Failed to export security events CSV:", err);
    return NextResponse.json({ error: "Export failed" }, { status: 500 });
  }
}
