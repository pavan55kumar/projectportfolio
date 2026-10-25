import { UmamiAnalyticsResponse, UmamiMetricItem } from "./types";

/**
 * Checks whether Umami credentials are fully configured.
 */
export function isUmamiConfigured(): boolean {
  const websiteId = process.env.UMAMI_WEBSITE_ID || process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID;
  return Boolean(websiteId);
}

/**
 * Normalizes host URL to avoid double slashes.
 */
function getUmamiHost(): string {
  const raw = process.env.UMAMI_HOST_URL || "https://api.umami.is";
  return raw.replace(/\/+$/, "");
}

/**
 * Returns server-side headers for Umami API requests.
 */
function getUmamiHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const apiKey = process.env.UMAMI_API_KEY;
  if (apiKey) {
    headers["x-umami-api-key"] = apiKey;
    headers["Authorization"] = `Bearer ${apiKey}`;
  }

  return headers;
}

/**
 * Converts date range into startAt and endAt timestamps in milliseconds.
 */
function getRangeTimestamps(timeRange: "24h" | "7d" | "30d" = "7d"): {
  startAt: number;
  endAt: number;
} {
  const now = Date.now();
  const rangeMap = {
    "24h": 24 * 3600 * 1000,
    "7d": 7 * 24 * 3600 * 1000,
    "30d": 30 * 24 * 3600 * 1000,
  };
  return {
    startAt: now - rangeMap[timeRange],
    endAt: now,
  };
}

/**
 * Fetches real analytics metrics from Umami API.
 * Never fabricates data; returns disconnected state if credentials are not configured.
 */
const DEFAULT_WEBSITE_ID = "97da7dd6-c82f-469b-a02a-20201b4df044";

export async function fetchUmamiAnalytics(
  timeRange: "24h" | "7d" | "30d" = "7d"
): Promise<UmamiAnalyticsResponse> {
  const websiteId =
    process.env.UMAMI_WEBSITE_ID ||
    process.env.NEXT_PUBLIC_UMAMI_WEBSITE_ID ||
    DEFAULT_WEBSITE_ID;
  const host = getUmamiHost();
  const apiKey = process.env.UMAMI_API_KEY;

  if (!apiKey) {
    return {
      connected: false,
      websiteId,
      hostUrl: host,
      message:
        "Tracking script is active and recording visitors. To stream charts directly into this admin panel, add UMAMI_API_KEY from your Umami Cloud settings into Vercel.",
    };
  }

  const { startAt, endAt } = getRangeTimestamps(timeRange);
  const headers = getUmamiHeaders();

  try {
    const baseParams = `startAt=${startAt}&endAt=${endAt}`;

    // Parallel fetch of stats and metric breakdowns
    const [
      statsRes,
      pageviewsRes,
      urlsRes,
      refRes,
      devRes,
      browserRes,
      osRes,
      geoRes,
      eventsRes,
    ] = await Promise.allSettled([
      fetch(`${host}/v1/websites/${websiteId}/stats?${baseParams}`, { headers, next: { revalidate: 60 } }),
      fetch(`${host}/v1/websites/${websiteId}/pageviews?${baseParams}&unit=${timeRange === "24h" ? "hour" : "day"}`, { headers, next: { revalidate: 60 } }),
      fetch(`${host}/v1/websites/${websiteId}/metrics?${baseParams}&type=url`, { headers, next: { revalidate: 60 } }),
      fetch(`${host}/v1/websites/${websiteId}/metrics?${baseParams}&type=referrer`, { headers, next: { revalidate: 60 } }),
      fetch(`${host}/v1/websites/${websiteId}/metrics?${baseParams}&type=device`, { headers, next: { revalidate: 60 } }),
      fetch(`${host}/v1/websites/${websiteId}/metrics?${baseParams}&type=browser`, { headers, next: { revalidate: 60 } }),
      fetch(`${host}/v1/websites/${websiteId}/metrics?${baseParams}&type=os`, { headers, next: { revalidate: 60 } }),
      fetch(`${host}/v1/websites/${websiteId}/metrics?${baseParams}&type=country`, { headers, next: { revalidate: 60 } }),
      fetch(`${host}/v1/websites/${websiteId}/metrics?${baseParams}&type=event`, { headers, next: { revalidate: 60 } }),
    ]);

    // Parse stats
    let stats = {
      pageviews: { value: 0 },
      visitors: { value: 0 },
      visits: { value: 0 },
      bounces: { value: 0 },
      totaltime: { value: 0 },
    };

    if (statsRes.status === "fulfilled" && statsRes.value.ok) {
      const data = await statsRes.value.json();
      stats = {
        pageviews: data.pageviews || { value: 0 },
        visitors: data.visitors || { value: 0 },
        visits: data.visits || { value: 0 },
        bounces: data.bounces || { value: 0 },
        totaltime: data.totaltime || { value: 0 },
      };
    } else if (statsRes.status === "fulfilled" && statsRes.value.status === 401) {
      return {
        connected: false,
        websiteId,
        hostUrl: host,
        message:
          "Umami returned 401 Unauthorized. Ensure UMAMI_API_KEY is correctly set with API read permissions.",
      };
    }

    // Parse pageviews series
    let pageviewsSeries: Array<{ x: string; y: number }> = [];
    if (pageviewsRes.status === "fulfilled" && pageviewsRes.value.ok) {
      const data = await pageviewsRes.value.json();
      if (Array.isArray(data.pageviews)) {
        pageviewsSeries = data.pageviews;
      }
    }

    // Helper for metric lists
    const parseMetrics = async (res: PromiseSettledResult<Response>): Promise<UmamiMetricItem[]> => {
      if (res.status === "fulfilled" && res.value.ok) {
        try {
          const list = await res.value.json();
          if (Array.isArray(list)) {
            return list.map((item) => ({
              x: String(item.x || item.name || item.url || "unknown"),
              y: Number(item.y || item.count || 0),
            }));
          }
        } catch {}
      }
      return [];
    };

    const topPages = await parseMetrics(urlsRes);
    const referrers = await parseMetrics(refRes);
    const devices = await parseMetrics(devRes);
    const browsers = await parseMetrics(browserRes);
    const os = await parseMetrics(osRes);
    const countries = await parseMetrics(geoRes);
    const customEvents = await parseMetrics(eventsRes);

    // Filter project specific views from top pages
    const topProjects = topPages
      .filter((p) => p.x.includes("/engineering-lab/") || p.x.includes("#projects"))
      .map((p) => ({
        x: p.x.replace("/engineering-lab/", "").replace("#projects", "Main Showcase"),
        y: p.y,
      }));

    return {
      connected: true,
      websiteId,
      hostUrl: host,
      stats,
      pageviewsSeries,
      topPages,
      topProjects,
      referrers,
      devices,
      browsers,
      os,
      countries,
      customEvents,
    };
  } catch (err) {
    console.warn("Umami fetch failed:", err);
    return {
      connected: false,
      websiteId,
      hostUrl: host,
      message: `Failed to connect to Umami API: ${(err as Error).message}`,
    };
  }
}
