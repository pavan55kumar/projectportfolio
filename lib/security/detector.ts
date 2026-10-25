import crypto from "crypto";
import { SecurityEventType, SecuritySeverity, SecurityOutcome } from "./types";

// Patterns for sensitive path probing
const SENSITIVE_PATH_PATTERNS: Array<{ pattern: RegExp; reason: string }> = [
  { pattern: /(?:^|\/)\.env(?:[\w.-]*)/i, reason: "Probe for environment configuration file (.env)" },
  { pattern: /(?:^|\/)\.git(?:[\w./-]*)/i, reason: "Probe for source control repository (.git)" },
  { pattern: /(?:^|\/)\.aws(?:[\w./-]*)/i, reason: "Probe for cloud credentials (.aws)" },
  { pattern: /(?:^|\/)wp-(?:admin|login|config|includes)/i, reason: "Automated WordPress vulnerability probe" },
  { pattern: /(?:^|\/)xmlrpc\.php/i, reason: "Probe for WordPress XML-RPC endpoint" },
  { pattern: /(?:^|\/)(?:phpmyadmin|pma|adminer|myadmin)/i, reason: "Probe for database administration interfaces" },
  { pattern: /(?:^|\/)(?:actuator|metrics|env|beans|heapdump)/i, reason: "Probe for Spring Boot / application actuator endpoints" },
  { pattern: /(?:^|\/)(?:web\.config|server\.xml|application\.yml)/i, reason: "Probe for server infrastructure configuration" },
  { pattern: /(?:^|\/)(?:etc\/passwd|etc\/shadow|win\.ini|boot\.ini)/i, reason: "Probe for operating system configuration files" },
  { pattern: /(?:^|\/)\.well-known\/security\.txt$/i, reason: "Standard security disclosure lookup (informational)" },
];

