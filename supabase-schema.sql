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

-- 2. PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    tech TEXT NOT NULL,
    description TEXT NOT NULL,
    github TEXT,
    lab_url TEXT,
    logo TEXT,
    emoji TEXT DEFAULT '🚀',
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. CERTIFICATES TABLE
CREATE TABLE IF NOT EXISTS public.certificates (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    subtitle TEXT,
    issuer TEXT NOT NULL,
    year TEXT NOT NULL,
    icon TEXT DEFAULT '🏅',
    color_dark TEXT DEFAULT '#0ea5e9',
    color_light TEXT DEFAULT '#c9956a',
    image_url TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Public can view testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Public can submit testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Service role full access testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Public can view projects" ON public.projects;
DROP POLICY IF EXISTS "Service role full access projects" ON public.projects;
DROP POLICY IF EXISTS "Public can view certificates" ON public.certificates;
DROP POLICY IF EXISTS "Service role full access certificates" ON public.certificates;

-- Testimonials policies
CREATE POLICY "Public can view testimonials" ON public.testimonials
    FOR SELECT USING (approved = true);

CREATE POLICY "Public can submit testimonials" ON public.testimonials
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Service role full access testimonials" ON public.testimonials
    FOR ALL USING (true) WITH CHECK (true);

-- Projects policies
CREATE POLICY "Public can view projects" ON public.projects
    FOR SELECT USING (true);

CREATE POLICY "Service role full access projects" ON public.projects
    FOR ALL USING (true) WITH CHECK (true);

-- Certificates policies
CREATE POLICY "Public can view certificates" ON public.certificates
    FOR SELECT USING (true);

CREATE POLICY "Service role full access certificates" ON public.certificates
    FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- INITIAL SEED DATA
-- Populate existing portfolio projects and certificates
-- ==============================================================================

INSERT INTO public.projects (id, title, tech, description, github, lab_url, logo, emoji, order_index)
VALUES
    ('sankat-saathi', 'Sankat Saathi (संकट साथी)', 'React 18 · Vite · Tailwind · Supabase · IBM Z · Haversine AI', 'AI-powered humanitarian flood relief platform that optimizes emergency citizen SOS requests, explains urgency scores, and coordinates warehouse supply dispatches.', 'https://github.com/pavankumareng29/Sankat-Saathi-IBM-Z-Datathon-2026-Project', '/engineering-lab/sankat-saathi', '/projects/sankat-saathi/banner.jpg', '🌊', 1),
    ('atlas', 'Atlas Life OS', 'React · Vite · Tailwind · Framer Motion · Supabase · PWA', 'Personal life operating system featuring an intelligent college attendance & bunk margin simulator, CGPA planner, Pomodoro focus engine, and cognitive AI morning brief.', 'https://github.com/pavan55kumar/atlas', '/engineering-lab/atlas', '/projects/atlas/cover.png', '🧭', 2),
    ('portfolio-3d', 'Project Orbital (3D Portfolio)', 'Next.js · React · Three.js · React Three Fiber · Drei · NextAuth', 'Modern personal portfolio with interactive 3D WebGL hero sphere, LinkedIn OAuth testimonials, and dedicated Engineering Lab deep-dives.', 'https://github.com/pavan55kumar/projectportfolio', '/engineering-lab/portfolio-3d', '/projects/portfolio-3d/cover.png', '✨', 3),
    ('spam-detection', 'Spam Detection', 'Python · scikit-learn · NLTK · SpaCy · Streamlit · Transformers', 'Python ML app that detects spam messages using NLP pipelines and HuggingFace Transformers.', 'https://github.com/pavan55kumar/E-mail-Spam-Detection', '', '', '🛡️', 4),
    ('note-saver', 'Note Saver App', 'Python · Flask · Jinja2 · HTML · CSS · JavaScript', 'A simple Flask web app with Python backend and dynamic HTML/CSS/JS frontend using Jinja2 templates.', 'https://github.com/pavan55kumar/FLASK-note-saver', '', '', '📝', 5)
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    tech = EXCLUDED.tech,
    description = EXCLUDED.description,
    github = EXCLUDED.github,
    lab_url = EXCLUDED.lab_url,
    logo = EXCLUDED.logo,
    emoji = EXCLUDED.emoji;

INSERT INTO public.certificates (id, title, subtitle, issuer, year, icon, color_dark, color_light, image_url, order_index)
VALUES
    ('microsoft-azure', 'Microsoft Certificates', 'Azure Fundamentals · AI Essentials · Cloud Basics', 'Microsoft', '2024', '🏅', '#0ea5e9', '#c9956a', '/certificates/az1.jpeg', 1),
    ('cert-2', 'IBM Z Datathon 2026', 'Systems & Cloud Architecture', 'IBM', '2026', '🏆', '#f59e0b', '#d97706', '', 2)
ON CONFLICT (id) DO NOTHING;
