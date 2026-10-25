-- ==============================================================================
-- Supabase Schema for Pavan Kumar Portfolio
-- Run this entire script in your Supabase project's SQL Editor (Dashboard > SQL Editor)
-- ==============================================================================

-- 1. TESTIMONIALS TABLE
CREATE TABLE IF NOT EXISTS public.testimonials (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    message TEXT NOT NULL,
    linkedin TEXT,
    avatar_image TEXT,
    initials TEXT,
    avatar_color TEXT DEFAULT '#0A66C2',
    date TEXT,
    provider TEXT DEFAULT 'google',
    approved BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. MAIN PORTFOLIO PROJECTS TABLE
-- Stores projects displayed on the main portfolio page.
-- The "logo" field stores the dedicated image for the main portfolio card.
-- NOTE: Main portfolio project images are independent and NOT connected to Engineering Lab images.
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    tech TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT DEFAULT 'Personal',
    github TEXT,
    lab_url TEXT,
    live_url TEXT,
    logo TEXT,
    emoji TEXT DEFAULT '🚀',
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add live_url and category columns if table already existed without them
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS live_url TEXT;
ALTER TABLE public.projects ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Personal';

-- 3. ENGINEERING LAB PROJECTS TABLE
-- Stores deep-dive project stories, architecture, and live preview settings.
-- "cover_image" is used for the Engineering Lab card carousel.
-- "banner_image" is used for the Explore Project deep-dive page (/engineering-lab/[slug]).
-- These images are connected to each other, but strictly separate from the main portfolio's "logo".
CREATE TABLE IF NOT EXISTS public.engineering_projects (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    icon TEXT DEFAULT 'portfolio',
    status TEXT,
    category TEXT,
    cover_image TEXT,
    banner_image TEXT,
    overview TEXT,
    problem TEXT,
    solution TEXT,
    intended_for TEXT,
    role TEXT,
    duration TEXT,
    technologies JSONB DEFAULT '[]'::jsonb,
    features JSONB DEFAULT '[]'::jsonb,
    contributions JSONB DEFAULT '[]'::jsonb,
    architecture TEXT,
    challenges TEXT,
    additional_details TEXT,
    github_url TEXT,
    live_url TEXT,
    live_demo_url TEXT,
    team JSONB DEFAULT '[]'::jsonb,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PROFILE TABLE
CREATE TABLE IF NOT EXISTS public.profile (
    id TEXT PRIMARY KEY DEFAULT 'default',
    hero_desc TEXT NOT NULL,
    about_desc TEXT NOT NULL,
    hero_role TEXT DEFAULT 'Full-Stack Developer & AI Enthusiast',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure hero_role column exists if table was created previously without it
ALTER TABLE public.profile ADD COLUMN IF NOT EXISTS hero_role TEXT DEFAULT 'Full-Stack Developer & AI Enthusiast';

-- 5. SKILLS TABLE
CREATE TABLE IF NOT EXISTS public.skills (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    icon_key TEXT,
    icon_url TEXT,
    category TEXT DEFAULT 'Frontend',
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. EDUCATION TABLE
CREATE TABLE IF NOT EXISTS public.education (
    id TEXT PRIMARY KEY,
    level_tag TEXT NOT NULL,
    degree TEXT NOT NULL,
    institution TEXT NOT NULL,
    period TEXT NOT NULL,
    status TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. EXPERIENCE TABLE
CREATE TABLE IF NOT EXISTS public.experience (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL,
    company TEXT NOT NULL,
    period TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. CERTIFICATES TABLE
CREATE TABLE IF NOT EXISTS public.certificates (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    issuer TEXT NOT NULL,
    year TEXT NOT NULL,
    icon TEXT DEFAULT '🏅',
    category TEXT DEFAULT 'Course Certificate',
    color_dark TEXT DEFAULT '#0ea5e9',
    color_light TEXT DEFAULT '#c9956a',
    image_url TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add category and images columns if table already existed without them
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'Course Certificate';
ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.engineering_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Public can view testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Public can submit testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Service role full access testimonials" ON public.testimonials;

DROP POLICY IF EXISTS "Public can view projects" ON public.projects;
DROP POLICY IF EXISTS "Service role full access projects" ON public.projects;

DROP POLICY IF EXISTS "Public view engineering projects" ON public.engineering_projects;
DROP POLICY IF EXISTS "Admin full engineering projects" ON public.engineering_projects;

DROP POLICY IF EXISTS "Public view profile" ON public.profile;
DROP POLICY IF EXISTS "Admin full profile" ON public.profile;

DROP POLICY IF EXISTS "Public view skills" ON public.skills;
DROP POLICY IF EXISTS "Admin full skills" ON public.skills;

DROP POLICY IF EXISTS "Public view education" ON public.education;
DROP POLICY IF EXISTS "Admin full education" ON public.education;

DROP POLICY IF EXISTS "Public view experience" ON public.experience;
DROP POLICY IF EXISTS "Admin full experience" ON public.experience;

DROP POLICY IF EXISTS "Public can view certificates" ON public.certificates;
DROP POLICY IF EXISTS "Service role full access certificates" ON public.certificates;

-- Testimonials policies
CREATE POLICY "Public can view testimonials" ON public.testimonials FOR SELECT USING (approved = true);
CREATE POLICY "Public can submit testimonials" ON public.testimonials FOR INSERT WITH CHECK (true);
CREATE POLICY "Service role full access testimonials" ON public.testimonials FOR ALL USING (true) WITH CHECK (true);

-- Projects policies (Main Portfolio)
CREATE POLICY "Public can view projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Service role full access projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);

-- Engineering Projects policies (Engineering Lab)
CREATE POLICY "Public view engineering projects" ON public.engineering_projects FOR SELECT USING (true);
CREATE POLICY "Admin full engineering projects" ON public.engineering_projects FOR ALL USING (true) WITH CHECK (true);

-- Profile policies
CREATE POLICY "Public view profile" ON public.profile FOR SELECT USING (true);
CREATE POLICY "Admin full profile" ON public.profile FOR ALL USING (true) WITH CHECK (true);

-- Skills policies
CREATE POLICY "Public view skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Admin full skills" ON public.skills FOR ALL USING (true) WITH CHECK (true);

-- Education policies
CREATE POLICY "Public view education" ON public.education FOR SELECT USING (true);
CREATE POLICY "Admin full education" ON public.education FOR ALL USING (true) WITH CHECK (true);

-- Experience policies
CREATE POLICY "Public view experience" ON public.experience FOR SELECT USING (true);
CREATE POLICY "Admin full experience" ON public.experience FOR ALL USING (true) WITH CHECK (true);

-- Certificates policies
CREATE POLICY "Public can view certificates" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "Service role full access certificates" ON public.certificates FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- INITIAL SEED DATA
-- ==============================================================================

-- 1. Main Portfolio Projects (Images stored in 'logo')
INSERT INTO public.projects (id, title, tech, description, github, lab_url, live_url, logo, emoji, order_index)
VALUES
    ('sankat-saathi', 'Sankat Saathi (संकट साथी)', 'React 18 · Vite · Tailwind · Supabase · IBM Z · Haversine AI', 'AI-powered humanitarian flood relief platform that optimizes emergency citizen SOS requests, explains urgency scores, and coordinates warehouse supply dispatches.', 'https://github.com/pavankumareng29/Sankat-Saathi-IBM-Z-Datathon-2026-Project', '/engineering-lab/sankat-saathi', 'http://148.100.108.115', '/projects/sankat-saathi/banner.jpg', '🌊', 1),
    ('atlas', 'Atlas Life OS', 'React · Vite · Tailwind · Framer Motion · Supabase · PWA', 'Personal life operating system featuring an intelligent college attendance & bunk margin simulator, CGPA planner, Pomodoro focus engine, and cognitive AI morning brief.', 'https://github.com/pavan55kumar/atlas', '/engineering-lab/atlas', '', '/projects/atlas/cover.png', '🧭', 2),
    ('portfolio-3d', 'Project Orbital (3D Portfolio)', 'Next.js · React · Three.js · React Three Fiber · Drei · NextAuth', 'Modern personal portfolio with interactive 3D WebGL hero sphere, LinkedIn OAuth testimonials, and dedicated Engineering Lab deep-dives.', 'https://github.com/pavan55kumar/projectportfolio', '/engineering-lab/portfolio-3d', 'https://projectportfolio-one.vercel.app', '/projects/portfolio-3d/cover.png', '✨', 3),
    ('spam-detection', 'Spam Detection', 'Python · scikit-learn · NLTK · SpaCy · Streamlit · Transformers', 'Python ML app that detects spam messages using NLP pipelines and HuggingFace Transformers.', 'https://github.com/pavan55kumar/E-mail-Spam-Detection', '', '', '', '🛡️', 4),
    ('note-saver', 'Note Saver App', 'Python · Flask · Jinja2 · HTML · CSS · JavaScript', 'A simple Flask web app with Python backend and dynamic HTML/CSS/JS frontend using Jinja2 templates.', 'https://github.com/pavan55kumar/FLASK-note-saver', '', '', '', '📝', 5)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    tech = EXCLUDED.tech,
    description = EXCLUDED.description,
    github = EXCLUDED.github,
    lab_url = EXCLUDED.lab_url,
    live_url = EXCLUDED.live_url,
    logo = EXCLUDED.logo,
    emoji = EXCLUDED.emoji;

-- 2. Engineering Lab Projects (Images stored in 'cover_image' and 'banner_image')
INSERT INTO public.engineering_projects (id, slug, title, description, icon, status, category, cover_image, banner_image, overview, problem, solution, github_url, live_url, order_index)
VALUES
    ('sankat-saathi', 'sankat-saathi', 'Sankat Saathi', 'AI-Powered Flood Relief & Humanitarian Supply Allocation Platform built for the IBM Z Datathon 2026.', 'relief', 'IBM Z Datathon Project', 'AI & Disaster Logistics', '/projects/sankat-saathi/banner.jpg', '/projects/sankat-saathi/cover.png', 'Sankat Saathi (संकट साथी) is an AI-powered disaster management and humanitarian logistics platform engineered for flood-prone regions.', 'During catastrophic flood events, emergency helplines are overwhelmed with duplicate SOS calls and supply dispatches are delayed.', 'An end-to-end humanitarian platform combining automated GPS geocoding, explainable AI urgency scoring, and Haversine distance calculations.', 'https://github.com/pavankumareng29/Sankat-Saathi-IBM-Z-Datathon-2026-Project', 'http://148.100.108.115', 1),
    ('atlas', 'atlas', 'Atlas Life OS', 'Comprehensive life, academic, and wellness operating system engineered for students and builders.', 'compass', 'Active PWA', 'Systems & Productivity', '/projects/atlas/cover.png', '/projects/atlas/banner.png', 'Atlas is a personal life operating system combining academic margin forecasting, habit tracking, and cognitive morning briefings.', 'Students juggle disjointed apps for attendance, timetables, and productivity without unified predictive analytics.', 'A single-pane PWA with integrated Bunk Margin Simulator, CGPA Planner, and Pomodoro focus engine.', 'https://github.com/pavan55kumar/atlas', '', 2),
    ('portfolio-3d', 'portfolio-3d', 'Project Orbital (3D Portfolio)', 'Modern personal portfolio with interactive 3D WebGL hero sphere, LinkedIn OAuth testimonials, and dedicated Engineering Lab deep-dives.', 'portfolio', 'In Production', '3D Graphics & WebGL', '/projects/portfolio-3d/cover.png', '/projects/portfolio-3d/cover.png', 'An interactive personal engineering space combining WebGL 3D vertex distortion, real-time particle simulations, and dynamic admin content management.', 'Standard developer portfolios often look static and lack technical depth into architecture and real engineering decisions.', 'Created an experiential WebGL hero sphere paired with dedicated engineering deep-dives and live deployment previews.', 'https://github.com/pavan55kumar/projectportfolio', 'https://projectportfolio-one.vercel.app', 3)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    cover_image = EXCLUDED.cover_image,
    banner_image = EXCLUDED.banner_image,
    github_url = EXCLUDED.github_url,
    live_url = EXCLUDED.live_url;

-- ==============================================================================
-- 9. SECURITY EVENTS TABLE & POLICIES (Analytics & Security Dashboard)
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

CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON public.security_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON public.security_events (severity);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON public.security_events (event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_reviewed ON public.security_events (reviewed_at);

ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Service role full access security_events" ON public.security_events;
CREATE POLICY "Service role full access security_events" ON public.security_events FOR ALL TO service_role USING (true) WITH CHECK (true);
REVOKE ALL ON public.security_events FROM anon, authenticated;