// Patterns for SQL injection probes
const SQLI_PATTERNS: Array<{ pattern: RegExp; reason: string }> = [
  { pattern: /\b(union\s+(all\s+)?select)\b/i, reason: "SQL injection probe: UNION SELECT pattern" },
  { pattern: /\b(select\s+.*\s+from\s+[\w.]+)/i, reason: "SQL injection probe: SELECT FROM statement pattern" },
  { pattern: /(?:'|"|%27|%22)\s*(?:or|and)\s*(?:'|"|%27|%22)?\s*[\w\d]+(?:'|"|%27|%22)?\s*=\s*(?:'|"|%27|%22)?[\w\d]+/i, reason: "SQL injection probe: Boolean tautology (' OR '1'='1)" },
  { pattern: /\b(sleep\(\s*\d+\s*\)|waitfor\s+delay|pg_sleep\(\s*\d+\s*\))/i, reason: "SQL injection probe: Time-based blind injection pattern" },
  { pattern: /\b(drop\s+(?:table|database)|alter\s+table|exec\s*\()/i, reason: "SQL injection probe: Destructive statement attempt" },
  { pattern: /(?:--|#|\/\*).*$/m, reason: "SQL injection probe: Comment truncation pattern" },
];

// Patterns for Cross-Site Scripting (XSS) probes
const XSS_PATTERNS: Array<{ pattern: RegExp; reason: string }> = [
  { pattern: /<script\b[^>]*>(.*?)<\/script>/i, reason: "XSS probe: Executable <script> tag detected" },
  { pattern: /javascript\s*:/i, reason: "XSS probe: javascript: pseudo-protocol detected" },
  { pattern: /\bon(?:error|load|click|mouseover|submit|focus)\s*=/i, reason: "XSS probe: Inline event handler attribute detected" },
  { pattern: /<iframe\b[^>]*>/i, reason: "XSS probe: Embedded iframe injection pattern" },
  { pattern: /document\s*\.\s*(?:cookie|location|write)/i, reason: "XSS probe: DOM access attempt pattern" },
];

// Patterns for Path Traversal probes
const TRAVERSAL_PATTERNS: Array<{ pattern: RegExp; reason: string }> = [
  { pattern: /(?:\.\.[\\/]|%2e%2e[%2f%5c])/i, reason: "Path traversal probe: Directory climb sequence (../)" },
  { pattern: /(?:\/proc\/self|\/dev\/null)/i, reason: "Path traversal probe: Linux proc filesystem access" },
];

// Sensitive query parameter keys that MUST be redacted before logging
const SENSITIVE_QUERY_KEYS = new Set([
  "password",
  "pass",
  "token",
  "secret",
  "key",
  "api_key",
  "apikey",
  "auth",
  "authorization",
  "cookie",
  "session",
  "sessionid",
  "access_token",
  "refresh_token",
  "id_token",
  "credential",
  "private_key",
]);

export interface DetectionResult {
  detected: boolean;
  eventType: SecurityEventType;
  severity: SecuritySeverity;
  outcome: SecurityOutcome;
  reason: string;
}

/**
 * Inspects a request path, query string, and payload to detect known attack probes.
 */
export function inspectRequest(
  urlPath: string,
  queryString?: string
): DetectionResult | null {
  const fullTarget = queryString ? `${urlPath}?${queryString}` : urlPath;
  const decodedTarget = decodeSafe(fullTarget);

  // 1. Check Path Traversal
  for (const { pattern, reason } of TRAVERSAL_PATTERNS) {
    if (pattern.test(decodedTarget)) {
      return {
        detected: true,
        eventType: "path_traversal_probe",
        severity: "high",
        outcome: "blocked",
        reason,
      };
    }
  }

  // 2. Check Sensitive Path Probes
  for (const { pattern, reason } of SENSITIVE_PATH_PATTERNS) {
    if (pattern.test(decodedTarget)) {
      const isInformational = reason.includes("Standard security disclosure");
      return {
        detected: true,
        eventType: "probe_sensitive_path",
        severity: isInformational ? "low" : "high",
        outcome: isInformational ? "allowed" : "blocked",
        reason,
      };
    }
  }

  // 3. Check SQL Injection
  for (const { pattern, reason } of SQLI_PATTERNS) {
    if (pattern.test(decodedTarget)) {
      return {
        detected: true,
        eventType: "sqli_probe",
        severity: "critical",
        outcome: "blocked",
        reason,
      };
    }
  }

  // 4. Check XSS Probes
  for (const { pattern, reason } of XSS_PATTERNS) {
    if (pattern.test(decodedTarget)) {
      return {
        detected: true,
        eventType: "xss_probe",
        severity: "high",
        outcome: "blocked",
        reason,
      };
    }
  }

  return null;
}

/**
 * Safely decodes a URL component without throwing URIError on malformed strings.
 */
export function decodeSafe(str: string): string {
  try {
    return decodeURIComponent(str);
  } catch {
    return str;
  }
}

/**
 * Sanitizes a request path, removing any sensitive query parameters.
 */
export function sanitizePath(rawUrl: string): string {
  try {
    const url = new URL(rawUrl, "http://localhost");
    const sanitizedParams = new URLSearchParams();

    url.searchParams.forEach((val, key) => {
      const lower = key.toLowerCase();
      if (SENSITIVE_QUERY_KEYS.has(lower)) {
        sanitizedParams.set(key, "[REDACTED]");
      } else {
        // truncate excessively long query values
        sanitizedParams.set(key, val.length > 80 ? `${val.slice(0, 80)}...` : val);
      }
    });

    const queryString = sanitizedParams.toString();
    return queryString ? `${url.pathname}?${queryString}` : url.pathname;
  } catch {
    return rawUrl.split("?")[0] || rawUrl;
  }
}

/**
 * Creates a privacy-conscious, salted SHA-256 fingerprint from an IP address.
 * Never stores or exposes raw IP address in client-facing dashboards or event logs.
 */
export function generateSourceFingerprint(ip?: string | null): string {
  if (!ip || ip === "unknown" || ip === "127.0.0.1" || ip === "::1") {
    return "src_local_dev";
  }
  const salt = process.env.SECURITY_SALT || process.env.NEXTAUTH_SECRET || "pavan_portfolio_sec_salt";
  const hash = crypto.createHash("sha256").update(`${salt}:${ip}`).digest("hex");
  return `src_${hash.slice(0, 12)}`;
}

/**
 * Masks an IP address for privacy while preserving coarse geographical/subnet context.
 * IPv4: 148.100.108.115 -> 148.100.xxx.xxx
 * IPv6: 2001:db8:85a3:: -> 2001:db8:xxxx:xxxx
 */
export function maskIpAddress(ip?: string | null): string {
  if (!ip || ip === "unknown" || ip === "127.0.0.1" || ip === "::1") {
    return "127.0.0.1 (Localhost)";
  }
  if (ip.includes(":")) {
    const parts = ip.split(":");
    return `${parts.slice(0, 2).join(":")}:xxxx:xxxx`;
  }
  const parts = ip.split(".");
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.xxx.xxx`;
  }
  return "xxx.xxx.xxx.xxx";
}

/**
 * Extracts client IP from standard proxy headers (Vercel, Cloudflare, standard x-forwarded-for).
 */
export function extractClientIp(req: Request): string {
  const headers = req.headers;
  const xForwardedFor = headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const first = xForwardedFor.split(",")[0]?.trim();
    if (first) return first;
  }
  return (
    headers.get("x-real-ip") ||
    headers.get("cf-connecting-ip") ||
    headers.get("x-vercel-forwarded-for") ||
    "unknown"
  );
}

/**
 * Safely filters headers, stripping authorization, cookie, and secrets.
 */
export function extractSafeHeaders(req: Request): Record<string, string> {
  const allowed = ["user-agent", "referer", "accept-language", "accept", "content-type"];
  const result: Record<string, string> = {};

  for (const name of allowed) {
    const val = req.headers.get(name);
    if (val) {
      result[name] = val.length > 200 ? `${val.slice(0, 200)}...` : val;
    }
  }
  return result;
}
