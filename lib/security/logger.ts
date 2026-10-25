import fs from "fs/promises";
import path from "path";
import crypto from "crypto";
import { getSupabaseAdmin } from "@/lib/supabase";
import {
  SecurityEvent,
  SecurityEventFilter,
  SecurityMetrics,
  SecurityAlert,
} from "./types";

const LOCAL_DATA_FILE = path.join(process.cwd(), "data", "security_events.json");

/**
 * Reads events from local fallback JSON file.
 */
async function readLocalEvents(): Promise<SecurityEvent[]> {
  try {
    const raw = await fs.readFile(LOCAL_DATA_FILE, "utf-8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Writes events to local fallback JSON file.
 */
async function writeLocalEvents(events: SecurityEvent[]): Promise<void> {
  try {
    await fs.mkdir(path.dirname(LOCAL_DATA_FILE), { recursive: true });
    // Cap local file at 1,000 most recent events to prevent unbounded disk growth
    const capped = events.slice(0, 1000);
    await fs.writeFile(LOCAL_DATA_FILE, JSON.stringify(capped, null, 2), "utf-8");
  } catch (err) {
    console.warn("Failed to write to local security_events.json:", err);
  }
}

/**
 * Core function to record a security event.
 * Attempts to insert into Supabase first; falls back to local storage if unavailable.
 * Never throws an uncaught error to prevent breaking user request flows.
 */
export async function recordSecurityEvent(
  event: Omit<SecurityEvent, "id" | "created_at"> & {
    id?: string;
    created_at?: string;
  }
): Promise<SecurityEvent | null> {
  const fullEvent: SecurityEvent = {
    id: event.id || crypto.randomUUID(),
    created_at: event.created_at || new Date().toISOString(),
    event_type: event.event_type,
    severity: event.severity,
    source: event.source,
    http_method: event.http_method || "GET",
    path: event.path || "/",
    status_code: event.status_code || 200,
    source_fingerprint: event.source_fingerprint || "src_unknown",
    source_ip_masked: event.source_ip_masked || "xxx.xxx.xxx.xxx",
    request_id: event.request_id || crypto.randomBytes(6).toString("hex"),
    detection_reason: event.detection_reason,
    outcome: event.outcome,
    related_count: event.related_count || 1,
    details: event.details || {},
    reviewed_at: event.reviewed_at || null,
    reviewed_by: event.reviewed_by || null,
  };

  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { error } = await supabase.from("security_events").insert({
        id: fullEvent.id,
        created_at: fullEvent.created_at,
        event_type: fullEvent.event_type,
        severity: fullEvent.severity,
        source: fullEvent.source,
        http_method: fullEvent.http_method,
        path: fullEvent.path,
        status_code: fullEvent.status_code,
        source_fingerprint: fullEvent.source_fingerprint,
        source_ip_masked: fullEvent.source_ip_masked,
        request_id: fullEvent.request_id,
        detection_reason: fullEvent.detection_reason,
        outcome: fullEvent.outcome,
        details: fullEvent.details,
        reviewed_at: fullEvent.reviewed_at,
        reviewed_by: fullEvent.reviewed_by,
      });

      if (!error) {
        return fullEvent;
      }
      console.warn("Supabase security_events insert error, using local fallback:", error.message);
    } catch (err) {
      console.warn("Supabase insert exception, using local fallback:", err);
    }
  }

  // Fallback to local file
  try {
    const existing = await readLocalEvents();
    const updated = [fullEvent, ...existing];
    await writeLocalEvents(updated);
    return fullEvent;
  } catch (err) {
    console.error("Critical: Failed to persist security event locally:", err);
    return null;
  }
}

/**
 * Queries security events with filtering, pagination, and sorting.
 */
export async function querySecurityEvents(filter: SecurityEventFilter = {}): Promise<{
  events: SecurityEvent[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  backend: "supabase" | "local_fallback";
}> {
  const page = Math.max(1, filter.page || 1);
  const pageSize = Math.min(100, Math.max(1, filter.pageSize || 20));
  const offset = (page - 1) * pageSize;

  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      let query = supabase
        .from("security_events")
        .select("*", { count: "exact" });

      // Apply Time Range
      if (filter.startDate) {
        query = query.gte("created_at", filter.startDate);
      } else if (filter.timeRange) {
        const now = Date.now();
        if (filter.timeRange === "24h") {
          query = query.gte("created_at", new Date(now - 24 * 3600 * 1000).toISOString());
        } else if (filter.timeRange === "7d") {
          query = query.gte("created_at", new Date(now - 7 * 24 * 3600 * 1000).toISOString());
        } else if (filter.timeRange === "30d") {
          query = query.gte("created_at", new Date(now - 30 * 24 * 3600 * 1000).toISOString());
        }
      }
      if (filter.endDate) {
        query = query.lte("created_at", filter.endDate);
      }

      // Apply Severity filter
      if (filter.severity && filter.severity !== "all") {
        query = query.eq("severity", filter.severity);
      }

      // Apply Event Type / Category filter
      if (filter.eventType && filter.eventType !== "all") {
        query = query.eq("event_type", filter.eventType);
      }

      // Apply Outcome filter
      if (filter.outcome && filter.outcome !== "all") {
        query = query.eq("outcome", filter.outcome);
      }

      // Apply Review Status
      if (filter.reviewed === "reviewed") {
        query = query.not("reviewed_at", "is", null);
      } else if (filter.reviewed === "unreviewed") {
        query = query.is("reviewed_at", null);
      }

      // Apply Search (path, fingerprint, detection_reason)
      if (filter.search && filter.search.trim()) {
        const s = filter.search.trim();
        query = query.or(`path.ilike.%${s}%,source_fingerprint.ilike.%${s}%,detection_reason.ilike.%${s}%`);
      }

      // Sorting & Pagination
      query = query
        .order("created_at", { ascending: filter.sortOrder === "asc" })
        .range(offset, offset + pageSize - 1);

      const { data, count, error } = await query;
      if (!error && data !== null) {
        const total = count || 0;
        return {
          events: data as SecurityEvent[],
          total,
          page,
          pageSize,
          totalPages: Math.ceil(total / pageSize),
          backend: "supabase",
        };
      }
    } catch (err) {
      console.warn("Supabase security events query failed, using local file:", err);
    }
  }

  // Fallback local query
  const all = await readLocalEvents();
  let filtered = [...all];

  // Apply filters in-memory
  const now = Date.now();
  if (filter.startDate) {
    filtered = filtered.filter((e) => new Date(e.created_at) >= new Date(filter.startDate!));
  } else if (filter.timeRange === "24h") {
    filtered = filtered.filter((e) => now - new Date(e.created_at).getTime() <= 24 * 3600 * 1000);
  } else if (filter.timeRange === "7d") {
    filtered = filtered.filter((e) => now - new Date(e.created_at).getTime() <= 7 * 24 * 3600 * 1000);
  } else if (filter.timeRange === "30d") {
    filtered = filtered.filter((e) => now - new Date(e.created_at).getTime() <= 30 * 24 * 3600 * 1000);
  }
  if (filter.endDate) {
    filtered = filtered.filter((e) => new Date(e.created_at) <= new Date(filter.endDate!));
  }

  if (filter.severity && filter.severity !== "all") {
    filtered = filtered.filter((e) => e.severity === filter.severity);
  }
  if (filter.eventType && filter.eventType !== "all") {
    filtered = filtered.filter((e) => e.event_type === filter.eventType);
  }
  if (filter.outcome && filter.outcome !== "all") {
    filtered = filtered.filter((e) => e.outcome === filter.outcome);
  }
  if (filter.reviewed === "reviewed") {
    filtered = filtered.filter((e) => Boolean(e.reviewed_at));
  } else if (filter.reviewed === "unreviewed") {
    filtered = filtered.filter((e) => !e.reviewed_at);
  }
  if (filter.search && filter.search.trim()) {
    const q = filter.search.toLowerCase().trim();
    filtered = filtered.filter(
      (e) =>
        (e.path && e.path.toLowerCase().includes(q)) ||
        (e.source_fingerprint && e.source_fingerprint.toLowerCase().includes(q)) ||
        (e.detection_reason && e.detection_reason.toLowerCase().includes(q))
    );
  }

  // Sort
  filtered.sort((a, b) => {
    const diff = new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
    return filter.sortOrder === "asc" ? -diff : diff;
  });

  const total = filtered.length;
  const paged = filtered.slice(offset, offset + pageSize);

  return {
    events: paged,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
    backend: "local_fallback",
  };
}

