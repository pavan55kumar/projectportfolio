"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  FiShield,
  FiActivity,
  FiAlertTriangle,
  FiCheckCircle,
  FiLock,
  FiSearch,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiEye,
  FiClock,
  FiGlobe,
  FiExternalLink,
  FiCheck,
  FiInfo,
  FiX,
  FiLayers,
  FiTrendingUp,
  FiUsers,
  FiSlash,
  FiDatabase,
  FiHelpCircle,
} from "react-icons/fi";
import {
  SecurityEvent,
  SecurityMetrics,
  SecurityAlert,
  SecuritySeverity,
  SecurityOutcome,
  UmamiAnalyticsResponse,
} from "@/lib/security/types";

interface Props {
  token: string;
}

export default function AnalyticsSecurityTab({ token }: Props) {
  // Global filters
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d" | "custom">("7d");
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  // Timeline filters
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState<SecuritySeverity | "all">("all");
  const [outcomeFilter, setOutcomeFilter] = useState<SecurityOutcome | "all">("all");
  const [reviewedFilter, setReviewedFilter] = useState<"all" | "reviewed" | "unreviewed">("all");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(15);

  // Data states
  const [metrics, setMetrics] = useState<SecurityMetrics | null>(null);
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [totalEvents, setTotalEvents] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [analytics, setAnalytics] = useState<UmamiAnalyticsResponse | null>(null);

  // UI state
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(null);
  const [reviewingId, setReviewingId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const getAuthHeaders = useCallback((): HeadersInit => {
    const headers: Record<string, string> = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      headers["x-admin-token"] = token;
    }
    return headers;
  }, [token]);

  // Load metrics & alerts
  const loadMetricsAndAnalytics = useCallback(async () => {
    try {
      const activeRange = timeRange === "custom" ? "7d" : timeRange;
      const headers = getAuthHeaders();

      const [metricsRes, analyticsRes] = await Promise.allSettled([
        fetch(`/api/admin/security/metrics?timeRange=${activeRange}`, { headers }),
        fetch(`/api/admin/analytics?timeRange=${activeRange}`, { headers }),
      ]);

      if (metricsRes.status === "fulfilled" && metricsRes.value.ok) {
        const data = await metricsRes.value.json();
        setMetrics(data.metrics);
        setAlerts(data.alerts || []);
      }

      if (analyticsRes.status === "fulfilled" && analyticsRes.value.ok) {
        const data = await analyticsRes.value.json();
        setAnalytics(data);
      }
    } catch (err) {
      console.warn("Failed to load metrics:", err);
    }
  }, [getAuthHeaders, timeRange]);

  // Load timeline events
  const loadEvents = useCallback(async () => {
    try {
      const headers = getAuthHeaders();
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("pageSize", String(pageSize));
      params.set("timeRange", timeRange);
      if (timeRange === "custom" && customStart) params.set("startDate", new Date(customStart).toISOString());
      if (timeRange === "custom" && customEnd) params.set("endDate", new Date(customEnd).toISOString());
      if (search.trim()) params.set("search", search.trim());
      if (categoryFilter !== "all") params.set("eventType", categoryFilter);
      if (severityFilter !== "all") params.set("severity", severityFilter);
      if (outcomeFilter !== "all") params.set("outcome", outcomeFilter);
      if (reviewedFilter !== "all") params.set("reviewed", reviewedFilter);

      const res = await fetch(`/api/admin/security/events?${params.toString()}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setEvents(data.events || []);
        setTotalEvents(data.total || 0);
        setTotalPages(data.totalPages || 1);
      }
    } catch (err) {
      console.warn("Failed to load events:", err);
    }
  }, [getAuthHeaders, page, pageSize, timeRange, customStart, customEnd, search, categoryFilter, severityFilter, outcomeFilter, reviewedFilter]);

  // Initial and refresh loader
  const refreshAll = useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadMetricsAndAnalytics(), loadEvents()]);
    setRefreshing(false);
    setLoading(false);
  }, [loadMetricsAndAnalytics, loadEvents]);

  useEffect(() => {
    refreshAll();
  }, [refreshAll]);

  // Mark event as reviewed
  const handleMarkReviewed = async (id: string) => {
    setReviewingId(id);
    try {
      const res = await fetch("/api/admin/security/events", {
        method: "PATCH",
        headers: getAuthHeaders(),
        body: JSON.stringify({ id, reviewed: true }),
      });
      if (res.ok) {
        showToast("Security event marked as reviewed");
        setEvents((prev) =>
          prev.map((e) =>
            e.id === id
              ? {
                  ...e,
                  reviewed_at: new Date().toISOString(),
                  reviewed_by: "portfolio_admin",
                }
              : e
          )
        );
        if (selectedEvent && selectedEvent.id === id) {
          setSelectedEvent({
            ...selectedEvent,
            reviewed_at: new Date().toISOString(),
            reviewed_by: "portfolio_admin",
          });
        }
        loadMetricsAndAnalytics();
      } else {
        showToast("Failed to mark event reviewed");
      }
    } catch {
      showToast("Error communicating with server");
    } finally {
      setReviewingId(null);
    }
  };

  // CSV Export
  const handleExportCsv = async () => {
    setExporting(true);
    try {
      const params = new URLSearchParams();
      params.set("timeRange", timeRange);
      if (categoryFilter !== "all") params.set("eventType", categoryFilter);
      if (severityFilter !== "all") params.set("severity", severityFilter);

      const res = await fetch(`/api/admin/security/export?${params.toString()}`, {
        headers: getAuthHeaders(),
      });

      if (!res.ok) throw new Error("Export request failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `security-audit-events-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      showToast("CSV export downloaded successfully");
    } catch (err) {
      console.error("Export error:", err);
      showToast("Failed to download CSV export");
    } finally {
      setExporting(false);
    }
  };

  const getSeverityBadge = (severity: SecuritySeverity) => {
    switch (severity) {
      case "critical":
        return "bg-rose-600/15 text-rose-700 border-rose-500/30 font-bold";
      case "high":
        return "bg-amber-500/15 text-amber-700 border-amber-500/30 font-semibold";
      case "medium":
        return "bg-orange-400/15 text-orange-700 border-orange-400/30 font-medium";
      case "low":
      default:
        return "bg-slate-400/15 text-slate-700 border-slate-300 font-normal";
    }
  };

  const getOutcomeBadge = (outcome: SecurityOutcome) => {
    switch (outcome) {
      case "blocked":
      case "denied":
        return "bg-rose-500/10 text-rose-700 border-rose-300";
      case "flagged":
        return "bg-amber-500/10 text-amber-700 border-amber-300";
      case "allowed":
        return "bg-emerald-500/10 text-emerald-700 border-emerald-300";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  return (
    <section className="mt-8 space-y-8 animate-fadeIn">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-xl bg-[#2a1008] text-white text-xs font-semibold shadow-xl border border-[#8b1a1a]/30">
          <FiCheck className="text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-6 border-b border-[#8b1a1a]/15">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#2a1008] flex items-center gap-2.5">
            <FiShield className="text-[#8b1a1a]" /> Analytics &amp; Security Dashboard
          </h2>
          <p className="text-xs sm:text-sm text-[#7a4a35] mt-1">
            Genuine visitor telemetry, real-time edge attack interception, and tamper-resistant audit timeline.
          </p>
        </div>

        {/* Status Indicators & Date Filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Edge Protection Badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-300 shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Edge Protection Active
          </span>

          {/* Database Backend Badge */}
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-[#faeedd] text-[#7a4a35] border border-[#8b1a1a]/20">
            <FiDatabase className="text-[#8b1a1a]" />
            {metrics?.storageBackend === "supabase" ? "Supabase RLS DB" : "Local Storage Fallback"}
          </span>

          {/* Time Filter Buttons */}
          <div className="inline-flex rounded-xl p-1 bg-white border border-[#8b1a1a]/20 shadow-2xs">
            {(["24h", "7d", "30d", "custom"] as const).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => {
                  setTimeRange(r);
                  setPage(1);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  timeRange === r
                    ? "bg-[#8b1a1a] text-white shadow-xs"
                    : "text-[#7a4a35] hover:text-[#2a1008] hover:bg-[#faeedd]"
                }`}
              >
                {r === "24h" ? "24 Hours" : r === "7d" ? "7 Days" : r === "30d" ? "30 Days" : "Custom"}
              </button>
            ))}
          </div>

          {/* Refresh Button */}
          <button
            type="button"
            onClick={refreshAll}
            disabled={refreshing}
            className="p-2.5 rounded-xl bg-white border border-[#8b1a1a]/20 text-[#7a4a35] hover:text-[#2a1008] hover:bg-[#faeedd] shadow-2xs transition-all disabled:opacity-50"
            title="Refresh metrics and timeline"
          >
            <FiRefreshCw className={`text-sm ${refreshing ? "animate-spin text-[#8b1a1a]" : ""}`} />
          </button>
        </div>
      </div>

      {/* Custom Date Inputs if selected */}
      {timeRange === "custom" && (
        <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-2xl bg-white border border-[#8b1a1a]/20 shadow-xs">
          <span className="text-xs font-bold text-[#2a1008] flex items-center gap-1.5">
            <FiClock className="text-[#8b1a1a]" /> Custom Window:
          </span>
          <input
            type="datetime-local"
            value={customStart}
            onChange={(e) => setCustomStart(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-[#8b1a1a]/20 text-xs text-[#2a1008] bg-[#fffaf2]"
          />
          <span className="text-xs text-[#7a4a35]">to</span>
          <input
            type="datetime-local"
            value={customEnd}
            onChange={(e) => setCustomEnd(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-[#8b1a1a]/20 text-xs text-[#2a1008] bg-[#fffaf2]"
          />
          <button
            type="button"
            onClick={refreshAll}
            className="px-3.5 py-1.5 rounded-lg bg-[#8b1a1a] text-white text-xs font-bold hover:bg-[#721515]"
          >
            Apply Range
          </button>
        </div>
      )}

      {/* ── SECTION A: OVERVIEW KPI METRICS ── */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Page Views */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#8b1a1a]/15 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-[#7a4a35]">
            <span>TOTAL PAGE VIEWS</span>
            <FiTrendingUp className="text-[#8b1a1a] text-base" />
          </div>
          <div className="mt-3">
            {analytics?.connected && analytics.stats ? (
              <p className="text-2xl sm:text-3xl font-extrabold text-[#2a1008]">
                {analytics.stats.pageviews.value.toLocaleString()}
              </p>
            ) : (
              <div>
                <p className="text-xs font-semibold text-amber-700">Not connected</p>
                <p className="text-[11px] text-[#7a4a35]/80 mt-0.5">Umami analytics offline</p>
              </div>
            )}
          </div>
        </div>

        {/* Unique Visitors */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#8b1a1a]/15 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-[#7a4a35]">
            <span>UNIQUE VISITORS</span>
            <FiUsers className="text-[#8b1a1a] text-base" />
          </div>
          <div className="mt-3">
            {analytics?.connected && analytics.stats ? (
              <p className="text-2xl sm:text-3xl font-extrabold text-[#2a1008]">
                {analytics.stats.visitors.value.toLocaleString()}
              </p>
            ) : (
              <div>
                <p className="text-xs font-semibold text-amber-700">Not connected</p>
                <p className="text-[11px] text-[#7a4a35]/80 mt-0.5">Awaiting visitor stream</p>
              </div>
            )}
          </div>
        </div>

        {/* Blocked Requests */}
        <div className="p-4 sm:p-5 rounded-2xl bg-white border border-[#8b1a1a]/15 shadow-sm">
          <div className="flex items-center justify-between text-xs font-bold text-[#7a4a35]">
            <span>BLOCKED REQUESTS</span>
            <FiSlash className="text-rose-600 text-base" />
          </div>
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-extrabold text-[#2a1008]">
              {metrics ? metrics.blockedRequests.toLocaleString() : "..."}
            </p>
            <p className="text-[11px] text-[#7a4a35] mt-0.5">Edge probe interdictions</p>
          </div>
        </div>

        {/* Unreviewed High-Severity Alerts */}
        <div className={`p-4 sm:p-5 rounded-2xl border shadow-sm transition-colors ${
          (metrics?.unreviewedHighSeverity || 0) > 0
            ? "bg-rose-50/70 border-rose-300"
            : "bg-white border-[#8b1a1a]/15"
        }`}>
          <div className="flex items-center justify-between text-xs font-bold text-[#7a4a35]">
            <span>HIGH/CRITICAL ALERTS</span>
            <FiAlertTriangle className={
              (metrics?.unreviewedHighSeverity || 0) > 0 ? "text-rose-600 text-base animate-bounce" : "text-[#8b1a1a] text-base"
            } />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <p className={`text-2xl sm:text-3xl font-extrabold ${
              (metrics?.unreviewedHighSeverity || 0) > 0 ? "text-rose-700" : "text-[#2a1008]"
            }`}>
              {metrics ? metrics.unreviewedHighSeverity.toLocaleString() : "0"}
            </p>
            <span className="text-[11px] font-semibold text-[#7a4a35]">unreviewed</span>
          </div>
        </div>
      </div>

      {/* Secondary Metric Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 rounded-xl bg-[#fffaf2] border border-[#8b1a1a]/10 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-[#7a4a35]">Recorded Events</p>
            <p className="text-lg font-bold text-[#2a1008]">{metrics?.totalEvents ?? 0}</p>
          </div>
          <FiLayers className="text-[#8b1a1a]/60 text-lg" />
        </div>

        <div className="p-3.5 rounded-xl bg-[#fffaf2] border border-[#8b1a1a]/10 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-[#7a4a35]">Suspicious Requests</p>
            <p className="text-lg font-bold text-amber-700">{metrics?.suspiciousRequests ?? 0}</p>
          </div>
          <FiActivity className="text-amber-600/60 text-lg" />
        </div>

        <div className="p-3.5 rounded-xl bg-[#fffaf2] border border-[#8b1a1a]/10 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-[#7a4a35]">Failed Auth Attempts</p>
            <p className="text-lg font-bold text-rose-700">{metrics?.failedAuthAttempts ?? 0}</p>
          </div>
          <FiLock className="text-rose-600/60 text-lg" />
        </div>

        <div className="p-3.5 rounded-xl bg-[#fffaf2] border border-[#8b1a1a]/10 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-[#7a4a35]">Active Incidents</p>
            <p className="text-lg font-bold text-[#2a1008]">{alerts.length}</p>
          </div>
          <FiAlertTriangle className="text-[#8b1a1a]/60 text-lg" />
        </div>
      </div>

      {/* ── SECTION B: TRAFFIC ANALYTICS (UMAMI INTEGRATION) ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-[#2a1008] flex items-center gap-2">
            <FiGlobe className="text-[#8b1a1a]" /> Portfolio Traffic Analytics
          </h3>
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${
            analytics?.connected
              ? "bg-emerald-50 text-emerald-800 border-emerald-300"
              : "bg-amber-50 text-amber-800 border-amber-300"
          }`}>
            {analytics?.connected ? "Umami Connected" : "Analytics Not Connected"}
          </span>
        </div>

        {analytics?.connected ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* Top Visited Pages & Projects */}
            <div className="p-5 rounded-2xl bg-white border border-[#8b1a1a]/15 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-[#2a1008] uppercase tracking-wider">
                Top Visited Pages &amp; Lab Projects
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {analytics.topPages && analytics.topPages.length > 0 ? (
                  analytics.topPages.map((page, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-[#8b1a1a]/8">
                      <span className="font-mono text-[#2a1008] truncate max-w-[200px]" title={page.x}>
                        {page.x}
                      </span>
                      <span className="font-bold text-[#8b1a1a]">{page.y} views</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#7a4a35] py-4 text-center">No page views recorded in this period.</p>
                )}
              </div>
            </div>

            {/* Referrers */}
            <div className="p-5 rounded-2xl bg-white border border-[#8b1a1a]/15 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-[#2a1008] uppercase tracking-wider">
                Top Referrer Channels
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {analytics.referrers && analytics.referrers.length > 0 ? (
                  analytics.referrers.map((ref, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-[#8b1a1a]/8">
                      <span className="font-semibold text-[#2a1008] truncate max-w-[200px]">{ref.x || "Direct / Bookmark"}</span>
                      <span className="font-bold text-[#7a4a35]">{ref.y}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#7a4a35] py-4 text-center">No referrers recorded yet.</p>
                )}
              </div>
            </div>

            {/* Device & Browser Distribution */}
            <div className="p-5 rounded-2xl bg-white border border-[#8b1a1a]/15 shadow-sm space-y-3">
              <h4 className="text-xs font-bold text-[#2a1008] uppercase tracking-wider">
                Device &amp; Platform Breakdown
              </h4>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {analytics.devices && analytics.devices.length > 0 ? (
                  analytics.devices.map((dev, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs py-1.5 border-b border-[#8b1a1a]/8">
                      <span className="capitalize font-semibold text-[#2a1008]">{dev.x}</span>
                      <span className="font-bold text-[#7a4a35]">{dev.y} visits</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#7a4a35] py-4 text-center">No device records yet.</p>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Unconfigured Setup State */
          <div className="p-6 rounded-2xl bg-white border border-amber-300 shadow-sm space-y-4">
            <div className="flex items-start gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                <FiInfo className="text-xl" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-[#2a1008]">
                  Connect Privacy-Conscious Visitor Analytics (Umami)
                </h4>
                <p className="text-xs text-[#7a4a35] leading-relaxed">
                  To display genuine pageviews, real-time visitors, and geographic breakdown without cookies or tracking personal data, configure your Umami credentials in Vercel or your local environment.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-[#fffaf2] border border-[#8b1a1a]/15 space-y-2 text-xs">
                <p className="font-bold text-[#2a1008]">Required Server Environment Variables:</p>
                <ul className="space-y-1.5 font-mono text-[11px] text-[#7a4a35]">
                  <li className="bg-white p-1.5 rounded border border-[#8b1a1a]/10">
                    <span className="text-[#8b1a1a] font-bold">UMAMI_WEBSITE_ID</span>=your-umami-website-id
                  </li>
                  <li className="bg-white p-1.5 rounded border border-[#8b1a1a]/10">
                    <span className="text-[#8b1a1a] font-bold">UMAMI_API_KEY</span>=your-umami-api-key
                  </li>
                  <li className="bg-white p-1.5 rounded border border-[#8b1a1a]/10">
                    <span className="text-[#8b1a1a] font-bold">UMAMI_HOST_URL</span>=https://api.umami.is
                  </li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-[#fffaf2] border border-[#8b1a1a]/15 space-y-2 text-xs">
                <p className="font-bold text-[#2a1008]">Public Client Tracking Script Tag (Optional):</p>
                <div className="p-2 rounded bg-white border border-[#8b1a1a]/10 font-mono text-[11px] text-[#7a4a35] break-all select-all">
                  &lt;script defer src=&quot;https://cloud.umami.is/script.js&quot; data-website-id=&quot;YOUR_WEBSITE_ID&quot;&gt;&lt;/script&gt;
                </div>
                <p className="text-[11px] text-[#7a4a35]">
                  Umami is completely cookie-free, GDPR compliant, and never stores IP addresses or personal identities.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── SECTION C: SECURITY ALERTS ── */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-lg font-bold text-[#2a1008] flex items-center gap-2">
            <FiAlertTriangle className="text-rose-600" /> Active Security Alerts ({alerts.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {alerts.map((alert) => (
              <div
                key={alert.id}
                className="p-4 rounded-2xl bg-white border border-rose-200 shadow-xs space-y-2.5"
              >
                <div className="flex items-center justify-between">
                  <span className={`text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-md border ${getSeverityBadge(alert.severity)}`}>
                    {alert.severity}
                  </span>
                  <span className="text-xs text-[#7a4a35] flex items-center gap-1">
                    <FiClock /> {alert.timeWindow}
                  </span>
                </div>
                <h4 className="text-sm font-bold text-[#2a1008]">{alert.title}</h4>
                <p className="text-xs text-[#7a4a35] leading-relaxed">{alert.description}</p>
                <div className="flex items-center justify-between pt-1 border-t border-[#8b1a1a]/10 text-xs">
                  <span className="font-semibold text-rose-700">{alert.count} occurrences</span>
                  {alert.sampleEventId && (
                    <button
                      type="button"
                      onClick={() => {
                        const match = events.find((e) => e.id === alert.sampleEventId);
                        if (match) setSelectedEvent(match);
                      }}
                      className="text-[#8b1a1a] hover:underline font-bold inline-flex items-center gap-1"
                    >
                      View Event <FiExternalLink className="text-[10px]" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── SECTION D: SECURITY ACTIVITY TIMELINE ── */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-[#2a1008] flex items-center gap-2">
              <FiActivity className="text-[#8b1a1a]" /> Security Activity Timeline
            </h3>
            <p className="text-xs text-[#7a4a35]">
              Real-time audit log of authenticated administrative actions, blocked probes, and security incidents.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExportCsv}
            disabled={exporting}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-white hover:bg-[#faeedd] text-[#8b1a1a] border border-[#8b1a1a]/25 shadow-2xs transition-all disabled:opacity-50"
          >
            <FiDownload /> {exporting ? "Generating CSV..." : "Export Filtered CSV"}
          </button>
        </div>

        {/* Timeline Filters Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 p-3 rounded-2xl bg-white border border-[#8b1a1a]/15 shadow-2xs">
          {/* Search Box */}
          <div className="relative">
            <FiSearch className="absolute left-3 top-3 text-[#7a4a35]" />
            <input
              type="text"
              placeholder="Search path, fingerprint..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-[#8b1a1a]/20 text-xs text-[#2a1008] bg-[#fffaf2] outline-none focus:border-[#8b1a1a]"
            />
          </div>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-[#8b1a1a]/20 text-xs text-[#2a1008] bg-[#fffaf2] outline-none"
          >
            <option value="all">All Categories</option>
            <option value="probe_sensitive_path">Sensitive Path Probe</option>
            <option value="sqli_probe">SQL Injection Probe</option>
            <option value="xss_probe">XSS Script Probe</option>
            <option value="path_traversal_probe">Path Traversal</option>
            <option value="auth_failed">Failed Login</option>
            <option value="auth_burst_failure">Failed Login Burst</option>
            <option value="unauthorized_access">Unauthorized API</option>
            <option value="rate_limit_exceeded">Rate Limit Exceeded</option>
            <option value="content_mutation">Content Audit</option>
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => {
              setSeverityFilter(e.target.value as any);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-[#8b1a1a]/20 text-xs text-[#2a1008] bg-[#fffaf2] outline-none"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Outcome Filter */}
          <select
            value={outcomeFilter}
            onChange={(e) => {
              setOutcomeFilter(e.target.value as any);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-[#8b1a1a]/20 text-xs text-[#2a1008] bg-[#fffaf2] outline-none"
          >
            <option value="all">All Outcomes</option>
            <option value="blocked">Blocked</option>
            <option value="denied">Denied</option>
            <option value="flagged">Flagged</option>
            <option value="allowed">Allowed</option>
          </select>

          {/* Review Status Filter */}
          <select
            value={reviewedFilter}
            onChange={(e) => {
              setReviewedFilter(e.target.value as any);
              setPage(1);
            }}
            className="px-3 py-2 rounded-xl border border-[#8b1a1a]/20 text-xs text-[#2a1008] bg-[#fffaf2] outline-none"
          >
            <option value="all">All Review Statuses</option>
            <option value="unreviewed">Unreviewed Only</option>
            <option value="reviewed">Reviewed Only</option>
          </select>
        </div>

        {/* Timeline Table */}
        <div className="rounded-2xl bg-white border border-[#8b1a1a]/15 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#faeedd] text-[#2a1008] font-bold border-b border-[#8b1a1a]/15">
                  <th className="py-3 px-4">Time (Local)</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Severity</th>
                  <th className="py-3 px-3">Endpoint / Path</th>
                  <th className="py-3 px-3">Source ID</th>
                  <th className="py-3 px-3">Outcome</th>
                  <th className="py-3 px-3">Review</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#8b1a1a]/10">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-[#7a4a35]">
                      <FiRefreshCw className="inline animate-spin text-base text-[#8b1a1a] mr-2" />
                      Loading security activity log...
                    </td>
                  </tr>
                ) : events.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#7a4a35]">
                      <FiCheckCircle className="inline text-2xl text-emerald-600 mb-2 block mx-auto" />
                      <p className="font-bold text-[#2a1008]">No events found matching current criteria</p>
                      <p className="text-xs text-[#7a4a35]/80 mt-1">Try broadening your date filter or search query.</p>
                    </td>
                  </tr>
                ) : (
                  events.map((event) => {
                    const localTime = new Date(event.created_at).toLocaleString([], {
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                      second: "2-digit",
                    });

                    return (
                      <tr
                        key={event.id}
                        className="hover:bg-[#fffaf2] transition-colors"
                      >
                        {/* Timestamp */}
                        <td className="py-3 px-4 font-mono text-[11px] text-[#7a4a35] whitespace-nowrap">
                          {localTime}
                        </td>

                        {/* Category */}
                        <td className="py-3 px-3">
                          <span className="font-semibold text-[#2a1008] block truncate max-w-[130px]" title={event.event_type}>
                            {event.event_type.replace(/_/g, " ")}
                          </span>
                        </td>

                        {/* Severity */}
                        <td className="py-3 px-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase border ${getSeverityBadge(event.severity)}`}>
                            {event.severity}
                          </span>
                        </td>

                        {/* Path */}
                        <td className="py-3 px-3 max-w-[220px]">
                          <span className="font-mono text-[11px] text-[#2a1008] truncate block" title={event.path}>
                            <span className="font-bold text-[#8b1a1a] mr-1">{event.http_method}</span>
                            {event.path}
                          </span>
                          <span className="text-[10px] text-[#7a4a35]/70 block truncate" title={event.detection_reason}>
                            {event.detection_reason}
                          </span>
                        </td>

                        {/* Source Fingerprint */}
                        <td className="py-3 px-3">
                          <span className="font-mono text-[10px] text-[#7a4a35] bg-[#fffaf2] px-1.5 py-0.5 rounded border border-[#8b1a1a]/10" title="Salted pseudonymized source fingerprint">
                            {event.source_fingerprint || "local"}
                          </span>
                        </td>

                        {/* Outcome */}
                        <td className="py-3 px-3">
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] uppercase border font-semibold ${getOutcomeBadge(event.outcome)}`}>
                            {event.outcome}
                          </span>
                        </td>

                        {/* Review Status */}
                        <td className="py-3 px-3">
                          {event.reviewed_at ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                              <FiCheck className="text-xs" /> Reviewed
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => handleMarkReviewed(event.id)}
                              disabled={reviewingId === event.id}
                              className="px-2 py-0.5 rounded text-[10px] font-bold text-[#8b1a1a] hover:bg-[#faeedd] border border-[#8b1a1a]/25 transition-colors"
                            >
                              {reviewingId === event.id ? "Saving..." : "Mark Reviewed"}
                            </button>
                          )}
                        </td>

                        {/* Details Button */}
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelectedEvent(event)}
                            className="p-1.5 rounded-lg text-[#7a4a35] hover:text-[#2a1008] hover:bg-[#faeedd] transition-colors"
                            title="Inspect complete event details"
                          >
                            <FiEye className="text-sm" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-[#faeedd]/40 border-t border-[#8b1a1a]/15 text-xs text-[#7a4a35]">
            <p>
              Showing <span className="font-bold text-[#2a1008]">{events.length}</span> of{" "}
              <span className="font-bold text-[#2a1008]">{totalEvents}</span> recorded events
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="px-3 py-1 rounded-lg bg-white border border-[#8b1a1a]/20 font-bold hover:bg-[#faeedd] disabled:opacity-40 transition-colors"
              >
                Previous
              </button>
              <span className="font-semibold text-[#2a1008]">
                Page {page} of {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="px-3 py-1 rounded-lg bg-white border border-[#8b1a1a]/20 font-bold hover:bg-[#faeedd] disabled:opacity-40 transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION E: PRIVACY & ARCHITECTURE LIMITATIONS ── */}
      <div className="p-6 rounded-2xl bg-white border border-[#8b1a1a]/15 shadow-sm space-y-3">
        <h3 className="text-sm font-bold text-[#2a1008] flex items-center gap-2 uppercase tracking-wider">
          <FiHelpCircle className="text-[#8b1a1a]" /> Architecture &amp; Privacy Retention Model
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-[#7a4a35] leading-relaxed pt-1">
          <div className="p-3.5 rounded-xl bg-[#fffaf2] border border-[#8b1a1a]/10 space-y-1">
            <p className="font-bold text-[#2a1008]">1. Privacy &amp; Hashed Identifiers</p>
            <p>
              Raw visitor IPs are never stored in plain text. Source identifiers use salted SHA-256 fingerprints alongside subnet truncation. Note that hashed IPv4 addresses remain pseudonymized data and should be restricted to security investigations.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#fffaf2] border border-[#8b1a1a]/10 space-y-1">
            <p className="font-bold text-[#2a1008]">2. Edge vs Platform Visibility</p>
            <p>
              Next.js Middleware intercepts hostile requests reaching the Vercel Edge Runtime. Requests blocked earlier at Vercel’s global CDN or DDoS layer require a Vercel Log Drain integration to appear in application logs.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-[#fffaf2] border border-[#8b1a1a]/10 space-y-1">
            <p className="font-bold text-[#2a1008]">3. 90-Day Retention Policy</p>
            <p>
              Security audit logs are retained for 90 days. The automated database routine <code className="font-mono text-[#8b1a1a]">cleanup_old_security_events(90)</code> purges historical rows to maintain low storage overhead and adhere to GDPR data minimization.
            </p>
          </div>
        </div>
      </div>

      {/* ── EVENT DETAILS MODAL ── */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl border border-[#8b1a1a]/25 shadow-2xl p-6 sm:p-8 space-y-5 animate-scaleUp max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-[#8b1a1a]/15">
              <div>
                <span className={`text-[11px] uppercase tracking-wider px-2 py-0.5 rounded border ${getSeverityBadge(selectedEvent.severity)}`}>
                  {selectedEvent.severity}
                </span>
                <h3 className="text-lg font-bold text-[#2a1008] mt-1.5 flex items-center gap-2">
                  <FiShield className="text-[#8b1a1a]" /> {selectedEvent.event_type.replace(/_/g, " ")}
                </h3>
                <p className="text-xs text-[#7a4a35] mt-0.5 font-mono">
                  ID: {selectedEvent.id}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="p-2 rounded-xl text-[#7a4a35] hover:text-[#2a1008] hover:bg-[#faeedd] transition-colors"
              >
                <FiX className="text-lg" />
              </button>
            </div>

            {/* Modal Content Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-3.5 rounded-xl bg-[#fffaf2] border border-[#8b1a1a]/10 space-y-1">
                <span className="font-bold text-[#7a4a35] uppercase text-[10px]">Timestamp</span>
                <p className="font-mono text-[#2a1008]">{new Date(selectedEvent.created_at).toUTCString()}</p>
                <p className="text-[11px] text-[#7a4a35]">Local: {new Date(selectedEvent.created_at).toLocaleString()}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#fffaf2] border border-[#8b1a1a]/10 space-y-1">
                <span className="font-bold text-[#7a4a35] uppercase text-[10px]">Security Outcome</span>
                <p className="font-bold text-[#2a1008] uppercase">{selectedEvent.outcome}</p>
                <p className="text-[11px] text-[#7a4a35]">HTTP Status: {selectedEvent.status_code || 200}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#fffaf2] border border-[#8b1a1a]/10 space-y-1 col-span-full">
                <span className="font-bold text-[#7a4a35] uppercase text-[10px]">Detection Reason</span>
                <p className="font-semibold text-rose-800">{selectedEvent.detection_reason}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#fffaf2] border border-[#8b1a1a]/10 space-y-1 col-span-full">
                <span className="font-bold text-[#7a4a35] uppercase text-[10px]">Requested Path (Sanitized)</span>
                <p className="font-mono text-[#2a1008] break-all bg-white p-2 rounded border border-[#8b1a1a]/10">
                  <span className="font-bold text-[#8b1a1a] mr-2">{selectedEvent.http_method}</span>
                  {selectedEvent.path}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#fffaf2] border border-[#8b1a1a]/10 space-y-1">
                <span className="font-bold text-[#7a4a35] uppercase text-[10px]">Source Identifier</span>
                <p className="font-mono text-[#2a1008]">{selectedEvent.source_fingerprint || "local"}</p>
                <p className="text-[10px] text-[#7a4a35]">Masked IP: {selectedEvent.source_ip_masked || "xxx.xxx.xxx.xxx"}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#fffaf2] border border-[#8b1a1a]/10 space-y-1">
                <span className="font-bold text-[#7a4a35] uppercase text-[10px]">Source System</span>
                <p className="font-semibold text-[#2a1008] capitalize">{selectedEvent.source}</p>
                <p className="font-mono text-[10px] text-[#7a4a35]">Req ID: {selectedEvent.request_id || "none"}</p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#fffaf2] border border-[#8b1a1a]/10 space-y-1 col-span-full">
                <span className="font-bold text-[#7a4a35] uppercase text-[10px]">Review Status</span>
                {selectedEvent.reviewed_at ? (
                  <p className="text-emerald-700 font-semibold">
                    Reviewed by <span className="font-mono">{selectedEvent.reviewed_by}</span> on{" "}
                    {new Date(selectedEvent.reviewed_at).toLocaleString()}
                  </p>
                ) : (
                  <p className="text-amber-700 font-semibold">Pending administrator review</p>
                )}
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#8b1a1a]/15">
              {!selectedEvent.reviewed_at && (
                <button
                  type="button"
                  onClick={() => handleMarkReviewed(selectedEvent.id)}
                  disabled={reviewingId === selectedEvent.id}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#8b1a1a] hover:bg-[#721515] text-white shadow-md shadow-[#8b1a1a]/25 transition-all"
                >
                  {reviewingId === selectedEvent.id ? "Saving..." : "Mark as Reviewed"}
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold text-[#7a4a35] hover:bg-[#faeedd] transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
