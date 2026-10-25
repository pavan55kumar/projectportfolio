import crypto from "crypto";

export interface AdminAuthResult {
  authorized: boolean;
  reviewer: string;
  reason?: string;
}

/**
 * Returns the configured admin password.
 */
export function getAdminPassword(): string {
  return process.env.ADMIN_PASSWORD || "pavan2026";
}

/**
 * Returns secret used to sign admin session tokens.
 */
function getSigningSecret(): string {
  return (
    process.env.ADMIN_SESSION_SECRET ||
    process.env.NEXTAUTH_SECRET ||
    "pavan_portfolio_admin_jwt_secret_2026"
  );
}

/**
 * Creates a cryptographically signed admin session token.
 * Valid for 7 days by default.
 */
export function createAdminToken(expiresInHours = 168): string {
  const password = getAdminPassword();
  const secret = getSigningSecret();
  const expiresAt = Date.now() + expiresInHours * 3600 * 1000;
  const payload = {
    role: "admin",
    reviewer: "portfolio_admin",
    exp: expiresAt,
    iat: Date.now(),
  };

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", secret)
    .update(`${payloadB64}:${password}`)
    .digest("base64url");

  return `pvn_${payloadB64}.${signature}`;
}

/**
 * Verifies a token string. Supports both HMAC signed format and legacy base64 format.
 */
export function verifyToken(token: string): AdminAuthResult {
  if (!token || typeof token !== "string") {
    return { authorized: false, reviewer: "anonymous", reason: "Missing token" };
  }

  const cleanToken = token.trim().replace(/^Bearer\s+/i, "");
  const correctPassword = getAdminPassword();
  const secret = getSigningSecret();

  // 1. Signed token verification (pvn_<payload>.<signature>)
  if (cleanToken.startsWith("pvn_")) {
    const parts = cleanToken.slice(4).split(".");
    if (parts.length === 2) {
      const [payloadB64, providedSig] = parts;
      const expectedSig = crypto
        .createHmac("sha256", secret)
        .update(`${payloadB64}:${correctPassword}`)
        .digest("base64url");

      if (crypto.timingSafeEqual(Buffer.from(providedSig), Buffer.from(expectedSig))) {
        try {
          const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString("utf-8"));
          if (payload.exp && Date.now() > payload.exp) {
            return { authorized: false, reviewer: "anonymous", reason: "Session expired" };
          }
          return { authorized: true, reviewer: payload.reviewer || "portfolio_admin" };
        } catch {
          return { authorized: false, reviewer: "anonymous", reason: "Invalid token payload" };
        }
      }
    }
  }

  // 2. Legacy base64 token verification: admin:<password>:<timestamp>
  try {
    const decoded = Buffer.from(cleanToken, "base64").toString("utf-8");
    const segments = decoded.split(":");
    if (segments.length >= 3 && segments[0] === "admin") {
      const pass = segments[1];
      const timestamp = parseInt(segments[2], 10);
      // Ensure constant-time password check
      const passMatch =
        pass.length === correctPassword.length &&
        crypto.timingSafeEqual(Buffer.from(pass), Buffer.from(correctPassword));

      // Token expires after 7 days
      const isFresh = !isNaN(timestamp) && Date.now() - timestamp < 7 * 24 * 3600 * 1000;

      if (passMatch && isFresh) {
        return { authorized: true, reviewer: "portfolio_admin" };
      }
    }
  } catch {
    // Malformed base64
  }

  return { authorized: false, reviewer: "anonymous", reason: "Invalid or forged credentials" };
}

/**
 * Extracts and verifies admin authorization from an incoming HTTP Request.
 * Reads Bearer Authorization header, x-admin-token, or cookies.
 */
export function verifyAdminRequest(req: Request): AdminAuthResult {
  // Check Authorization header
  const authHeader = req.headers.get("authorization");
  if (authHeader) {
    const res = verifyToken(authHeader);
    if (res.authorized) return res;
  }

  // Check custom header
  const customHeader = req.headers.get("x-admin-token");
  if (customHeader) {
    const res = verifyToken(customHeader);
    if (res.authorized) return res;
  }

  // Check Cookie header
  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) {
    const match = cookieHeader.match(/pavan_admin_session=([^;]+)/);
    if (match && match[1]) {
      const res = verifyToken(decodeURIComponent(match[1]));
      if (res.authorized) return res;
    }
  }

  return {
    authorized: false,
    reviewer: "anonymous",
    reason: "Unauthorized: Administrator token is missing or invalid",
  };
}
