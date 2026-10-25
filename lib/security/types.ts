export type SecuritySeverity = "low" | "medium" | "high" | "critical";

export type SecurityOutcome = "blocked" | "flagged" | "allowed" | "denied" | "logged";

export type SecuritySource = "application" | "middleware" | "edge" | "audit" | "vercel";

export type SecurityEventType =
  | "auth_failed"
  | "auth_burst_failure"
  | "unauthorized_access"
  | "authorization_denied"
  | "rate_limit_exceeded"
  | "request_burst"
  | "probe_sensitive_path"
  | "sqli_probe"
  | "xss_probe"
  | "path_traversal_probe"
  | "scanner_probe"
  | "content_mutation"
  | "error_5xx";

export interface SecurityEvent {
  id: string;
  created_at: string;
  event_type: SecurityEventType | string;
  severity: SecuritySeverity;
  source: SecuritySource;
  http_method?: string;
  path?: string;
  status_code?: number;
  source_fingerprint?: string; // Salted pseudonymized hash
  source_ip_masked?: string;   // e.g. "148.100.xxx.xxx" or "2001:db8:..."
  request_id?: string;
  detection_reason: string;
  outcome: SecurityOutcome;
  related_count?: number;
  details?: Record<string, unknown>;
  reviewed_at?: string | null;
  reviewed_by?: string | null;
}

export interface SecurityEventFilter {
  timeRange?: "24h" | "7d" | "30d" | "custom";
  startDate?: string;
  endDate?: string;
  severity?: SecuritySeverity | "all";
  eventType?: string | "all";
  outcome?: SecurityOutcome | "all";
  reviewed?: "all" | "reviewed" | "unreviewed";
  search?: string;
  page?: number;
  pageSize?: number;
  sortBy?: "created_at" | "severity";
  sortOrder?: "asc" | "desc";
}

export interface SecurityMetrics {
  totalEvents: number;
  suspiciousRequests: number;
  blockedRequests: number;
  failedAuthAttempts: number;
  unreviewedHighSeverity: number;
  criticalEventsCount: number;
  eventsBySeverity: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  eventsByCategory: Record<string, number>;
  timeSeries: Array<{
    timestamp: string;
    label: string;
    total: number;
    blocked: number;
    suspicious: number;
  }>;
  storageBackend: "supabase" | "local_fallback";
}

export interface SecurityAlert {
  id: string;
  title: string;
  severity: SecuritySeverity;
  count: number;
  timeWindow: string;
  firstSeen: string;
  lastSeen: string;
  description: string;
  sampleEventId?: string;
}

export interface UmamiStats {
  pageviews: { value: number; change?: number };
  visitors: { value: number; change?: number };
  visits: { value: number; change?: number };
  bounces: { value: number; change?: number };
  totaltime: { value: number; change?: number };
}

export interface UmamiMetricItem {
  x: string;
  y: number;
}

export interface UmamiAnalyticsResponse {
  connected: boolean;
  message?: string;
  websiteId?: string;
  hostUrl?: string;
  stats?: UmamiStats;
  pageviewsSeries?: Array<{ x: string; y: number }>;
  topPages?: UmamiMetricItem[];
  topProjects?: UmamiMetricItem[];
  referrers?: UmamiMetricItem[];
  devices?: UmamiMetricItem[];
  browsers?: UmamiMetricItem[];
  os?: UmamiMetricItem[];
  countries?: UmamiMetricItem[];
  customEvents?: UmamiMetricItem[];
}