/**
 * Marks an event as reviewed by an administrator.
 */
export async function markSecurityEventReviewed(
  id: string,
  reviewer: string
): Promise<boolean> {
  const reviewed_at = new Date().toISOString();
  const supabase = getSupabaseAdmin();
  if (supabase) {
    try {
      const { error } = await supabase
        .from("security_events")
        .update({ reviewed_at, reviewed_by: reviewer })
        .eq("id", id);
      if (!error) return true;
    } catch (err) {
      console.warn("Supabase mark reviewed error:", err);
    }
  }

  // Local fallback
  try {
    const list = await readLocalEvents();
    let modified = false;
    const updated = list.map((item) => {
      if (item.id === id) {
        modified = true;
        return { ...item, reviewed_at, reviewed_by: reviewer };
      }
      return item;
    });
    if (modified) {
      await writeLocalEvents(updated);
      return true;
    }
  } catch (err) {
    console.error("Local mark reviewed error:", err);
  }
  return false;
}

/**
 * Computes genuine aggregated metrics from recorded security events.
 */
export async function getSecurityMetrics(
  timeRange: "24h" | "7d" | "30d" = "7d"
): Promise<SecurityMetrics> {
  const queryResult = await querySecurityEvents({
    timeRange,
    pageSize: 1000,
  });

  const events = queryResult.events;
  let suspiciousRequests = 0;
  let blockedRequests = 0;
  let failedAuthAttempts = 0;
  let unreviewedHighSeverity = 0;
  let criticalEventsCount = 0;

  const eventsBySeverity = { critical: 0, high: 0, medium: 0, low: 0 };
  const eventsByCategory: Record<string, number> = {};

  // Compute time intervals for histogram (e.g. 7 buckets)
  const bucketCount = timeRange === "24h" ? 24 : 7;
  const now = Date.now();
  const rangeMs =
    timeRange === "24h"
      ? 24 * 3600 * 1000
      : timeRange === "7d"
      ? 7 * 24 * 3600 * 1000
      : 30 * 24 * 3600 * 1000;
  const bucketMs = rangeMs / bucketCount;

  const buckets: Array<{
    timestamp: string;
    label: string;
    total: number;
    blocked: number;
    suspicious: number;
  }> = [];

  for (let i = bucketCount - 1; i >= 0; i--) {
    const bucketStart = new Date(now - (i + 1) * bucketMs);
    const label =
      timeRange === "24h"
        ? bucketStart.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        : bucketStart.toLocaleDateString([], { month: "short", day: "numeric" });
    buckets.push({
      timestamp: bucketStart.toISOString(),
      label,
      total: 0,
      blocked: 0,
      suspicious: 0,
    });
  }

  for (const e of events) {
    // Severity tally
    if (e.severity in eventsBySeverity) {
      eventsBySeverity[e.severity as keyof typeof eventsBySeverity]++;
    }
    if (e.severity === "critical") criticalEventsCount++;

    // Unreviewed high/critical
    if ((e.severity === "high" || e.severity === "critical") && !e.reviewed_at) {
      unreviewedHighSeverity++;
    }

    // Outcome & category tally
    if (e.outcome === "blocked" || e.outcome === "denied") {
      blockedRequests++;
    }
    if (e.outcome === "flagged" || e.severity === "high" || e.severity === "critical") {
      suspiciousRequests++;
    }
    if (e.event_type.includes("auth")) {
      failedAuthAttempts++;
    }

    eventsByCategory[e.event_type] = (eventsByCategory[e.event_type] || 0) + 1;

    // Time series bucket placement
    const eventTime = new Date(e.created_at).getTime();
    const bucketIndex = Math.min(
      bucketCount - 1,
      Math.max(0, Math.floor((eventTime - (now - rangeMs)) / bucketMs))
    );
    if (buckets[bucketIndex]) {
      buckets[bucketIndex].total++;
      if (e.outcome === "blocked" || e.outcome === "denied") {
        buckets[bucketIndex].blocked++;
      }
      if (e.severity === "high" || e.severity === "critical") {
        buckets[bucketIndex].suspicious++;
      }
    }
  }

  return {
    totalEvents: queryResult.total,
    suspiciousRequests,
    blockedRequests,
    failedAuthAttempts,
    unreviewedHighSeverity,
    criticalEventsCount,
    eventsBySeverity,
    eventsByCategory,
    timeSeries: buckets,
    storageBackend: queryResult.backend,
  };
}

