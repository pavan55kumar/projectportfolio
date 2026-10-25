import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Attack patterns to intercept at the edge
const SUSPICIOUS_PATHS = [
  /\/\.env/i,
  /\/\.git/i,
  /\/\.aws/i,
  /\/wp-(?:admin|login|config|includes)/i,
  /\/xmlrpc\.php/i,
  /\/(?:phpmyadmin|pma|adminer)/i,
  /\/(?:etc\/passwd|win\.ini)/i,
  /\/(?:proc\/self)/i,
];

const TRAVERSAL_PATTERN = /(?:\.\.[\\/]|%2e%2e[%2f%5c])/i;
const SQLI_PATTERN = /\b(union\s+(all\s+)?select|sleep\(\s*\d+\s*\)|waitfor\s+delay|drop\s+table)\b/i;
const XSS_PATTERN = /<script\b[^>]*>|javascript\s*:|\bon(?:error|load|click)\s*=/i;

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const search = request.nextUrl.search;
  const fullTarget = search ? `${pathname}${search}` : pathname;
  const requestId = crypto.randomUUID();

  // 1. Detect Path Traversal
  if (TRAVERSAL_PATTERN.test(fullTarget)) {
    logBlockedEvent(request, "path_traversal_probe", "Path traversal probe (../) detected", 403, requestId);
    return new NextResponse("Forbidden: Request blocked by security policy.", {
      status: 403,
      headers: {
        "x-request-id": requestId,
        "x-security-outcome": "blocked",
      },
    });
  }

  // 2. Detect Sensitive File Probes
  for (const pattern of SUSPICIOUS_PATHS) {
    if (pattern.test(pathname)) {
      logBlockedEvent(request, "probe_sensitive_path", "Probe for sensitive file/directory detected", 403, requestId);
      return new NextResponse("Forbidden: Access to requested path is restricted.", {
        status: 403,
        headers: {
          "x-request-id": requestId,
          "x-security-outcome": "blocked",
        },
      });
    }
  }

  // 3. Detect SQL Injection Probes
  if (SQLI_PATTERN.test(fullTarget)) {
    logBlockedEvent(request, "sqli_probe", "Hostile SQL injection pattern detected", 400, requestId);
    return new NextResponse("Bad Request: Malformed query parameters.", {
      status: 400,
      headers: {
        "x-request-id": requestId,
        "x-security-outcome": "blocked",
      },
    });
  }

  // 4. Detect XSS Probes
  if (XSS_PATTERN.test(fullTarget)) {
    logBlockedEvent(request, "xss_probe", "Hostile script injection pattern detected", 400, requestId);
    return new NextResponse("Bad Request: Prohibited script syntax.", {
      status: 400,
      headers: {
        "x-request-id": requestId,
        "x-security-outcome": "blocked",
      },
    });
  }

  // Pass request through, adding correlation header
  const response = NextResponse.next();
  response.headers.set("x-request-id", requestId);
  return response;
}

/**
 * Dispatches non-blocking ingestion call to record the blocked event.
 */
function logBlockedEvent(
  request: NextRequest,
  eventType: string,
  reason: string,
  statusCode: number,
  requestId: string
) {
  try {
    const ingestUrl = new URL("/api/admin/security/ingest", request.url);
    const clientIp =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";

    // Non-blocking fire-and-forget fetch to ingestion API
    fetch(ingestUrl.toString(), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-security-ingest-source": "middleware",
      },
      body: JSON.stringify({
        event_type: eventType,
        severity: "high",
        source: "middleware",
        http_method: request.method,
        path: request.nextUrl.pathname,
        status_code: statusCode,
        client_ip: clientIp,
        request_id: requestId,
        detection_reason: reason,
        outcome: "blocked",
      }),
    }).catch(() => {
      // Ignore background fetch failure in edge context
    });
  } catch {
    // Fail safe
  }
}

// Only match application and API routes, exclude static files and image assets
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|mp4|webm|woff2|woff)$).*)",
  ],
};
