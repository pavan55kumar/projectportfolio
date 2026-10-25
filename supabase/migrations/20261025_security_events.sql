-- ==============================================================================
-- Migration: 20261025_security_events.sql
-- Dedicated Security Events Table with Strict Row Level Security
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.security_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    event_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    source TEXT NOT NULL CHECK (source IN ('application', 'middleware', 'edge', 'audit', 'vercel')),
    http_method TEXT DEFAULT 'GET',
    path TEXT NOT NULL,
    status_code INTEGER DEFAULT 200,
    source_fingerprint TEXT,
    source_ip_masked TEXT,
    request_id TEXT,
    detection_reason TEXT NOT NULL,
    outcome TEXT NOT NULL CHECK (outcome IN ('blocked', 'flagged', 'allowed', 'denied', 'logged')),
    details JSONB DEFAULT '{}'::jsonb,
    reviewed_at TIMESTAMPTZ,
    reviewed_by TEXT
);

-- Optimization indexes for high-volume time-range queries & filtering
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON public.security_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON public.security_events (severity);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON public.security_events (event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_reviewed ON public.security_events (reviewed_at);
CREATE INDEX IF NOT EXISTS idx_security_events_fingerprint ON public.security_events (source_fingerprint);

-- ==============================================================================
-- STRICT ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- Anonymous visitors and authenticated public users MUST NEVER be able to read,
-- insert, modify, or delete security events.
-- Only the trusted server-side Service Role (bypassing or authorized via RLS)
-- can manage security logs.

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public access denied security_events" ON public.security_events;
DROP POLICY IF EXISTS "Service role full access security_events" ON public.security_events;

-- Service role policy for verified backend operations
CREATE POLICY "Service role full access security_events"
    ON public.security_events
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Explicitly revoke public access
REVOKE ALL ON public.security_events FROM anon, authenticated;

-- ==============================================================================
-- AUTOMATED LOG RETENTION & CLEANUP FUNCTION
-- Keeps database lean by removing security logs older than configurable days (default 90)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.cleanup_old_security_events(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM public.security_events
    WHERE created_at < NOW() - (days_to_keep || ' days')::INTERVAL;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$;