/**
 * Computes actionable security alerts based on event patterns and thresholds.
 */
export async function getSecurityAlerts(): Promise<SecurityAlert[]> {
  const { events } = await querySecurityEvents({ timeRange: "24h", pageSize: 500 });
  const alerts: SecurityAlert[] = [];

  // 1. Check Repeated Failed Logins (> 3 in 24h)
  const failedLogins = events.filter((e) => e.event_type === "auth_failed" || e.event_type === "auth_burst_failure");
  if (failedLogins.length >= 3) {
    alerts.push({
      id: "alert-failed-logins",
      title: "Multiple Failed Authentication Attempts",
      severity: failedLogins.length >= 10 ? "critical" : "high",
      count: failedLogins.length,
      timeWindow: "Last 24 Hours",
      firstSeen: failedLogins[failedLogins.length - 1].created_at,
      lastSeen: failedLogins[0].created_at,
      description: `${failedLogins.length} failed login attempts recorded. Monitor for automated password spray or brute force.`,
      sampleEventId: failedLogins[0].id,
    });
  }

  // 2. Check SQL Injection or Traversal Probes
  const exploitProbes = events.filter((e) => e.event_type === "sqli_probe" || e.event_type === "path_traversal_probe");
  if (exploitProbes.length > 0) {
    alerts.push({
      id: "alert-exploit-probes",
      title: "Active Exploit Probes Blocked",
      severity: "high",
      count: exploitProbes.length,
      timeWindow: "Last 24 Hours",
      firstSeen: exploitProbes[exploitProbes.length - 1].created_at,
      lastSeen: exploitProbes[0].created_at,
      description: `${exploitProbes.length} hostile SQL injection or path traversal probe(s) were intercepted and blocked at the edge.`,
      sampleEventId: exploitProbes[0].id,
    });
  }

  // 3. Check Sensitive File Scanners
  const fileScans = events.filter((e) => e.event_type === "probe_sensitive_path");
  if (fileScans.length >= 3) {
    alerts.push({
      id: "alert-file-scans",
      title: "Sensitive Path Scanner Activity",
      severity: "medium",
      count: fileScans.length,
      timeWindow: "Last 24 Hours",
      firstSeen: fileScans[fileScans.length - 1].created_at,
      lastSeen: fileScans[0].created_at,
      description: `${fileScans.length} probes for sensitive configuration files (.env, .git, wp-admin) detected and blocked.`,
      sampleEventId: fileScans[0].id,
    });
  }

  return alerts;
}

