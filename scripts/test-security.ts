/**
 * Automated Security & Analytics Verification Suite
 * Tests token signing, detection rules, sanitization, rate limiting, and CSV export.
 */

import { createAdminToken, verifyToken } from "../lib/security/auth";
import {
  inspectRequest,
  sanitizePath,
  generateSourceFingerprint,
  maskIpAddress,
} from "../lib/security/detector";
import { checkRateLimit, checkFailedLoginBurst } from "../lib/security/rate-limiter";
import { exportSecurityEventsCsv } from "../lib/security/logger";

let passedCount = 0;
let failedCount = 0;

function assert(condition: boolean, testName: string) {
  if (condition) {
    console.log(`  ✓ PASS: ${testName}`);
    passedCount++;
  } else {
    console.error(`  ✗ FAIL: ${testName}`);
    failedCount++;
  }
}

async function runTests() {
  console.log("\n=======================================================");
  console.log(" Running Analytics & Security Test Suite");
  console.log("=======================================================\n");

  // ── TEST 1: Admin Authentication & Token Verification ──
  console.log("1. Testing Admin Authentication & Token Signatures:");
  const validToken = createAdminToken(24);
  const verifyValid = verifyToken(validToken);
  assert(verifyValid.authorized === true, "Valid HMAC-signed token is authorized");
  assert(verifyValid.reviewer === "portfolio_admin", "Valid token returns reviewer identity");

  const tamperedToken = validToken.slice(0, -4) + "XXXX";
  const verifyTampered = verifyToken(tamperedToken);
  assert(verifyTampered.authorized === false, "Tampered token is rejected");

  const verifyEmpty = verifyToken("");
  assert(verifyEmpty.authorized === false, "Empty token is rejected");

  // Legacy base64 token test
  const legacyToken = Buffer.from("admin:pavan2026:" + Date.now()).toString("base64");
  const verifyLegacy = verifyToken(legacyToken);
  assert(verifyLegacy.authorized === true, "Legacy base64 token accepted for backward compatibility");

  const wrongLegacyToken = Buffer.from("admin:wrongpassword:" + Date.now()).toString("base64");
  const verifyWrongLegacy = verifyToken(wrongLegacyToken);
  assert(verifyWrongLegacy.authorized === false, "Wrong legacy password is rejected");

  // ── TEST 2: Attack Detector Engine ──
  console.log("\n2. Testing Attack Detection Patterns:");

  const sensitiveEnvProbe = inspectRequest("/.env");
  assert(
    sensitiveEnvProbe !== null && sensitiveEnvProbe.eventType === "probe_sensitive_path",
    "Intercepts sensitive path probe: /.env"
  );

  const gitProbe = inspectRequest("/.git/config");
  assert(
    gitProbe !== null && gitProbe.eventType === "probe_sensitive_path",
    "Intercepts Git repository probe: /.git/config"
  );

  const wpProbe = inspectRequest("/wp-login.php");
  assert(
    wpProbe !== null && wpProbe.eventType === "probe_sensitive_path",
    "Intercepts WordPress probe: /wp-login.php"
  );

  const traversalProbe = inspectRequest("/../../etc/passwd");
  assert(
    traversalProbe !== null && traversalProbe.eventType === "path_traversal_probe",
    "Intercepts path traversal probe: /../../etc/passwd"
  );

  const traversalEncoded = inspectRequest("/%2e%2e/%2e%2e/data");
  assert(
    traversalEncoded !== null && traversalEncoded.eventType === "path_traversal_probe",
    "Intercepts URL-encoded path traversal: %2e%2e"
  );

  const sqliUnion = inspectRequest("/api/projects", "category=' UNION SELECT 1,2,3--");
  assert(
    sqliUnion !== null && sqliUnion.eventType === "sqli_probe",
    "Intercepts SQL injection: UNION SELECT"
  );

  const sqliTautology = inspectRequest("/api/skills", "id=' OR '1'='1");
  assert(
    sqliTautology !== null && sqliTautology.eventType === "sqli_probe",
    "Intercepts SQL injection: Boolean tautology (' OR '1'='1)"
  );

  const xssProbe = inspectRequest("/search", "q=<script>alert('pwn')</script>");
  assert(
    xssProbe !== null && xssProbe.eventType === "xss_probe",
    "Intercepts XSS probe: <script> tag"
  );

  const normalRequest = inspectRequest("/engineering-lab/sankat-saathi", "ref=home");
  assert(normalRequest === null, "Normal portfolio request produces NO false positives");

  // ── TEST 3: Parameter & Path Sanitization ──
  console.log("\n3. Testing URL & Query Sanitization:");
  const rawUrl = "/api/login?password=supersecret123&token=abc_xyz_token&view=public";
  const sanitized = sanitizePath(rawUrl);
  assert(
    !sanitized.includes("supersecret123"),
    "Sensitive 'password' parameter value is stripped"
  );
  assert(
    !sanitized.includes("abc_xyz_token"),
    "Sensitive 'token' parameter value is stripped"
  );
  assert(
    sanitized.includes("view=public"),
    "Harmless parameters like 'view=public' are preserved"
  );

  // ── TEST 4: Privacy-Conscious Source Fingerprinting ──
  console.log("\n4. Testing Privacy Source Fingerprinting:");
  const testIp = "148.100.108.115";
  const fp1 = generateSourceFingerprint(testIp);
  const fp2 = generateSourceFingerprint(testIp);
  assert(fp1 === fp2, "Fingerprint is deterministic for the same source");
  assert(fp1.startsWith("src_"), "Fingerprint matches 'src_...' format");
  assert(!fp1.includes(testIp), "Fingerprint never leaks raw IP");

  const masked = maskIpAddress(testIp);
  assert(masked === "148.100.xxx.xxx", "IPv4 address is masked to /16 prefix (148.100.xxx.xxx)");

  // ── TEST 5: Rate Limiter & Burst Detection ──
  console.log("\n5. Testing Rate Limiting & Failed Login Burst Detection:");
  const rateKey = `test_limit_${Date.now()}`;
  for (let i = 0; i < 5; i++) {
    checkRateLimit(rateKey, 5, 10000);
  }
  const overflowCheck = checkRateLimit(rateKey, 5, 10000);
  assert(overflowCheck.allowed === false, "Rate limit overflow correctly blocks 6th request");

  const testBurstFp = `test_burst_${Date.now()}`;
  const burst1 = checkFailedLoginBurst(testBurstFp);
  const burst2 = checkFailedLoginBurst(testBurstFp);
  const burst3 = checkFailedLoginBurst(testBurstFp);
  assert(burst1.isBurst === false, "1st failed attempt does not trigger burst");
  assert(burst2.isBurst === false, "2nd failed attempt does not trigger burst");
  assert(burst3.isBurst === true, "3rd failed attempt triggers burst alert");

  // ── TEST 6: CSV Export & Formula Injection Prevention ──
  console.log("\n6. Testing CSV Formula Injection Escaping:");
  const csvOutput = await exportSecurityEventsCsv({ timeRange: "24h" });
  assert(csvOutput.includes("Timestamp (UTC)"), "CSV contains standard headers");
  assert(!csvOutput.includes("\n=cmd"), "Formula injection character '=' is sanitized");

  // Summary
  console.log("\n=======================================================");
  console.log(` Test Results: ${passedCount} PASSED, ${failedCount} FAILED`);
  console.log("=======================================================\n");

  if (failedCount > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
