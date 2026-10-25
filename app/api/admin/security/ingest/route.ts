import { NextResponse } from "next/server";
import { recordSecurityEvent } from "@/lib/security/logger";
import {
  generateSourceFingerprint,
  maskIpAddress,
  extractClientIp,
  sanitizePath,
} from "@/lib/security/detector";
import { checkRateLimit } from "@/lib/security/rate-limiter";
import { SecuritySeverity, SecurityOutcome, SecuritySource } from "@/lib/security/types";

export const dynamic = "force-dynamic";

const VALID_SEVERITIES = new Set<SecuritySeverity>(["low", "medium", "high", "critical"]);
const VALID_OUTCOMES = new Set<SecurityOutcome>(["blocked", "flagged", "allowed", "denied", "logged"]);
const VALID_SOURCES = new Set<SecuritySource>(["application", "middleware", "edge", "audit", "vercel"]);

export async function POST(req: Request) {
  try {
    const clientIp = extractClientIp(req);
    const fingerprint = generateSourceFingerprint(clientIp);

    // Protect ingestion endpoint from flood/abuse (max 100/minute per source)
    const rateCheck = checkRateLimit(`ingest:${fingerprint}`, 100, 60000);
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429, headers: { "Retry-After": String(rateCheck.retryAfterSeconds) } }
      );
    }

    const body = await req.json();

    // Payload size check (max 32KB)
    if (JSON.stringify(body).length > 32768) {
      return NextResponse.json({ error: "Payload too large" }, { status: 413 });
    }

    const {
      event_type,
      severity,
      source,
      http_method,
      path: reqPath,
      status_code,
      detection_reason,
      outcome,
      request_id,
      details,
    } = body;

    // Strict schema validation
    if (!event_type || typeof event_type !== "string") {
      return NextResponse.json({ error: "Invalid event_type" }, { status: 400 });
    }
    if (!detection_reason || typeof detection_reason !== "string") {
      return NextResponse.json({ error: "Invalid detection_reason" }, { status: 400 });
    }

    const safeSeverity: SecuritySeverity = VALID_SEVERITIES.has(severity) ? severity : "medium";
    const safeOutcome: SecurityOutcome = VALID_OUTCOMES.has(outcome) ? outcome : "flagged";
    const safeSource: SecuritySource = VALID_SOURCES.has(source) ? source : "middleware";

    const sanitizedPath = sanitizePath(String(reqPath || "/"));

    const event = await recordSecurityEvent({
      event_type: String(event_type).slice(0, 50),
      severity: safeSeverity,
      source: safeSource,
      http_method: String(http_method || "GET").slice(0, 10).toUpperCase(),
      path: sanitizedPath.slice(0, 300),
      status_code: typeof status_code === "number" ? status_code : 403,
      source_fingerprint: fingerprint,
      source_ip_masked: maskIpAddress(clientIp),
      request_id: request_id ? String(request_id).slice(0, 64) : undefined,
      detection_reason: String(detection_reason).slice(0, 300),
      outcome: safeOutcome,
      details: typeof details === "object" && details !== null ? details : {},
    });

    if (!event) {
      return NextResponse.json({ error: "Failed to persist event" }, { status: 500 });
    }

    return NextResponse.json({ success: true, id: event.id }, { status: 201 });
  } catch (err) {
    console.warn("Security ingestion error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