/**
 * Generates safe sanitized CSV for export.
 * Escapes characters (=, +, -, @) that could trigger CSV formula injection in spreadsheet software.
 */
export async function exportSecurityEventsCsv(filter: SecurityEventFilter): Promise<string> {
  const { events } = await querySecurityEvents({
    ...filter,
    pageSize: 1000,
  });

  const headers = [
    "Timestamp (UTC)",
    "Event Category",
    "Severity",
    "Outcome",
    "HTTP Method",
    "Requested Path",
    "Status Code",
    "Source Fingerprint",
    "Detection Reason",
    "Review Status",
    "Reviewed By",
  ];

  const escapeCsv = (str: unknown): string => {
    if (str === null || str === undefined) return '""';
    let val = String(str).replace(/"/g, '""');
    // Prevent CSV formula injection: prefix leading formula characters with a single quote
    if (/^[=+\-@\t\r]/.test(val)) {
      val = `'${val}`;
    }
    return `"${val}"`;
  };

  const rows = events.map((e) => [
    escapeCsv(e.created_at),
    escapeCsv(e.event_type),
    escapeCsv(e.severity),
    escapeCsv(e.outcome),
    escapeCsv(e.http_method || "GET"),
    escapeCsv(e.path || "/"),
    escapeCsv(e.status_code || 200),
    escapeCsv(e.source_fingerprint || "unknown"),
    escapeCsv(e.detection_reason),
    escapeCsv(e.reviewed_at ? "Reviewed" : "Unreviewed"),
    escapeCsv(e.reviewed_by || ""),
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}
