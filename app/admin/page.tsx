"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  FiLock,
  FiLogOut,
  FiFolder,
  FiAward,
  FiMessageSquare,
  FiDatabase,
  FiPlus,
  FiTrash2,
  FiEdit3,
  FiCheck,
  FiCopy,
  FiExternalLink,
  FiArrowRight,
  FiImage,
} from "react-icons/fi";
import { useTheme } from "../theme-provider";

type Project = {
  id: string;
  title: string;
  tech: string;
  desc: string;
  github?: string;
  labUrl?: string;
  logo?: string;
  emoji?: string;
};

type Certificate = {
  id: string;
  title: string;
  subtitle: string;
  issuer: string;
  year: string;
  icon: string;
  colorDark: string;
  colorLight: string;
  imageUrl?: string;
};

type Testimonial = {
  id: string;
  name: string;
  role: string;
  message: string;
  linkedin?: string;
  avatarImage?: string;
  initials: string;
  avatarColor: string;
  date: string;
  provider?: string;
};

const SQL_SCHEMA = `-- Run this in your Supabase SQL Editor:
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

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public view testimonials" ON public.testimonials FOR SELECT USING (approved = true);
CREATE POLICY "Public insert testimonials" ON public.testimonials FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full testimonials" ON public.testimonials FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public view projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Admin full projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Public view certificates" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "Admin full certificates" ON public.certificates FOR ALL USING (true) WITH CHECK (true);`;

