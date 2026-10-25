import { NextResponse } from "next/server";
import { getAdminPassword, createAdminToken } from "@/lib/security/auth";
import { recordSecurityEvent } from "@/lib/security/logger";
import {
  extractClientIp,
  generateSourceFingerprint,
  maskIpAddress,
} from "@/lib/security/detector";
import { checkRateLimit, checkFailedLoginBurst } from "@/lib/security/rate-limiter";
import crypto from "crypto";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const clientIp = extractClientIp(req);
    const fingerprint = generateSourceFingerprint(clientIp);

    // Rate limit login attempts: 10 per 5 minutes per source
    const rateCheck = checkRateLimit(`login_attempt:${fingerprint}`, 10, 5 * 60 * 1000);
    if (!rateCheck.allowed) {
      await recordSecurityEvent({
        event_type: "rate_limit_exceeded",
        severity: "high",
        source: "application",
        http_method: "POST",
        path: "/api/admin/login",
        status_code: 429,
        source_fingerprint: fingerprint,
        source_ip_masked: maskIpAddress(clientIp),
        detection_reason: "Excessive login attempts exceeded rate limit window",
        outcome: "blocked",
      });

      return NextResponse.json(
        { error: `Too many login attempts. Please try again in ${rateCheck.retryAfterSeconds} seconds.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.retryAfterSeconds) } }
      );
    }

    const { password } = await req.json();
    const correctPassword = getAdminPassword();

    // Constant-time comparison to prevent timing attacks
    const isMatch =
      typeof password === "string" &&
      password.length === correctPassword.length &&
      crypto.timingSafeEqual(Buffer.from(password), Buffer.from(correctPassword));

    if (isMatch) {
      const token = createAdminToken();

      const response = NextResponse.json({
        success: true,
        token,
      });

      // Set HTTP-only secure cookie
      response.cookies.set("pavan_admin_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/",
        maxAge: 7 * 24 * 3600, // 7 days
      });

      return response;
    }

    // Authentication failed: track failed burst
    const { isBurst, failedCount } = checkFailedLoginBurst(fingerprint);

    await recordSecurityEvent({
      event_type: isBurst ? "auth_burst_failure" : "auth_failed",
      severity: isBurst ? "high" : "medium",
      source: "application",
      http_method: "POST",
      path: "/api/admin/login",
      status_code: 401,
      source_fingerprint: fingerprint,
      source_ip_masked: maskIpAddress(clientIp),
      detection_reason: isBurst
        ? `Repeated failed login burst detected (${failedCount} attempts in 15m)`
        : "Invalid admin password submitted",
      outcome: "blocked",
      details: { attempt_count: failedCount },
    });

    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  } catch (err) {
    console.error("Admin login error:", err);
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