export default function AdminPage() {
  const { dark, toggle } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState<"projects" | "certificates" | "testimonials" | "supabase">("projects");

  // Data states
  const [projects, setProjects] = useState<Project[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);

  // Forms
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [projectForm, setProjectForm] = useState<Partial<Project>>({
    title: "",
    tech: "",
    desc: "",
    github: "",
    labUrl: "",
    logo: "",
    emoji: "🚀",
  });

  const [showCertModal, setShowCertModal] = useState(false);
  const [certForm, setCertForm] = useState<Partial<Certificate>>({
    title: "",
    subtitle: "",
    issuer: "",
    year: new Date().getFullYear().toString(),
    icon: "🏅",
    colorDark: "#0ea5e9",
    colorLight: "#c9956a",
    imageUrl: "",
  });

  // Edit DP modal
  const [editingTestimonial, setEditingTestimonial] = useState<Testimonial | null>(null);
  const [avatarInput, setAvatarInput] = useState("");

  // Check existing session
  useEffect(() => {
    const saved = sessionStorage.getItem("pavan_admin_auth");
    if (saved === "true") {
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [projRes, certRes, testRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/certificates"),
        fetch("/api/testimonials"),
      ]);

      if (projRes.ok) setProjects(await projRes.json());
      if (certRes.ok) setCertificates(await certRes.json());
      if (testRes.ok) setTestimonials(await testRes.json());
    } catch (err) {
      console.error("Failed to load admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setIsAuthenticated(true);
        sessionStorage.setItem("pavan_admin_auth", "true");
      } else {
        setLoginError("Invalid password. Please check your credentials.");
      }
    } catch {
      setLoginError("Authentication request failed");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("pavan_admin_auth");
  };

  // Project actions
  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(projectForm),
      });
      if (res.ok) {
        setShowProjectModal(false);
        setProjectForm({ title: "", tech: "", desc: "", github: "", labUrl: "", logo: "", emoji: "🚀" });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm("Are you sure you want to delete this project?")) return;
    try {
      await fetch(`/api/projects?id=${id}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Certificate actions
  const handleSaveCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(certForm),
      });
      if (res.ok) {
        setShowCertModal(false);
        setCertForm({ title: "", subtitle: "", issuer: "", year: "2026", icon: "🏅", colorDark: "#0ea5e9", colorLight: "#c9956a", imageUrl: "" });
        fetchData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCertificate = async (id: string) => {
    if (!confirm("Are you sure you want to delete this certificate?")) return;
    try {
      await fetch(`/api/certificates?id=${id}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // Testimonial actions & DP editing
  const handleSaveAvatar = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTestimonial) return;
    try {
      await fetch("/api/testimonials", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: editingTestimonial.id, avatarImage: avatarInput }),
      });
      setEditingTestimonial(null);
      setAvatarInput("");
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return;
    try {
      await fetch(`/api/testimonials?id=${id}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const copySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  // ── Render Login Screen if not authenticated ──
  if (!isAuthenticated) {
    return (
      <main
        className={`min-h-screen flex items-center justify-center p-4 transition-colors duration-500 ${
          dark ? "bg-[#030712] text-white" : "bg-[#f5ede0] text-[#2a1008]"
        }`}
      >
        <div
          className={`w-full max-w-md p-8 rounded-3xl border shadow-2xl backdrop-blur-xl transition-all ${
            dark
              ? "bg-[#070d18]/90 border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
              : "bg-[#fffaf2]/95 border-[#8b1a1a]/20 shadow-[0_16px_50px_rgba(139,26,26,0.1)]"
          }`}
        >
          <div className="flex flex-col items-center text-center">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg mb-5 ${
                dark
                  ? "bg-cyan-500/15 text-cyan-300 border border-cyan-400/25"
                  : "bg-[#8b1a1a]/10 text-[#8b1a1a] border border-[#8b1a1a]/20"
              }`}
            >
              <FiLock />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">Portfolio Admin</h1>
            <p className={`mt-2 text-xs sm:text-sm ${dark ? "text-white/60" : "text-[#7a4a35]"}`}>
              Enter master password to manage projects, certificates, testimonials & database.
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div>
              <label className={`block text-xs font-semibold mb-2 ${dark ? "text-white/70" : "text-[#7a4a35]"}`}>
                Admin Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className={`w-full px-4 py-3 rounded-xl border text-sm outline-none transition-all ${
                  dark
                    ? "bg-white/[0.04] border-white/10 text-white focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/20"
                    : "bg-white border-[#8b1a1a]/20 text-[#2a1008] focus:border-[#8b1a1a] focus:ring-2 focus:ring-[#8b1a1a]/20"
                }`}
              />
            </div>

            {loginError && <p className="text-xs text-rose-500 font-medium">{loginError}</p>}

            <button
              type="submit"
              className={`w-full py-3 rounded-xl text-sm font-semibold tracking-wide transition-all duration-300 shadow-md ${
                dark
                  ? "bg-[#38bdf8] text-[#030712] hover:bg-[#7dd3fc] shadow-cyan-500/25"
                  : "bg-[#8b1a1a] text-white hover:bg-[#721515] shadow-[#8b1a1a]/25"
              }`}
            >
              Unlock Dashboard
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-dashed flex items-center justify-between text-xs">
            <Link
              href="/"
              className={`inline-flex items-center gap-1.5 transition-colors ${
                dark ? "text-white/50 hover:text-cyan-300" : "text-[#7a4a35] hover:text-[#8b1a1a]"
              }`}
            >
              ← Back to portfolio
            </Link>
            <button
              type="button"
              onClick={toggle}
              className={`p-2 rounded-lg border text-sm ${
                dark ? "border-white/10 bg-white/5" : "border-[#8b1a1a]/15 bg-[#faeedd]"
              }`}
            >
              {dark ? "☀️" : "🌙"}
            </button>
          </div>
        </div>
      </main>
    );
  }

  // ── Render Authenticated Dashboard ──
  return (
    <main
      className={`min-h-screen transition-colors duration-500 ${
        dark ? "bg-[#030712] text-white" : "bg-[#f5ede0] text-[#2a1008]"
      }`}
    >
      {/* Top Admin Navigation Header */}
      <header
        className={`sticky top-0 z-40 border-b backdrop-blur-xl ${
          dark ? "bg-[#030712]/80 border-white/[0.08]" : "bg-[#f5ede0]/90 border-[#8b1a1a]/15"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="font-bold text-lg tracking-tight">
              PAVAN<span className={dark ? "text-cyan-400" : "text-[#8b1a1a]"}>.</span>
            </Link>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                dark ? "bg-cyan-500/15 text-cyan-300 border border-cyan-400/25" : "bg-[#8b1a1a]/10 text-[#8b1a1a]"
              }`}
            >
              Admin Center
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggle}
              className={`w-9 h-9 rounded-full flex items-center justify-center border text-sm transition-all ${
                dark
                  ? "border-white/15 bg-white/5 text-white hover:border-cyan-400/50"
                  : "border-[#8b1a1a]/20 bg-[#faeedd] text-[#8b1a1a] hover:border-[#8b1a1a]/45"
              }`}
            >
              {dark ? "☀️" : "🌙"}
            </button>

            <Link
              href="/engineering-lab"
              target="_blank"
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                dark ? "border-white/10 text-white/70 hover:text-white" : "border-[#8b1a1a]/20 text-[#7a4a35]"
              }`}
            >
              Engineering Lab <FiExternalLink className="text-[10px]" />
            </Link>

            <Link
              href="/"
              target="_blank"
              className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                dark ? "border-white/10 text-white/70 hover:text-white" : "border-[#8b1a1a]/20 text-[#7a4a35]"
              }`}
            >
              Main Site <FiExternalLink className="text-[10px]" />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-500 hover:bg-rose-500/10 transition-colors`}
            >
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-8 sm:py-12">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-hide border-b border-white/[0.08]">
          <button
            type="button"
            onClick={() => setActiveTab("projects")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "projects"
                ? dark
                  ? "bg-[#38bdf8] text-[#030712] shadow-md shadow-cyan-500/20"
                  : "bg-[#8b1a1a] text-white shadow-md shadow-[#8b1a1a]/20"
                : dark
                ? "text-white/60 hover:text-white hover:bg-white/5"
                : "text-[#7a4a35] hover:text-[#2a1008] hover:bg-[#8b1a1a]/5"
            }`}
          >
            <FiFolder /> Projects ({projects.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("certificates")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "certificates"
                ? dark
                  ? "bg-[#38bdf8] text-[#030712] shadow-md shadow-cyan-500/20"
                  : "bg-[#8b1a1a] text-white shadow-md shadow-[#8b1a1a]/20"
                : dark
                ? "text-white/60 hover:text-white hover:bg-white/5"
                : "text-[#7a4a35] hover:text-[#2a1008] hover:bg-[#8b1a1a]/5"
            }`}
          >
            <FiAward /> Certificates ({certificates.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("testimonials")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "testimonials"
                ? dark
                  ? "bg-[#38bdf8] text-[#030712] shadow-md shadow-cyan-500/20"
                  : "bg-[#8b1a1a] text-white shadow-md shadow-[#8b1a1a]/20"
                : dark
                ? "text-white/60 hover:text-white hover:bg-white/5"
                : "text-[#7a4a35] hover:text-[#2a1008] hover:bg-[#8b1a1a]/5"
            }`}
          >
            <FiMessageSquare /> Testimonials & DPs ({testimonials.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("supabase")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              activeTab === "supabase"
                ? dark
                  ? "bg-[#38bdf8] text-[#030712] shadow-md shadow-cyan-500/20"
                  : "bg-[#8b1a1a] text-white shadow-md shadow-[#8b1a1a]/20"
                : dark
                ? "text-white/60 hover:text-white hover:bg-white/5"
                : "text-[#7a4a35] hover:text-[#2a1008] hover:bg-[#8b1a1a]/5"
            }`}
          >
            <FiDatabase /> Supabase Setup & SQL
          </button>
        </div>

        {/* ── TAB 1: PROJECTS ── */}
        {activeTab === "projects" && (
          <section className="mt-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Portfolio Projects</h2>
                <p className={`text-xs sm:text-sm ${dark ? "text-white/60" : "text-[#7a4a35]"}`}>
                  Add, update, or remove projects shown on your main portfolio & Engineering Lab.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowProjectModal(true)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  dark
                    ? "bg-[#38bdf8] text-[#030712] hover:bg-[#7dd3fc] shadow-md shadow-cyan-500/25"
                    : "bg-[#8b1a1a] text-white hover:bg-[#721515] shadow-md shadow-[#8b1a1a]/25"
                }`}
              >
                <FiPlus /> Add Project
              </button>
            </div>

            <div className="grid gap-4">
              {projects.map((proj) => (
                <div
                  key={proj.id || proj.title}
                  className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                    dark ? "bg-[#070d18] border-white/10" : "bg-[#fbf5ea] border-[#8b1a1a]/15 shadow-sm"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <span className="text-3xl shrink-0 p-2 rounded-xl bg-white/5">{proj.emoji || "🚀"}</span>
                    <div>
                      <h3 className="font-bold text-base sm:text-lg">{proj.title}</h3>
                      <p className={`text-xs font-medium mt-0.5 ${dark ? "text-cyan-300" : "text-[#8b1a1a]"}`}>
                        {proj.tech}
                      </p>
                      <p className={`text-xs mt-1.5 max-w-2xl line-clamp-2 ${dark ? "text-white/60" : "text-[#7a4a35]"}`}>
                        {proj.desc}
                      </p>
                      <div className="flex items-center gap-3 mt-3 text-[11px]">
                        {proj.github && (
                          <a
                            href={proj.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline opacity-70 hover:opacity-100"
                          >
                            GitHub Link
                          </a>
                        )}
                        {proj.labUrl && (
                          <Link href={proj.labUrl} target="_blank" className="underline opacity-70 hover:opacity-100">
                            Engineering Lab Demo
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      type="button"
                      onClick={() => proj.id && handleDeleteProject(proj.id)}
                      className="p-2 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="Delete project"
                    >
                      <FiTrash2 />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── TAB 2: CERTIFICATES ── */}
        {activeTab === "certificates" && (
          <section className="mt-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Certificates & Credentials</h2>
                <p className={`text-xs sm:text-sm ${dark ? "text-white/60" : "text-[#7a4a35]"}`}>
                  Manage the certifications, issuing bodies, years, and certificate images shown on your portfolio.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCertModal(true)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                  dark
                    ? "bg-[#38bdf8] text-[#030712] hover:bg-[#7dd3fc] shadow-md shadow-cyan-500/25"
                    : "bg-[#8b1a1a] text-white hover:bg-[#721515] shadow-md shadow-[#8b1a1a]/25"
                }`}
              >
                <FiPlus /> Add Certificate
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {certificates.map((cert) => (
                <div
                  key={cert.id}
                  className={`p-5 rounded-2xl border flex flex-col justify-between transition-all ${
                    dark ? "bg-[#070d18] border-white/10" : "bg-[#fbf5ea] border-[#8b1a1a]/15 shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl p-2 rounded-xl bg-white/5">{cert.icon || "🏅"}</span>
                      <div>
                        <h3 className="font-bold text-base">{cert.title}</h3>
                        <p className={`text-xs ${dark ? "text-white/50" : "text-[#7a4a35]"}`}>{cert.issuer} · {cert.year}</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteCertificate(cert.id)}
                      className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                      title="Delete certificate"
                    >
                      <FiTrash2 />
                    </button>
                  </div>

                  <p className={`text-xs mt-3 ${dark ? "text-white/60" : "text-[#7a4a35]"}`}>{cert.subtitle}</p>

                  {cert.imageUrl && (
                    <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center gap-2 text-xs opacity-75">
                      <FiImage /> Image: <span className="truncate max-w-[200px]">{cert.imageUrl}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ── TAB 3: TESTIMONIALS & DP MANAGEMENT ── */}
        {activeTab === "testimonials" && (
          <section className="mt-8">
            <div className="mb-6">
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Testimonials & Profile Pictures</h2>
              <p className={`text-xs sm:text-sm ${dark ? "text-white/60" : "text-[#7a4a35]"}`}>
                Manage community testimonials, review submitted feedback, and edit user profile pictures (DP).
              </p>
            </div>

            {testimonials.length === 0 ? (
              <p className={`text-sm py-12 text-center ${dark ? "text-white/40" : "text-[#7a4a35]/60"}`}>
                No testimonials found yet. As visitors sign in with Google or submit, they will appear here.
              </p>
            ) : (
              <div className="grid gap-4">
                {testimonials.map((t) => (
                  <div
                    key={t.id}
                    className={`p-5 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${
                      dark ? "bg-[#070d18] border-white/10" : "bg-[#fbf5ea] border-[#8b1a1a]/15 shadow-sm"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* Avatar / DP Preview */}
                      <div className="relative shrink-0">
                        {t.avatarImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={t.avatarImage}
                            alt={t.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-cyan-400/40 shadow-sm"
                          />
                        ) : (
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-sm"
                            style={{ backgroundColor: t.avatarColor || "#0A66C2" }}
                          >
                            {t.initials}
                          </div>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm sm:text-base">{t.name}</h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${dark ? "bg-white/10 text-white/60" : "bg-[#8b1a1a]/10 text-[#8b1a1a]"}`}>
                            {t.provider || "User"}
                          </span>
                        </div>
                        <p className={`text-xs font-medium ${dark ? "text-cyan-300" : "text-[#8b1a1a]"}`}>{t.role}</p>
                        <p className={`text-xs mt-2 max-w-2xl ${dark ? "text-white/70" : "text-[#7a4a35]"}`}>
                          &ldquo;{t.message}&rdquo;
                        </p>
                        <p className={`text-[10px] mt-2 opacity-50`}>{t.date}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTestimonial(t);
                          setAvatarInput(t.avatarImage || "");
                        }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                          dark ? "border-white/15 bg-white/5 hover:border-cyan-400" : "border-[#8b1a1a]/20 bg-[#faeedd] text-[#8b1a1a]"
                        }`}
                      >
                        <FiEdit3 /> Manage DP
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteTestimonial(t.id)}
                        className="p-2 rounded-lg text-rose-500 hover:bg-rose-500/10 transition-colors"
                        title="Delete testimonial"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── TAB 4: SUPABASE SETUP & SQL ── */}
        {activeTab === "supabase" && (
          <section className="mt-8 max-w-4xl space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Supabase Setup & SQL Schema</h2>
              <p className={`text-xs sm:text-sm mt-1 ${dark ? "text-white/60" : "text-[#7a4a35]"}`}>
                Run this SQL script in your Supabase project to enable persistent cross-device testimonials, projects, and certificates.
              </p>
            </div>

            <div
              className={`p-6 rounded-2xl border ${
                dark ? "bg-[#070d18] border-white/10" : "bg-[#fbf5ea] border-[#8b1a1a]/15 shadow-sm"
              }`}
            >
              <h3 className="text-sm font-bold flex items-center gap-2 mb-4">
                <FiDatabase className={dark ? "text-cyan-400" : "text-[#8b1a1a]"} /> How to connect your Supabase database:
              </h3>
              <ol className={`space-y-3 text-xs sm:text-sm list-decimal list-inside leading-relaxed ${dark ? "text-white/75" : "text-[#7a4a35]"}`}>
                <li>Create a free account or open your project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline font-semibold">supabase.com</a>.</li>
                <li>Go to the <strong>SQL Editor</strong> tab on the left sidebar in your Supabase dashboard.</li>
                <li>Click <strong>New Query</strong>, paste the SQL script below, and click <strong>Run</strong>.</li>
                <li>Go to <strong>Project Settings &gt; API</strong>, copy your <strong>Project URL</strong> and <strong>anon key</strong> (and service role key).</li>
                <li>Add them to your Vercel Environment Variables:
                  <div className="mt-2 font-mono text-xs p-3 rounded-xl bg-black/40 text-emerald-400 overflow-x-auto space-y-1">
                    <div>NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co</div>
                    <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...</div>
                    <div>SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...</div>
                  </div>
                </li>
              </ol>
            </div>

            {/* SQL Copy Box */}
            <div className="relative rounded-2xl overflow-hidden border border-white/10">
              <div className="flex items-center justify-between px-4 py-2.5 bg-black/60 border-b border-white/10 text-xs font-mono">
                <span>supabase-schema.sql</span>
                <button
                  type="button"
                  onClick={copySql}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-sans text-xs transition-colors"
                >
                  {copiedSql ? (
                    <>
                      <FiCheck className="text-emerald-400" /> Copied!
                    </>
                  ) : (
                    <>
                      <FiCopy /> Copy SQL
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 bg-black/80 text-xs font-mono text-slate-300 overflow-x-auto max-h-[420px] leading-relaxed">
                {SQL_SCHEMA}
              </pre>
            </div>
          </section>
        )}
      </div>

      {/* ── MODAL: ADD PROJECT ── */}
      <AnimatePresence>
        {showProjectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-lg p-6 sm:p-8 rounded-3xl border shadow-2xl max-h-[90vh] overflow-y-auto ${
                dark ? "bg-[#0c1424] border-white/15 text-white" : "bg-[#fffaf2] border-[#8b1a1a]/20 text-[#2a1008]"
              }`}
            >
              <h2 className="text-xl font-bold">Add New Project</h2>
              <p className={`text-xs mt-1 ${dark ? "text-white/60" : "text-[#7a4a35]"}`}>
                This will appear in your main portfolio projects list and database.
              </p>

              <form onSubmit={handleSaveProject} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Project Title *</label>
                  <input
                    type="text"
                    required
                    value={projectForm.title}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    placeholder="e.g. AI Flood Relief Portal"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm outline-none ${
                      dark ? "bg-white/5 border-white/10 text-white" : "bg-white border-[#8b1a1a]/20 text-[#2a1008]"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Tech Stack *</label>
                  <input
                    type="text"
                    required
                    value={projectForm.tech}
                    onChange={(e) => setProjectForm({ ...projectForm, tech: e.target.value })}
                    placeholder="e.g. React 18 · Vite · Tailwind · Supabase"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm outline-none ${
                      dark ? "bg-white/5 border-white/10 text-white" : "bg-white border-[#8b1a1a]/20 text-[#2a1008]"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Description *</label>
                  <textarea
                    required
                    rows={3}
                    value={projectForm.desc}
                    onChange={(e) => setProjectForm({ ...projectForm, desc: e.target.value })}
                    placeholder="Brief description of the build, algorithms, impact..."
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm outline-none ${
                      dark ? "bg-white/5 border-white/10 text-white" : "bg-white border-[#8b1a1a]/20 text-[#2a1008]"
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Emoji Icon</label>
                    <input
                      type="text"
                      value={projectForm.emoji}
                      onChange={(e) => setProjectForm({ ...projectForm, emoji: e.target.value })}
                      placeholder="e.g. 🌊"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm outline-none ${
                        dark ? "bg-white/5 border-white/10 text-white" : "bg-white border-[#8b1a1a]/20 text-[#2a1008]"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Image / Logo URL</label>
                    <input
                      type="text"
                      value={projectForm.logo}
                      onChange={(e) => setProjectForm({ ...projectForm, logo: e.target.value })}
                      placeholder="e.g. /projects/atlas/cover.png"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm outline-none ${
                        dark ? "bg-white/5 border-white/10 text-white" : "bg-white border-[#8b1a1a]/20 text-[#2a1008]"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">GitHub URL</label>
                  <input
                    type="text"
                    value={projectForm.github}
                    onChange={(e) => setProjectForm({ ...projectForm, github: e.target.value })}
                    placeholder="https://github.com/..."
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm outline-none ${
                      dark ? "bg-white/5 border-white/10 text-white" : "bg-white border-[#8b1a1a]/20 text-[#2a1008]"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Engineering Lab URL / Live Demo</label>
                  <input
                    type="text"
                    value={projectForm.labUrl}
                    onChange={(e) => setProjectForm({ ...projectForm, labUrl: e.target.value })}
                    placeholder="e.g. /engineering-lab/sankat-saathi"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm outline-none ${
                      dark ? "bg-white/5 border-white/10 text-white" : "bg-white border-[#8b1a1a]/20 text-[#2a1008]"
                    }`}
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowProjectModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium opacity-70 hover:opacity-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
                      dark ? "bg-[#38bdf8] text-[#030712] hover:bg-[#7dd3fc]" : "bg-[#8b1a1a] text-white hover:bg-[#721515]"
                    }`}
                  >
                    Save Project
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: ADD CERTIFICATE ── */}
      <AnimatePresence>
        {showCertModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-lg p-6 sm:p-8 rounded-3xl border shadow-2xl max-h-[90vh] overflow-y-auto ${
                dark ? "bg-[#0c1424] border-white/15 text-white" : "bg-[#fffaf2] border-[#8b1a1a]/20 text-[#2a1008]"
              }`}
            >
              <h2 className="text-xl font-bold">Add Certificate</h2>
              <p className={`text-xs mt-1 ${dark ? "text-white/60" : "text-[#7a4a35]"}`}>
                Add a new verified certificate to your portfolio credentials section.
              </p>

              <form onSubmit={handleSaveCertificate} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Certificate Title *</label>
                  <input
                    type="text"
                    required
                    value={certForm.title}
                    onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
                    placeholder="e.g. Azure Fundamentals"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm outline-none ${
                      dark ? "bg-white/5 border-white/10 text-white" : "bg-white border-[#8b1a1a]/20 text-[#2a1008]"
                    }`}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Subtitle / Skills</label>
                  <input
                    type="text"
                    value={certForm.subtitle}
                    onChange={(e) => setCertForm({ ...certForm, subtitle: e.target.value })}
                    placeholder="e.g. Cloud Architecture · Security"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm outline-none ${
                      dark ? "bg-white/5 border-white/10 text-white" : "bg-white border-[#8b1a1a]/20 text-[#2a1008]"
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Issuer *</label>
                    <input
                      type="text"
                      required
                      value={certForm.issuer}
                      onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                      placeholder="e.g. Microsoft"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm outline-none ${
                        dark ? "bg-white/5 border-white/10 text-white" : "bg-white border-[#8b1a1a]/20 text-[#2a1008]"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Year *</label>
                    <input
                      type="text"
                      required
                      value={certForm.year}
                      onChange={(e) => setCertForm({ ...certForm, year: e.target.value })}
                      placeholder="e.g. 2026"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm outline-none ${
                        dark ? "bg-white/5 border-white/10 text-white" : "bg-white border-[#8b1a1a]/20 text-[#2a1008]"
                      }`}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">Certificate Image URL</label>
                  <input
                    type="text"
                    value={certForm.imageUrl}
                    onChange={(e) => setCertForm({ ...certForm, imageUrl: e.target.value })}
                    placeholder="e.g. /certificates/az1.jpeg or https://..."
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm outline-none ${
                      dark ? "bg-white/5 border-white/10 text-white" : "bg-white border-[#8b1a1a]/20 text-[#2a1008]"
                    }`}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold mb-1">Icon / Emoji</label>
                    <input
                      type="text"
                      value={certForm.icon}
                      onChange={(e) => setCertForm({ ...certForm, icon: e.target.value })}
                      placeholder="🏅"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm outline-none ${
                        dark ? "bg-white/5 border-white/10 text-white" : "bg-white border-[#8b1a1a]/20 text-[#2a1008]"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Dark Accent Color</label>
                    <input
                      type="text"
                      value={certForm.colorDark}
                      onChange={(e) => setCertForm({ ...certForm, colorDark: e.target.value })}
                      placeholder="#0ea5e9"
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm outline-none ${
                        dark ? "bg-white/5 border-white/10 text-white" : "bg-white border-[#8b1a1a]/20 text-[#2a1008]"
                      }`}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowCertModal(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium opacity-70 hover:opacity-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
                      dark ? "bg-[#38bdf8] text-[#030712] hover:bg-[#7dd3fc]" : "bg-[#8b1a1a] text-white hover:bg-[#721515]"
                    }`}
                  >
                    Save Certificate
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: MANAGE TESTIMONIAL DP ── */}
      <AnimatePresence>
        {editingTestimonial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className={`w-full max-w-md p-6 sm:p-8 rounded-3xl border shadow-2xl ${
                dark ? "bg-[#0c1424] border-white/15 text-white" : "bg-[#fffaf2] border-[#8b1a1a]/20 text-[#2a1008]"
              }`}
            >
              <h2 className="text-xl font-bold">Manage Profile Picture (DP)</h2>
              <p className={`text-xs mt-1 ${dark ? "text-white/60" : "text-[#7a4a35]"}`}>
                Update avatar image for {editingTestimonial.name}.
              </p>

              <div className="flex justify-center my-6">
                {avatarInput ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarInput}
                    alt="Preview"
                    className="w-20 h-20 rounded-full object-cover border-4 border-cyan-400/40 shadow-xl"
                  />
                ) : (
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center font-bold text-white text-xl shadow-xl"
                    style={{ backgroundColor: editingTestimonial.avatarColor || "#0A66C2" }}
                  >
                    {editingTestimonial.initials}
                  </div>
                )}
              </div>

              <form onSubmit={handleSaveAvatar} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold mb-1">Avatar Image URL</label>
                  <input
                    type="url"
                    value={avatarInput}
                    onChange={(e) => setAvatarInput(e.target.value)}
                    placeholder="https://example.com/photo.jpg or LinkedIn photo URL"
                    className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm outline-none ${
                      dark ? "bg-white/5 border-white/10 text-white" : "bg-white border-[#8b1a1a]/20 text-[#2a1008]"
                    }`}
                  />
                  <p className="text-[11px] opacity-60 mt-1">Paste any direct image URL (Google, LinkedIn, GitHub, or CDN).</p>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setEditingTestimonial(null)}
                    className="px-4 py-2 rounded-xl text-xs font-medium opacity-70 hover:opacity-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className={`px-5 py-2 rounded-xl text-xs font-semibold transition-all ${
                      dark ? "bg-[#38bdf8] text-[#030712] hover:bg-[#7dd3fc]" : "bg-[#8b1a1a] text-white hover:bg-[#721515]"
                    }`}
                  >
                    Update DP
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </main>
  );
}
