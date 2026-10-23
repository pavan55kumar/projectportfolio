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
  FiImage,
  FiUpload,
  FiX,
  FiRefreshCw,
  FiEye,
  FiUser,
  FiBriefcase,
  FiCalendar,
} from "react-icons/fi";
import { FaGraduationCap } from "react-icons/fa";

const cn = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(" ");

function parseCertificateImages(imageUrl?: unknown, images?: unknown): string[] {
  if (Array.isArray(images) && images.length > 0) {
    return images.map((s) => String(s).trim()).filter(Boolean);
  }
  if (Array.isArray(imageUrl) && imageUrl.length > 0) {
    return imageUrl.map((s) => String(s).trim()).filter(Boolean);
  }
  if (typeof images === "string" && images.trim().startsWith("[")) {
    try {
      const parsed = JSON.parse(images.trim());
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((s) => String(s).trim()).filter(Boolean);
      }
    } catch {}
  }
  if (typeof imageUrl === "string" && imageUrl.trim()) {
    const trimmed = imageUrl.trim();
    if (trimmed.startsWith("[")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((s) => String(s).trim()).filter(Boolean);
        }
      } catch {}
    }
    if (trimmed.startsWith("data:")) {
      return [trimmed];
    }
    if (trimmed.includes(",")) {
      return trimmed
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [trimmed];
  }
  return [];
}

type SiteProfile = {
  id: string;
  heroDesc: string;
  aboutMeDesc: string;
  heroRole?: string;
  updatedAt?: string;
};

type EducationItem = {
  id: string;
  levelTag: string;
  degree: string;
  institution: string;
  period: string;
  status?: string;
  orderIndex?: number;
};

type ExperienceItem = {
  id: string;
  role: string;
  company: string;
  period: string;
  description?: string;
  orderIndex?: number;
};

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
  images?: string[];
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

// Client-side image compression to lightweight data URL for seamless storage & fast display
async function compressImage(
  file: File,
  maxWidth = 1000,
  maxHeight = 900,
  quality = 0.82
): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new window.Image();
      img.src = event.target?.result as string;
      img.onload = () => {
        let { width, height } = img;
        if (width > maxWidth || height > maxHeight) {
          if (width > height) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          } else {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(event.target?.result as string);
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        resolve(dataUrl);
      };
      img.onerror = (err) => reject(err);
    };
    reader.onerror = (err) => reject(err);
  });
}

// Reusable Image & Device Album Picker component
function ImageInputWithUpload({
  label,
  value,
  onChange,
  placeholder,
  maxDimension = 1000,
  isCircular = false,
}: {
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  maxDimension?: number;
  isCircular?: boolean;
}) {
  const [loading, setLoading] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const dataUrl = await compressImage(file, maxDimension, maxDimension);
      onChange(dataUrl);
    } catch (err) {
      console.error("Failed to process photo:", err);
      alert("Could not load image from device. Please try another file.");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-bold text-[#2a1008] uppercase tracking-wider">
        {label}
      </label>

      {value ? (
        <div className="relative inline-flex items-center gap-3 p-2.5 rounded-2xl border border-[#8b1a1a]/20 bg-white shadow-sm">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={value}
            alt="Preview"
            className={`${
              isCircular ? "h-16 w-16 rounded-full" : "h-16 w-20 rounded-xl"
            } object-cover border border-[#8b1a1a]/15 bg-[#fffaf2] shrink-0`}
          />
          <div className="flex-1 min-w-0 pr-6">
            <p className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
              <FiCheck /> Image attached
            </p>
            <p className="text-[11px] text-[#7a4a35]/70 truncate max-w-[220px]">
              {value.startsWith("data:") ? "Uploaded from device" : value}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onChange("")}
            className="absolute top-2 right-2 text-rose-500 hover:text-rose-700 p-1 rounded-md hover:bg-rose-50 transition-colors"
            title="Remove image"
          >
            <FiTrash2 className="text-xs" />
          </button>
        </div>
      ) : null}

      <div className="flex flex-col sm:flex-row gap-2">
        <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#8b1a1a]/25 bg-[#faeedd] hover:bg-[#f3dfcb] text-[#8b1a1a] text-xs font-semibold transition-all shrink-0 shadow-sm active:scale-95">
          <FiUpload className="text-sm" />
          <span>{loading ? "Processing photo..." : "Upload from Device / Album"}</span>
          <input
            type="file"
            accept="image/*"
            className="hidden"
            disabled={loading}
            onChange={handleFile}
          />
        </label>

        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 w-full px-3.5 py-2.5 rounded-xl border border-[#8b1a1a]/20 bg-white text-xs sm:text-sm text-[#2a1008] outline-none focus:border-[#8b1a1a] focus:ring-2 focus:ring-[#8b1a1a]/15 transition-all"
        />
      </div>
    </div>
  );
}

// Multi-Certificate Images / Pages manager & device uploader
function MultiCertificateImagesInput({
  images,
  onChange,
}: {
  images: string[];
  onChange: (imgs: string[]) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [urlInput, setUrlInput] = useState("");

  const handleFiles = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setLoading(true);
    try {
      const newImages: string[] = [];
      for (const file of files) {
        const dataUrl = await compressImage(file, 1200, 1200, 0.85);
        newImages.push(dataUrl);
      }
      onChange([...images, ...newImages]);
    } catch (err) {
      console.error("Failed to process certificate images:", err);
      alert("Could not load some images from device.");
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  };

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    onChange([...images, urlInput.trim()]);
    setUrlInput("");
  };

  const handleRemove = (index: number) => {
    onChange(images.filter((_, idx) => idx !== index));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-[#2a1008] uppercase tracking-wider">
          Certificate Images / Pages ({images.length})
        </label>
        <span className="text-[11px] text-[#7a4a35]">
          Upload 1 or more certificate images (front & back, or multiple certificates)
        </span>
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 rounded-2xl border border-[#8b1a1a]/15 bg-white">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="relative group rounded-xl overflow-hidden border border-[#8b1a1a]/20 bg-[#fffaf2] aspect-[4/3] flex items-center justify-center shadow-xs"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={`Page ${idx + 1}`}
                className="w-full h-full object-contain p-1"
              />
              <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/70 text-[10px] font-bold text-white tracking-wide">
                #{idx + 1}
              </span>
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                className="absolute top-1.5 right-1.5 w-6 h-6 rounded-lg bg-rose-500/90 text-white flex items-center justify-center opacity-85 hover:opacity-100 hover:bg-rose-600 transition-all shadow-sm"
                title="Remove page"
              >
                <FiX className="text-xs" />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <label className="cursor-pointer inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-[#8b1a1a]/25 bg-[#faeedd] hover:bg-[#f3dfcb] text-[#8b1a1a] text-xs font-semibold transition-all shrink-0 shadow-sm active:scale-95">
          <FiUpload className="text-sm" />
          <span>{loading ? "Processing photos..." : "Add from Device / Album"}</span>
          <input
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            disabled={loading}
            onChange={handleFiles}
          />
        </label>

        <div className="flex-1 flex gap-2">
          <input
            type="text"
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="Or paste image URL (e.g. /certificates/az1.jpeg)"
            className="flex-1 w-full px-3.5 py-2.5 rounded-xl border border-[#8b1a1a]/20 bg-white text-xs sm:text-sm text-[#2a1008] outline-none focus:border-[#8b1a1a] focus:ring-2 focus:ring-[#8b1a1a]/15 transition-all"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleAddUrl();
              }
            }}
          />
          <button
            type="button"
            onClick={handleAddUrl}
            disabled={!urlInput.trim()}
            className="px-4 py-2.5 rounded-xl border border-[#8b1a1a]/25 bg-white hover:bg-[#faeedd] text-[#8b1a1a] text-xs font-bold transition-all disabled:opacity-40"
          >
            Add
          </button>
        </div>
      </div>
    </div>
  );
}

const SQL_SCHEMA = `-- Run this in your Supabase SQL Editor:
-- 1. Profile / Bio Table
CREATE TABLE IF NOT EXISTS public.profile (
    id TEXT PRIMARY KEY DEFAULT 'default',
    hero_desc TEXT NOT NULL,
    about_desc TEXT NOT NULL,
    hero_role TEXT DEFAULT 'Full-Stack Developer & AI Enthusiast',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Education Timeline Table
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

-- 3. Experience Table
CREATE TABLE IF NOT EXISTS public.experience (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL,
    company TEXT NOT NULL,
    period TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Testimonials Table
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

-- 5. Projects Table
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

-- 6. Certificates Table
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
    images JSONB DEFAULT '[]'::jsonb,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public view profile" ON public.profile;
DROP POLICY IF EXISTS "Admin full profile" ON public.profile;
CREATE POLICY "Public view profile" ON public.profile FOR SELECT USING (true);
CREATE POLICY "Admin full profile" ON public.profile FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public view education" ON public.education;
DROP POLICY IF EXISTS "Admin full education" ON public.education;
CREATE POLICY "Public view education" ON public.education FOR SELECT USING (true);
CREATE POLICY "Admin full education" ON public.education FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public view experience" ON public.experience;
DROP POLICY IF EXISTS "Admin full experience" ON public.experience;
CREATE POLICY "Public view experience" ON public.experience FOR SELECT USING (true);
CREATE POLICY "Admin full experience" ON public.experience FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public view testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Public insert testimonials" ON public.testimonials;
DROP POLICY IF EXISTS "Admin full testimonials" ON public.testimonials;
CREATE POLICY "Public view testimonials" ON public.testimonials FOR SELECT USING (approved = true);
CREATE POLICY "Public insert testimonials" ON public.testimonials FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin full testimonials" ON public.testimonials FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public view projects" ON public.projects;
DROP POLICY IF EXISTS "Admin full projects" ON public.projects;
CREATE POLICY "Public view projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Admin full projects" ON public.projects FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public view certificates" ON public.certificates;
DROP POLICY IF EXISTS "Admin full certificates" ON public.certificates;
CREATE POLICY "Public view certificates" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "Admin full certificates" ON public.certificates FOR ALL USING (true) WITH CHECK (true);`;

const SQL_MIGRATION_NEW_TABLES = `-- Copy & Paste this into Supabase SQL Editor to create Profile, Education, and Experience tables:
CREATE TABLE IF NOT EXISTS public.profile (
    id TEXT PRIMARY KEY DEFAULT 'default',
    hero_desc TEXT NOT NULL,
    about_desc TEXT NOT NULL,
    hero_role TEXT DEFAULT 'Full-Stack Developer & AI Enthusiast',
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

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

CREATE TABLE IF NOT EXISTS public.experience (
    id TEXT PRIMARY KEY,
    role TEXT NOT NULL,
    company TEXT NOT NULL,
    period TEXT NOT NULL,
    description TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profile ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experience ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public view profile" ON public.profile;
DROP POLICY IF EXISTS "Admin full profile" ON public.profile;
CREATE POLICY "Public view profile" ON public.profile FOR SELECT USING (true);
CREATE POLICY "Admin full profile" ON public.profile FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public view education" ON public.education;
DROP POLICY IF EXISTS "Admin full education" ON public.education;
CREATE POLICY "Public view education" ON public.education FOR SELECT USING (true);
CREATE POLICY "Admin full education" ON public.education FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public view experience" ON public.experience;
DROP POLICY IF EXISTS "Admin full experience" ON public.experience;
CREATE POLICY "Public view experience" ON public.experience FOR SELECT USING (true);
CREATE POLICY "Admin full experience" ON public.experience FOR ALL USING (true) WITH CHECK (true);`;

export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState("");
  const [activeTab, setActiveTab] = useState<
    "profile" | "education" | "experience" | "projects" | "certificates" | "testimonials" | "supabase"
  >("profile");

  // Profile state
  const [profile, setProfile] = useState<SiteProfile>({
    id: "default",
    heroDesc:
      "2nd-year B.Tech student at NMAMIT, exploring web development, AI, and interactive projects that push the boundaries of what's possible.",
    aboutMeDesc:
      "I am a 2nd-year B.Tech student in Information Science and Engineering at N.M.A.M Institute of Technology, Nitte. Passionate about web development, 3D visuals, and interactive UI design. Skilled in C, Python, HTML, CSS, and React; I enjoy building websites and experimenting with AI-powered tools and creative prompts.",
    heroRole: "Full-Stack Developer & AI Enthusiast",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSavedToast, setProfileSavedToast] = useState(false);

  // Education state
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [showEduModal, setShowEduModal] = useState(false);
  const [editingEdu, setEditingEdu] = useState<EducationItem | null>(null);
  const [eduForm, setEduForm] = useState<Partial<EducationItem>>({
    levelTag: "B.TECH",
    degree: "",
    institution: "",
    period: "",
    status: "In Progress",
    orderIndex: 0,
  });

  // Experience state
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [showExpModal, setShowExpModal] = useState(false);
  const [editingExp, setEditingExp] = useState<ExperienceItem | null>(null);
  const [expForm, setExpForm] = useState<Partial<ExperienceItem>>({
    role: "",
    company: "",
    period: "",
    description: "",
    orderIndex: 0,
  });

  // Existing Data states
  const [projects, setProjects] = useState<Project[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedMigration, setCopiedMigration] = useState(false);
  const [copiedNewMigration, setCopiedNewMigration] = useState(false);

  // Project modal state (handles both Add and Edit)
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [projectForm, setProjectForm] = useState<Partial<Project>>({
    title: "",
    tech: "",
    desc: "",
    github: "",
    labUrl: "",
    logo: "",
    emoji: "🚀",
  });

  // Certificate modal state (handles both Add and Edit)
  const [showCertModal, setShowCertModal] = useState(false);
  const [editingCert, setEditingCert] = useState<Certificate | null>(null);
  const [certForm, setCertForm] = useState<Partial<Certificate>>({
    title: "",
    subtitle: "",
    issuer: "",
    year: new Date().getFullYear().toString(),
    icon: "🏅",
    colorDark: "#0ea5e9",
    colorLight: "#c9956a",
    imageUrl: "",
    images: [],
  });

  // Admin In-Page Certificate Viewer Modal
  const [adminCertViewer, setAdminCertViewer] = useState<{
    isOpen: boolean;
    title: string;
    issuer: string;
    year: string;
    images: string[];
    currentIndex: number;
  } | null>(null);

  // Testimonial DP modal
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
      const [projRes, certRes, testRes, profRes, eduRes, expRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/certificates"),
        fetch("/api/testimonials"),
        fetch("/api/profile"),
        fetch("/api/education"),
        fetch("/api/experience"),
      ]);

      if (projRes.ok) setProjects(await projRes.json());
      if (certRes.ok) setCertificates(await certRes.json());
      if (testRes.ok) setTestimonials(await testRes.json());
      if (profRes.ok) {
        const p = await profRes.json();
        if (p && p.heroDesc) setProfile(p);
      }
      if (eduRes.ok) setEducation(await eduRes.json());
      if (expRes.ok) setExperience(await expRes.json());
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

  // ── Profile Actions ──
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      if (res.ok) {
        const updated = await res.json();
        setProfile(updated);
        setProfileSavedToast(true);
        setTimeout(() => setProfileSavedToast(false), 3000);
      } else {
        alert("Failed to save profile. Please check console.");
      }
    } catch (err) {
      console.error("Failed to save profile:", err);
      alert("Error saving profile");
    } finally {
      setSavingProfile(false);
    }
  };

  // ── Education Actions ──
  const openAddEducation = () => {
    setEditingEdu(null);
    setEduForm({
      levelTag: "B.TECH",
      degree: "",
      institution: "",
      period: "",
      status: "In Progress",
      orderIndex: education.length + 1,
    });
    setShowEduModal(true);
  };

  const openEditEducation = (item: EducationItem) => {
    setEditingEdu(item);
    setEduForm({
      levelTag: item.levelTag,
      degree: item.degree,
      institution: item.institution,
      period: item.period,
      status: item.status || "",
      orderIndex: item.orderIndex ?? 0,
    });
    setShowEduModal(true);
  };

  const handleSaveEducation = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingEdu) {
        const res = await fetch("/api/education", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingEdu.id, ...eduForm }),
        });
        if (res.ok) {
          setShowEduModal(false);
          setEditingEdu(null);
          fetchData();
        }
      } else {
        const res = await fetch("/api/education", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eduForm),
        });
        if (res.ok) {
          setShowEduModal(false);
          fetchData();
        }
      }
    } catch (err) {
      console.error("Failed to save education:", err);
    }
  };

  const handleDeleteEducation = async (id: string) => {
    if (!confirm("Are you sure you want to delete this education entry?")) return;
    try {
      await fetch(`/api/education?id=${id}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // ── Experience Actions ──
  const openAddExperience = () => {
    setEditingExp(null);
    setExpForm({
      role: "",
      company: "",
      period: "",
      description: "",
      orderIndex: experience.length + 1,
    });
    setShowExpModal(true);
  };

  const openEditExperience = (item: ExperienceItem) => {
    setEditingExp(item);
    setExpForm({
      role: item.role,
      company: item.company,
      period: item.period,
      description: item.description || "",
      orderIndex: item.orderIndex ?? 0,
    });
    setShowExpModal(true);
  };

  const handleSaveExperience = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingExp) {
        const res = await fetch("/api/experience", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingExp.id, ...expForm }),
        });
        if (res.ok) {
          setShowExpModal(false);
          setEditingExp(null);
          fetchData();
        }
      } else {
        const res = await fetch("/api/experience", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(expForm),
        });
        if (res.ok) {
          setShowExpModal(false);
          fetchData();
        }
      }
    } catch (err) {
      console.error("Failed to save experience:", err);
    }
  };

  const handleDeleteExperience = async (id: string) => {
    if (!confirm("Are you sure you want to delete this experience entry?")) return;
    try {
      await fetch(`/api/experience?id=${id}`, { method: "DELETE" });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  // ── Project Actions ──
  const openAddProject = () => {
    setEditingProject(null);
    setProjectForm({
      title: "",
      tech: "",
      desc: "",
      github: "",
      labUrl: "",
      logo: "",
      emoji: "🚀",
    });
    setShowProjectModal(true);
  };

  const openEditProject = (proj: Project) => {
    setEditingProject(proj);
    setProjectForm({
      title: proj.title,
      tech: proj.tech,
      desc: proj.desc,
      github: proj.github || "",
      labUrl: proj.labUrl || "",
      logo: proj.logo || "",
      emoji: proj.emoji || "🚀",
    });
    setShowProjectModal(true);
  };

  const handleSaveProject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingProject) {
        // Update existing project
        const res = await fetch("/api/projects", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingProject.id, ...projectForm }),
        });
        if (res.ok) {
          setShowProjectModal(false);
          setEditingProject(null);
          fetchData();
        }
      } else {
        // Add new project
        const res = await fetch("/api/projects", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(projectForm),
        });
        if (res.ok) {
          setShowProjectModal(false);
          fetchData();
        }
      }
    } catch (err) {
      console.error("Failed to save project:", err);
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

  // ── Certificate Actions ──
  const openAddCert = () => {
    setEditingCert(null);
    setCertForm({
      title: "",
      subtitle: "",
      issuer: "",
      year: new Date().getFullYear().toString(),
      icon: "🏅",
      colorDark: "#0ea5e9",
      colorLight: "#c9956a",
      imageUrl: "",
      images: [],
    });
    setShowCertModal(true);
  };

  const openEditCert = (cert: Certificate) => {
    setEditingCert(cert);
    const imgs = parseCertificateImages(cert.imageUrl, cert.images);
    setCertForm({
      title: cert.title,
      subtitle: cert.subtitle || "",
      issuer: cert.issuer,
      year: cert.year,
      icon: cert.icon || "🏅",
      colorDark: cert.colorDark || "#0ea5e9",
      colorLight: cert.colorLight || "#c9956a",
      imageUrl: cert.imageUrl || (imgs[0] || ""),
      images: imgs,
    });
    setShowCertModal(true);
  };

  const handleSaveCertificate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const imgs = certForm.images || [];
      const payload = {
        ...certForm,
        imageUrl: imgs[0] || (imgs.length > 0 ? JSON.stringify(imgs) : certForm.imageUrl || ""),
        images: imgs,
      };
      if (editingCert) {
        // Update existing certificate
        const res = await fetch("/api/certificates", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: editingCert.id, ...payload }),
        });
        if (res.ok) {
          setShowCertModal(false);
          setEditingCert(null);
          fetchData();
        }
      } else {
        // Add new certificate
        const res = await fetch("/api/certificates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          setShowCertModal(false);
          fetchData();
        }
      }
    } catch (err) {
      console.error("Failed to save certificate:", err);
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

  // ── Testimonial Actions & DP Editing ──
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

  // ── Render Login Screen if not authenticated (Light Theme Only) ──
  if (!isAuthenticated) {
    return (
      <main className="min-h-screen flex items-center justify-center p-4 bg-[#f5ede0] text-[#2a1008]">
        <div className="w-full max-w-md p-8 sm:p-10 rounded-3xl border border-[#8b1a1a]/20 bg-[#fffaf2] shadow-[0_16px_50px_rgba(139,26,26,0.1)]">
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-md mb-5 bg-[#8b1a1a]/10 text-[#8b1a1a] border border-[#8b1a1a]/20">
              <FiLock />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#2a1008]">Portfolio Admin</h1>
            <p className="mt-2 text-xs sm:text-sm text-[#7a4a35]">
              Enter master password to manage projects, certificates, testimonials & database.
            </p>
          </div>

          <form onSubmit={handleLogin} className="mt-8 space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 text-[#7a4a35]">
                Admin Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                className="w-full px-4 py-3 rounded-xl border border-[#8b1a1a]/20 bg-white text-[#2a1008] text-sm outline-none focus:border-[#8b1a1a] focus:ring-2 focus:ring-[#8b1a1a]/15 transition-all"
              />
            </div>

            {loginError && <p className="text-xs text-rose-600 font-semibold">{loginError}</p>}

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl text-sm font-semibold tracking-wide bg-[#8b1a1a] hover:bg-[#721515] text-white shadow-md shadow-[#8b1a1a]/25 transition-all duration-200 active:scale-[0.99]"
            >
              Unlock Dashboard
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#8b1a1a]/15 flex items-center justify-center text-xs">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-[#7a4a35] hover:text-[#8b1a1a] font-medium transition-colors"
            >
              ← Back to portfolio
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── Render Authenticated Dashboard (Light Theme Only) ──
  return (
    <main className="min-h-screen bg-[#f7f2ea] text-[#2a1008] pb-16">
      {/* Top Admin Navigation Header */}
      <header className="sticky top-0 z-40 border-b border-[#8b1a1a]/15 bg-[#fffaf2]/95 backdrop-blur-md shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="font-extrabold text-lg sm:text-xl tracking-tight text-[#2a1008]">
              PAVAN<span className="text-[#8b1a1a]">.</span>
            </Link>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#8b1a1a]/10 text-[#8b1a1a] border border-[#8b1a1a]/20">
              Admin Center
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <button
              type="button"
              onClick={fetchData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#8b1a1a]/20 bg-white text-[#7a4a35] hover:text-[#8b1a1a] text-xs font-semibold shadow-xs transition-colors"
              title="Refresh data"
            >
              <FiRefreshCw className={loading ? "animate-spin" : ""} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <Link
              href="/engineering-lab"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#8b1a1a]/20 bg-white text-[#7a4a35] hover:text-[#8b1a1a] text-xs font-semibold shadow-xs transition-colors"
            >
              Engineering Lab <FiExternalLink className="text-[10px]" />
            </Link>

            <Link
              href="/"
              target="_blank"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#8b1a1a]/20 bg-white text-[#7a4a35] hover:text-[#8b1a1a] text-xs font-semibold shadow-xs transition-colors"
            >
              Main Site <FiExternalLink className="text-[10px]" />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
            >
              <FiLogOut /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-6 sm:py-10">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-hide border-b border-[#8b1a1a]/15">
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs shrink-0 ${
              activeTab === "profile"
                ? "bg-[#8b1a1a] text-white shadow-md shadow-[#8b1a1a]/20"
                : "text-[#7a4a35] hover:text-[#2a1008] hover:bg-[#8b1a1a]/8 bg-white/60 border border-[#8b1a1a]/10"
            }`}
          >
            <FiUser /> Bio &amp; About Me
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("education")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs shrink-0 ${
              activeTab === "education"
                ? "bg-[#8b1a1a] text-white shadow-md shadow-[#8b1a1a]/20"
                : "text-[#7a4a35] hover:text-[#2a1008] hover:bg-[#8b1a1a]/8 bg-white/60 border border-[#8b1a1a]/10"
            }`}
          >
            <FaGraduationCap /> Education ({education.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("experience")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs shrink-0 ${
              activeTab === "experience"
                ? "bg-[#8b1a1a] text-white shadow-md shadow-[#8b1a1a]/20"
                : "text-[#7a4a35] hover:text-[#2a1008] hover:bg-[#8b1a1a]/8 bg-white/60 border border-[#8b1a1a]/10"
            }`}
          >
            <FiBriefcase /> Experience ({experience.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("projects")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs shrink-0 ${
              activeTab === "projects"
                ? "bg-[#8b1a1a] text-white shadow-md shadow-[#8b1a1a]/20"
                : "text-[#7a4a35] hover:text-[#2a1008] hover:bg-[#8b1a1a]/8 bg-white/60 border border-[#8b1a1a]/10"
            }`}
          >
            <FiFolder /> Projects ({projects.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("certificates")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs shrink-0 ${
              activeTab === "certificates"
                ? "bg-[#8b1a1a] text-white shadow-md shadow-[#8b1a1a]/20"
                : "text-[#7a4a35] hover:text-[#2a1008] hover:bg-[#8b1a1a]/8 bg-white/60 border border-[#8b1a1a]/10"
            }`}
          >
            <FiAward /> Certificates ({certificates.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("testimonials")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs shrink-0 ${
              activeTab === "testimonials"
                ? "bg-[#8b1a1a] text-white shadow-md shadow-[#8b1a1a]/20"
                : "text-[#7a4a35] hover:text-[#2a1008] hover:bg-[#8b1a1a]/8 bg-white/60 border border-[#8b1a1a]/10"
            }`}
          >
            <FiMessageSquare /> Testimonials &amp; DPs ({testimonials.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("supabase")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs shrink-0 ${
              activeTab === "supabase"
                ? "bg-[#8b1a1a] text-white shadow-md shadow-[#8b1a1a]/20"
                : "text-[#7a4a35] hover:text-[#2a1008] hover:bg-[#8b1a1a]/8 bg-white/60 border border-[#8b1a1a]/10"
            }`}
          >
            <FiDatabase /> Supabase Setup &amp; SQL
          </button>
        </div>

        {/* ── TAB: PROFILE / BIO & ABOUT ME ── */}
        {activeTab === "profile" && (
          <section className="mt-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#2a1008] flex items-center gap-2">
                  <FiUser className="text-[#8b1a1a]" /> Bio &amp; About Me Editor
                </h2>
                <p className="text-xs sm:text-sm text-[#7a4a35] mt-1">
                  Customize the introduction bio on the Hero section and your detailed story in the About Me section.
                </p>
              </div>

              {profileSavedToast && (
                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-800 text-xs font-bold animate-pulse">
                  <FiCheck className="text-emerald-600 text-sm" /> Saved to Database &amp; Live!
                </div>
              )}
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="p-6 rounded-2xl border border-[#8b1a1a]/15 bg-[#fffaf2] shadow-sm space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[#2a1008]">
                    Hero Role Badge (Pill above name)
                  </label>
                  <input
                    type="text"
                    required
                    value={profile.heroRole || ""}
                    onChange={(e) => setProfile({ ...profile, heroRole: e.target.value })}
                    placeholder="Full-Stack Developer & AI Enthusiast"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#8b1a1a]/20 bg-white text-xs sm:text-sm text-[#2a1008] outline-none focus:border-[#8b1a1a] focus:ring-2 focus:ring-[#8b1a1a]/15 transition-all"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2a1008]">
                      Hero Section Introduction Bio Paragraph *
                    </label>
                    <span className="text-[11px] text-[#7a4a35]">Appears right beneath your name on home</span>
                  </div>
                  <textarea
                    required
                    rows={3}
                    value={profile.heroDesc}
                    onChange={(e) => setProfile({ ...profile, heroDesc: e.target.value })}
                    placeholder="2nd-year B.Tech student at NMAMIT, exploring web development, AI, and interactive projects that push the boundaries of what's possible."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#8b1a1a]/20 bg-white text-xs sm:text-sm text-[#2a1008] outline-none focus:border-[#8b1a1a] focus:ring-2 focus:ring-[#8b1a1a]/15 transition-all leading-relaxed"
                  />
                  <p className="text-[11px] text-[#7a4a35] mt-1">
                    💡 This is the paragraph circled in green from your screenshot.
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#2a1008]">
                      About Me Section Story Paragraph *
                    </label>
                    <span className="text-[11px] text-[#7a4a35]">Appears in &ldquo;WHO I AM &gt; About Me&rdquo;</span>
                  </div>
                  <textarea
                    required
                    rows={5}
                    value={profile.aboutMeDesc}
                    onChange={(e) => setProfile({ ...profile, aboutMeDesc: e.target.value })}
                    placeholder="I am a 2nd-year B.Tech student in Information Science and Engineering at N.M.A.M Institute of Technology, Nitte..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#8b1a1a]/20 bg-white text-xs sm:text-sm text-[#2a1008] outline-none focus:border-[#8b1a1a] focus:ring-2 focus:ring-[#8b1a1a]/15 transition-all leading-relaxed"
                  />
                </div>

                <div className="flex items-center justify-end pt-2">
                  <button
                    type="submit"
                    disabled={savingProfile}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs sm:text-sm font-bold bg-[#8b1a1a] hover:bg-[#721515] text-white shadow-md shadow-[#8b1a1a]/25 transition-all disabled:opacity-50"
                  >
                    {savingProfile ? (
                      <>
                        <FiRefreshCw className="animate-spin" /> Saving changes...
                      </>
                    ) : (
                      <>
                        <FiCheck /> Save Bio &amp; About Me Changes
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </section>
        )}

        {/* ── TAB: EDUCATION TIMELINE ── */}
        {activeTab === "education" && (
          <section className="mt-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#2a1008] flex items-center gap-2">
                  <FaGraduationCap className="text-[#8b1a1a]" /> Education Timeline
                </h2>
                <p className="text-xs sm:text-sm text-[#7a4a35] mt-1">
                  Manage your academic background timeline shown in the About section.
                </p>
              </div>
              <button
                type="button"
                onClick={openAddEducation}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#8b1a1a] hover:bg-[#721515] text-white shadow-md shadow-[#8b1a1a]/25 transition-all"
              >
                <FiPlus /> Add Education
              </button>
            </div>

            <div className="grid gap-4">
              {education.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-[#8b1a1a]/25 bg-white/40 text-sm text-[#7a4a35]">
                  No education entries found. Click &quot;Add Education&quot; to create one.
                </div>
              ) : (
                education.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 sm:p-6 rounded-2xl border border-[#8b1a1a]/15 bg-[#fffaf2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md"
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      <span className="p-3 rounded-xl bg-[#faeedd] border border-[#8b1a1a]/15 text-[#8b1a1a] text-xl shrink-0">
                        <FaGraduationCap />
                      </span>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/15 text-amber-900 border border-amber-500/25">
                            {item.levelTag}
                          </span>
                          {item.status && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-800 border border-emerald-500/30 flex items-center gap-1.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                              {item.status}
                            </span>
                          )}
                        </div>
                        <h3 className="font-bold text-base sm:text-lg text-[#2a1008] mt-1.5">{item.degree}</h3>
                        <p className="text-xs sm:text-sm text-[#7a4a35] font-medium">{item.institution}</p>
                        <p className="text-xs text-[#8b1a1a] font-semibold mt-1 flex items-center gap-1.5">
                          <FiCalendar /> {item.period}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditEducation(item)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[#8b1a1a]/20 bg-white hover:bg-[#faeedd] text-[#8b1a1a] transition-all flex items-center gap-1.5 shadow-xs"
                      >
                        <FiEdit3 /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteEducation(item.id)}
                        className="p-2 rounded-xl text-xs text-rose-500 hover:text-white hover:bg-rose-600 border border-rose-200 transition-all shadow-xs"
                        title="Delete education"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* ── TAB: EXPERIENCE ── */}
        {activeTab === "experience" && (
          <section className="mt-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#2a1008] flex items-center gap-2">
                  <FiBriefcase className="text-[#8b1a1a]" /> Experience &amp; Internships
                </h2>
                <p className="text-xs sm:text-sm text-[#7a4a35] mt-1">
                  Manage your work experiences, internships, and freelance roles shown on your portfolio.
                </p>
              </div>
              <button
                type="button"
                onClick={openAddExperience}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#8b1a1a] hover:bg-[#721515] text-white shadow-md shadow-[#8b1a1a]/25 transition-all"
              >
                <FiPlus /> Add Experience
              </button>
            </div>

            <div className="grid gap-4">
              {experience.length === 0 ? (
                <div className="p-8 text-center rounded-2xl border border-dashed border-[#8b1a1a]/25 bg-white/40 text-sm text-[#7a4a35]">
                  No experience entries found. Click &quot;Add Experience&quot; to create one.
                </div>
              ) : (
                experience.map((item) => (
                  <div
                    key={item.id}
                    className="p-5 sm:p-6 rounded-2xl border border-[#8b1a1a]/15 bg-[#fffaf2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md"
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      <span className="p-3 rounded-xl bg-[#faeedd] border border-[#8b1a1a]/15 text-[#8b1a1a] text-xl shrink-0">
                        <FiBriefcase />
                      </span>
                      <div className="min-w-0">
                        <h3 className="font-bold text-base sm:text-lg text-[#2a1008]">{item.role}</h3>
                        <p className="text-xs sm:text-sm text-[#8b1a1a] font-semibold mt-0.5">{item.company}</p>
                        <p className="text-xs text-[#7a4a35] font-medium mt-1 flex items-center gap-1.5">
                          <FiCalendar /> {item.period}
                        </p>
                        {item.description && (
                          <p className="text-xs text-[#7a4a35] mt-2 max-w-2xl leading-relaxed whitespace-pre-line">
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => openEditExperience(item)}
                        className="px-3.5 py-2 rounded-xl text-xs font-bold border border-[#8b1a1a]/20 bg-white hover:bg-[#faeedd] text-[#8b1a1a] transition-all flex items-center gap-1.5 shadow-xs"
                      >
                        <FiEdit3 /> Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteExperience(item.id)}
                        className="p-2 rounded-xl text-xs text-rose-500 hover:text-white hover:bg-rose-600 border border-rose-200 transition-all shadow-xs"
                        title="Delete experience"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </section>
        )}

        {/* ── TAB 1: PROJECTS ── */}
        {activeTab === "projects" && (
          <section className="mt-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#2a1008]">Portfolio Projects</h2>
                <p className="text-xs sm:text-sm text-[#7a4a35] mt-1">
                  Add, edit, or remove projects shown on your main portfolio & Engineering Lab.
                </p>
              </div>
              <button
                type="button"
                onClick={openAddProject}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#8b1a1a] hover:bg-[#721515] text-white shadow-md shadow-[#8b1a1a]/25 transition-all"
              >
                <FiPlus /> Add Project
              </button>
            </div>

            <div className="grid gap-4">
              {projects.map((proj) => (
                <div
                  key={proj.id || proj.title}
                  className="p-5 sm:p-6 rounded-2xl border border-[#8b1a1a]/15 bg-[#fffaf2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md"
                >
                  <div className="flex items-start gap-4 min-w-0">
                    {proj.logo ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={proj.logo}
                        alt={proj.title}
                        className="w-12 h-12 rounded-xl object-cover border border-[#8b1a1a]/20 bg-white shrink-0 shadow-xs"
                      />
                    ) : (
                      <span className="text-3xl shrink-0 p-2 rounded-xl bg-[#faeedd] border border-[#8b1a1a]/10">
                        {proj.emoji || "🚀"}
                      </span>
                    )}

                    <div className="min-w-0">
                      <h3 className="font-bold text-base sm:text-lg text-[#2a1008] truncate">{proj.title}</h3>
                      <p className="text-xs font-semibold text-[#8b1a1a] mt-0.5">{proj.tech}</p>
                      <p className="text-xs text-[#7a4a35] mt-1.5 max-w-2xl line-clamp-2 leading-relaxed">
                        {proj.desc}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 mt-3 text-[11px] font-semibold text-[#7a4a35]">
                        {proj.github && (
                          <a
                            href={proj.github}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline hover:text-[#8b1a1a]"
                          >
                            GitHub Link ↗
                          </a>
                        )}
                        {proj.labUrl && (
                          <Link href={proj.labUrl} target="_blank" className="underline hover:text-[#8b1a1a]">
                            Engineering Lab Demo ↗
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      type="button"
                      onClick={() => openEditProject(proj)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#8b1a1a]/25 bg-white text-[#8b1a1a] hover:bg-[#faeedd] text-xs font-bold transition-colors shadow-xs"
                      title="Edit project"
                    >
                      <FiEdit3 /> Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => proj.id && handleDeleteProject(proj.id)}
                      className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
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
          <section className="mt-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#2a1008]">Certificates & Credentials</h2>
                <p className="text-xs sm:text-sm text-[#7a4a35] mt-1">
                  Manage the certifications, issuing bodies, years, and certificate images shown on your portfolio.
                </p>
              </div>
              <button
                type="button"
                onClick={openAddCert}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#8b1a1a] hover:bg-[#721515] text-white shadow-md shadow-[#8b1a1a]/25 transition-all"
              >
                <FiPlus /> Add Certificate
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {certificates.map((cert) => {
                const certImages =
                  cert.images && cert.images.length > 0
                    ? cert.images
                    : cert.imageUrl
                    ? cert.imageUrl.split(",").map((s) => s.trim()).filter(Boolean)
                    : [];
                const previewImg = certImages[0] || cert.imageUrl;

                return (
                  <div
                    key={cert.id}
                    className="p-5 sm:p-6 rounded-2xl border border-[#8b1a1a]/15 bg-[#fffaf2] shadow-sm flex flex-col justify-between transition-all hover:shadow-md"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          {previewImg ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={previewImg}
                              alt={cert.title}
                              className="w-12 h-12 rounded-xl object-cover border border-[#8b1a1a]/20 bg-white shrink-0 shadow-xs"
                            />
                          ) : (
                            <span className="text-2xl p-2 rounded-xl bg-[#faeedd] border border-[#8b1a1a]/10 shrink-0">
                              {cert.icon || "🏅"}
                            </span>
                          )}
                          <div className="min-w-0">
                            <h3 className="font-bold text-base text-[#2a1008] truncate">{cert.title}</h3>
                            <p className="text-xs font-semibold text-[#8b1a1a] flex items-center gap-2">
                              <span>{cert.issuer} · {cert.year}</span>
                              {certImages.length > 0 && (
                                <span className="px-2 py-0.5 rounded-md bg-[#8b1a1a]/10 text-[#8b1a1a] text-[10px] font-bold">
                                  {certImages.length} {certImages.length === 1 ? "page" : "pages"}
                                </span>
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              setAdminCertViewer({
                                isOpen: true,
                                title: cert.title,
                                issuer: cert.issuer,
                                year: cert.year,
                                images: certImages.length > 0 ? certImages : (previewImg ? [previewImg] : ["/certificates/az1.jpeg"]),
                                currentIndex: 0,
                              });
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#8b1a1a]/25 bg-white text-[#8b1a1a] hover:bg-[#faeedd] text-xs font-bold transition-colors shadow-xs"
                            title="View certificate in modal"
                          >
                            <FiEye /> View
                          </button>
                          <button
                            type="button"
                            onClick={() => openEditCert(cert)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#8b1a1a]/25 bg-white text-[#8b1a1a] hover:bg-[#faeedd] text-xs font-bold transition-colors shadow-xs"
                            title="Edit certificate"
                          >
                            <FiEdit3 /> Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteCertificate(cert.id)}
                            className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
                            title="Delete certificate"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>

                      <p className="text-xs text-[#7a4a35] mt-3 leading-relaxed">{cert.subtitle}</p>
                    </div>

                    {certImages.length > 0 ? (
                      <div className="mt-4 pt-3 border-t border-[#8b1a1a]/10 flex items-center justify-between gap-2 text-xs text-[#7a4a35]">
                        <div className="flex items-center gap-2 truncate">
                          <FiImage className="text-[#8b1a1a] shrink-0" />
                          <span className="truncate max-w-[200px]">
                            {certImages.length} {certImages.length === 1 ? "certificate image attached" : "pages/images attached"}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setAdminCertViewer({
                              isOpen: true,
                              title: cert.title,
                              issuer: cert.issuer,
                              year: cert.year,
                              images: certImages,
                              currentIndex: 0,
                            });
                          }}
                          className="text-xs font-bold text-[#8b1a1a] hover:underline shrink-0"
                        >
                          Preview in window →
                        </button>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ── TAB 3: TESTIMONIALS & DP MANAGEMENT ── */}
        {activeTab === "testimonials" && (
          <section className="mt-8 space-y-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#2a1008]">Testimonials & Profile Pictures</h2>
              <p className="text-xs sm:text-sm text-[#7a4a35] mt-1">
                Manage community testimonials, review submitted feedback, and edit user profile pictures (DP).
              </p>
            </div>

            {testimonials.length === 0 ? (
              <p className="text-sm py-12 text-center text-[#7a4a35]/60">
                No testimonials found yet. As visitors sign in with Google or submit, they will appear here.
              </p>
            ) : (
              <div className="grid gap-4">
                {testimonials.map((t) => (
                  <div
                    key={t.id}
                    className="p-5 sm:p-6 rounded-2xl border border-[#8b1a1a]/15 bg-[#fffaf2] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:shadow-md"
                  >
                    <div className="flex items-start gap-4 min-w-0">
                      {/* Avatar / DP Preview */}
                      <div className="relative shrink-0">
                        {t.avatarImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={t.avatarImage}
                            alt={t.name}
                            className="w-12 h-12 rounded-full object-cover border-2 border-[#8b1a1a]/30 shadow-xs"
                          />
                        ) : (
                          <div
                            className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white text-sm shadow-xs"
                            style={{ backgroundColor: t.avatarColor || "#0A66C2" }}
                          >
                            {t.initials}
                          </div>
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-sm sm:text-base text-[#2a1008] truncate">{t.name}</h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#8b1a1a]/10 text-[#8b1a1a] font-bold">
                            {t.provider || "User"}
                          </span>
                        </div>
                        <p className="text-xs font-semibold text-[#8b1a1a]">{t.role}</p>
                        <p className="text-xs mt-2 max-w-2xl text-[#7a4a35] leading-relaxed">
                          &ldquo;{t.message}&rdquo;
                        </p>
                        <p className="text-[11px] mt-2 text-[#7a4a35]/60 font-medium">{t.date}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingTestimonial(t);
                          setAvatarInput(t.avatarImage || "");
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#8b1a1a]/25 bg-white text-[#8b1a1a] hover:bg-[#faeedd] text-xs font-bold transition-colors shadow-xs"
                      >
                        <FiEdit3 /> Manage DP
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDeleteTestimonial(t.id)}
                        className="p-2 rounded-lg text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-200 transition-colors"
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
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[#2a1008]">Supabase Setup & SQL Schema</h2>
              <p className="text-xs sm:text-sm mt-1 text-[#7a4a35]">
                Run this SQL script in your Supabase project to enable persistent cross-device testimonials, projects, and certificates.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-[#8b1a1a]/15 bg-[#fffaf2] shadow-sm">
              <h3 className="text-sm font-bold flex items-center gap-2 mb-4 text-[#8b1a1a]">
                <FiDatabase /> How to connect your Supabase database:
              </h3>
              <ol className="space-y-3 text-xs sm:text-sm list-decimal list-inside leading-relaxed text-[#7a4a35]">
                <li>Create a free account or open your project at <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="underline font-bold text-[#8b1a1a]">supabase.com</a>.</li>
                <li>Go to the <strong>SQL Editor</strong> tab on the left sidebar in your Supabase dashboard.</li>
                <li>Click <strong>New Query</strong>, paste the SQL script below, and click <strong>Run</strong>.</li>
                <li>Go to <strong>Project Settings &gt; API</strong>, copy your <strong>Project URL</strong> and <strong>anon key</strong> (and service role key).</li>
                <li>Add them to your Vercel Environment Variables:
                  <div className="mt-2 font-mono text-xs p-3.5 rounded-xl bg-[#2a1008] text-amber-200 overflow-x-auto space-y-1">
                    <div>NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co</div>
                    <div>NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...</div>
                    <div>SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...</div>
                  </div>
                </li>
              </ol>
            </div>

            {/* Quick Migration Box for Profile, Education & Experience Tables */}
            <div className="p-5 rounded-2xl border-2 border-amber-600/30 bg-amber-500/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-amber-950 flex items-center gap-2">
                  <FiDatabase className="text-amber-700" />
                  Database Query for Profile, Education &amp; Experience Tables
                </h4>
                <p className="text-xs text-amber-800 mt-1">
                  Run this query in your Supabase SQL Editor to create tables for editable Bio, Education Timeline, and Experience:
                </p>
                <code className="inline-block mt-2 font-mono text-xs px-3 py-1.5 rounded-lg bg-[#2a1008] text-amber-300">
                  CREATE TABLE IF NOT EXISTS public.profile (...); CREATE TABLE IF NOT EXISTS public.education (...); ...
                </code>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(SQL_MIGRATION_NEW_TABLES);
                  setCopiedNewMigration(true);
                  setTimeout(() => setCopiedNewMigration(false), 2000);
                }}
                className="shrink-0 px-4 py-2.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                {copiedNewMigration ? (
                  <>
                    <FiCheck /> Copied!
                  </>
                ) : (
                  <>
                    <FiCopy /> Copy SQL Query
                  </>
                )}
              </button>
            </div>

            {/* Quick Migration Box for Certificates Multi-Image Support */}
            <div className="p-5 rounded-2xl border-2 border-emerald-600/30 bg-emerald-500/10 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                  <FiDatabase className="text-emerald-700" />
                  Database Query for Certificates (Multi-Image Support)
                </h4>
                <p className="text-xs text-emerald-800 mt-1">
                  Run this single query in your Supabase SQL Editor to enable native multi-image support for certificates:
                </p>
                <code className="inline-block mt-2 font-mono text-xs px-3 py-1.5 rounded-lg bg-[#2a1008] text-emerald-300">
                  ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS images JSONB DEFAULT &apos;[]&apos;::jsonb;
                </code>
              </div>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText("ALTER TABLE public.certificates ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;");
                  setCopiedMigration(true);
                  setTimeout(() => setCopiedMigration(false), 2000);
                }}
                className="shrink-0 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5"
              >
                {copiedMigration ? (
                  <>
                    <FiCheck /> Copied!
                  </>
                ) : (
                  <>
                    <FiCopy /> Copy Query
                  </>
                )}
              </button>
            </div>

            {/* SQL Copy Box */}
            <div className="relative rounded-2xl overflow-hidden border border-[#8b1a1a]/20 shadow-sm">
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#faeedd] border-b border-[#8b1a1a]/15 text-xs font-mono text-[#8b1a1a]">
                <span className="font-bold">supabase-schema.sql</span>
                <button
                  type="button"
                  onClick={copySql}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#8b1a1a] hover:bg-[#721515] text-white font-sans text-xs font-bold transition-colors shadow-xs"
                >
                  {copiedSql ? (
                    <>
                      <FiCheck /> Copied!
                    </>
                  ) : (
                    <>
                      <FiCopy /> Copy SQL
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 bg-[#2a1008] text-xs font-mono text-amber-100 overflow-x-auto max-h-[420px] leading-relaxed">
                {SQL_SCHEMA}
              </pre>
            </div>
          </section>
        )}
      </div>

      {/* ── MODAL: ADD / EDIT PROJECT (Spacious & Clean) ── */}
      <AnimatePresence>
        {showProjectModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl p-6 sm:p-8 rounded-3xl border border-[#8b1a1a]/20 bg-[#fffaf2] text-[#2a1008] shadow-2xl max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#8b1a1a]/15">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#2a1008]">
                    {editingProject ? "Edit Project" : "Add New Project"}
                  </h2>
                  <p className="text-xs text-[#7a4a35] mt-0.5">
                    {editingProject
                      ? "Update project details, tech stack, and media."
                      : "This will appear in your main portfolio projects list and database."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowProjectModal(false)}
                  className="p-2 rounded-xl text-[#7a4a35] hover:text-[#8b1a1a] hover:bg-[#faeedd] transition-colors"
                >
                  <FiX className="text-lg" />
                </button>
              </div>

              <form onSubmit={handleSaveProject} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[#2a1008]">
                    Project Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={projectForm.title || ""}
                    onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value })}
                    placeholder="e.g. AI Flood Relief Portal"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#8b1a1a]/20 bg-white text-xs sm:text-sm text-[#2a1008] outline-none focus:border-[#8b1a1a] focus:ring-2 focus:ring-[#8b1a1a]/15 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[#2a1008]">
                    Tech Stack *
                  </label>
                  <input
                    type="text"
                    required
                    value={projectForm.tech || ""}
                    onChange={(e) => setProjectForm({ ...projectForm, tech: e.target.value })}
                    placeholder="e.g. React 18 · Vite · Tailwind · Supabase"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#8b1a1a]/20 bg-white text-xs sm:text-sm text-[#2a1008] outline-none focus:border-[#8b1a1a] focus:ring-2 focus:ring-[#8b1a1a]/15 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[#2a1008]">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={projectForm.desc || ""}
                    onChange={(e) => setProjectForm({ ...projectForm, desc: e.target.value })}
                    placeholder="Brief description of the build, algorithms, impact..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#8b1a1a]/20 bg-white text-xs sm:text-sm text-[#2a1008] outline-none focus:border-[#8b1a1a] focus:ring-2 focus:ring-[#8b1a1a]/15 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[#2a1008]">
                      Emoji Icon
                    </label>
                    <input
                      type="text"
                      value={projectForm.emoji || ""}
                      onChange={(e) => setProjectForm({ ...projectForm, emoji: e.target.value })}
                      placeholder="e.g. 🌊"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#8b1a1a]/20 bg-white text-xs sm:text-sm text-[#2a1008] outline-none focus:border-[#8b1a1a] focus:ring-2 focus:ring-[#8b1a1a]/15 transition-all text-center"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <ImageInputWithUpload
                      label="Project Cover / Logo"
                      value={projectForm.logo || ""}
                      onChange={(logo) => setProjectForm({ ...projectForm, logo })}
                      placeholder="e.g. /projects/atlas/cover.png or upload from album"
                      maxDimension={1000}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[#2a1008]">
                      GitHub URL
                    </label>
                    <input
                      type="text"
                      value={projectForm.github || ""}
                      onChange={(e) => setProjectForm({ ...projectForm, github: e.target.value })}
                      placeholder="https://github.com/..."
                      className="w-full px-4 py-2.5 rounded-xl border border-[#8b1a1a]/20 bg-white text-xs sm:text-sm text-[#2a1008] outline-none focus:border-[#8b1a1a] focus:ring-2 focus:ring-[#8b1a1a]/15 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[#2a1008]">
                      Engineering Lab URL / Demo
                    </label>
                    <input
                      type="text"
                      value={projectForm.labUrl || ""}
                      onChange={(e) => setProjectForm({ ...projectForm, labUrl: e.target.value })}
                      placeholder="e.g. /engineering-lab/sankat-saathi"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#8b1a1a]/20 bg-white text-xs sm:text-sm text-[#2a1008] outline-none focus:border-[#8b1a1a] focus:ring-2 focus:ring-[#8b1a1a]/15 transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#8b1a1a]/15">
                  <button
                    type="button"
                    onClick={() => setShowProjectModal(false)}
                    className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#7a4a35] hover:text-[#2a1008] hover:bg-[#faeedd] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#8b1a1a] hover:bg-[#721515] text-white shadow-md shadow-[#8b1a1a]/25 transition-all"
                  >
                    {editingProject ? "Update Project" : "Save Project"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: ADD / EDIT CERTIFICATE (Spacious & Clean) ── */}
      <AnimatePresence>
        {showCertModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl p-6 sm:p-8 rounded-3xl border border-[#8b1a1a]/20 bg-[#fffaf2] text-[#2a1008] shadow-2xl max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#8b1a1a]/15">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#2a1008]">
                    {editingCert ? "Edit Certificate" : "Add Certificate"}
                  </h2>
                  <p className="text-xs text-[#7a4a35] mt-0.5">
                    {editingCert
                      ? "Update certificate title, issuing organization, year, and image."
                      : "Add a verified credential to your portfolio certifications section."}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowCertModal(false)}
                  className="p-2 rounded-xl text-[#7a4a35] hover:text-[#8b1a1a] hover:bg-[#faeedd] transition-colors"
                >
                  <FiX className="text-lg" />
                </button>
              </div>

              <form onSubmit={handleSaveCertificate} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[#2a1008]">
                    Certificate Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={certForm.title || ""}
                    onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
                    placeholder="e.g. Microsoft Azure Fundamentals"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#8b1a1a]/20 bg-white text-xs sm:text-sm text-[#2a1008] outline-none focus:border-[#8b1a1a] focus:ring-2 focus:ring-[#8b1a1a]/15 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[#2a1008]">
                    Subtitle / Skills
                  </label>
                  <input
                    type="text"
                    value={certForm.subtitle || ""}
                    onChange={(e) => setCertForm({ ...certForm, subtitle: e.target.value })}
                    placeholder="e.g. Cloud Architecture · Security · AI Essentials"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#8b1a1a]/20 bg-white text-xs sm:text-sm text-[#2a1008] outline-none focus:border-[#8b1a1a] focus:ring-2 focus:ring-[#8b1a1a]/15 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[#2a1008]">
                      Issuer *
                    </label>
                    <input
                      type="text"
                      required
                      value={certForm.issuer || ""}
                      onChange={(e) => setCertForm({ ...certForm, issuer: e.target.value })}
                      placeholder="e.g. Microsoft or IBM"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#8b1a1a]/20 bg-white text-xs sm:text-sm text-[#2a1008] outline-none focus:border-[#8b1a1a] focus:ring-2 focus:ring-[#8b1a1a]/15 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[#2a1008]">
                      Year *
                    </label>
                    <input
                      type="text"
                      required
                      value={certForm.year || ""}
                      onChange={(e) => setCertForm({ ...certForm, year: e.target.value })}
                      placeholder="e.g. 2026"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#8b1a1a]/20 bg-white text-xs sm:text-sm text-[#2a1008] outline-none focus:border-[#8b1a1a] focus:ring-2 focus:ring-[#8b1a1a]/15 transition-all"
                    />
                  </div>
                </div>

                <MultiCertificateImagesInput
                  images={parseCertificateImages(certForm.imageUrl, certForm.images)}
                  onChange={(images) =>
                    setCertForm({
                      ...certForm,
                      images,
                      imageUrl: images[0] || (images.length > 0 ? JSON.stringify(images) : ""),
                    })
                  }
                />

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[#2a1008]">
                      Icon / Emoji
                    </label>
                    <input
                      type="text"
                      value={certForm.icon || ""}
                      onChange={(e) => setCertForm({ ...certForm, icon: e.target.value })}
                      placeholder="🏅"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#8b1a1a]/20 bg-white text-xs sm:text-sm text-[#2a1008] outline-none focus:border-[#8b1a1a] focus:ring-2 focus:ring-[#8b1a1a]/15 transition-all text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[#2a1008]">
                      Dark Accent Color
                    </label>
                    <input
                      type="text"
                      value={certForm.colorDark || ""}
                      onChange={(e) => setCertForm({ ...certForm, colorDark: e.target.value })}
                      placeholder="#0ea5e9"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#8b1a1a]/20 bg-white text-xs sm:text-sm text-[#2a1008] outline-none focus:border-[#8b1a1a] focus:ring-2 focus:ring-[#8b1a1a]/15 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[#2a1008]">
                      Light Accent Color
                    </label>
                    <input
                      type="text"
                      value={certForm.colorLight || ""}
                      onChange={(e) => setCertForm({ ...certForm, colorLight: e.target.value })}
                      placeholder="#c9956a"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#8b1a1a]/20 bg-white text-xs sm:text-sm text-[#2a1008] outline-none focus:border-[#8b1a1a] focus:ring-2 focus:ring-[#8b1a1a]/15 transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#8b1a1a]/15">
                  <button
                    type="button"
                    onClick={() => setShowCertModal(false)}
                    className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#7a4a35] hover:text-[#2a1008] hover:bg-[#faeedd] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#8b1a1a] hover:bg-[#721515] text-white shadow-md shadow-[#8b1a1a]/25 transition-all"
                  >
                    {editingCert ? "Update Certificate" : "Save Certificate"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: MANAGE TESTIMONIAL DP (With Device Album Upload) ── */}
      <AnimatePresence>
        {editingTestimonial && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg p-6 sm:p-8 rounded-3xl border border-[#8b1a1a]/20 bg-[#fffaf2] text-[#2a1008] shadow-2xl"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#8b1a1a]/15">
                <div>
                  <h2 className="text-xl font-bold text-[#2a1008]">Manage Profile Picture (DP)</h2>
                  <p className="text-xs text-[#7a4a35] mt-0.5">
                    Update avatar image for {editingTestimonial.name}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingTestimonial(null)}
                  className="p-2 rounded-xl text-[#7a4a35] hover:text-[#8b1a1a] hover:bg-[#faeedd] transition-colors"
                >
                  <FiX className="text-lg" />
                </button>
              </div>

              <div className="flex justify-center my-6">
                {avatarInput ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={avatarInput}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover border-4 border-[#8b1a1a]/20 shadow-lg"
                  />
                ) : (
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center font-bold text-white text-2xl shadow-lg"
                    style={{ backgroundColor: editingTestimonial.avatarColor || "#0A66C2" }}
                  >
                    {editingTestimonial.initials}
                  </div>
                )}
              </div>

              <form onSubmit={handleSaveAvatar} className="space-y-4">
                <ImageInputWithUpload
                  label="Avatar Photo"
                  value={avatarInput}
                  onChange={(val) => setAvatarInput(val)}
                  placeholder="https://... or upload photo from device"
                  maxDimension={400}
                  isCircular={true}
                />

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#8b1a1a]/15">
                  <button
                    type="button"
                    onClick={() => setEditingTestimonial(null)}
                    className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#7a4a35] hover:text-[#2a1008] hover:bg-[#faeedd] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#8b1a1a] hover:bg-[#721515] text-white shadow-md shadow-[#8b1a1a]/25 transition-all"
                  >
                    Update DP
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: ADMIN IN-PAGE CERTIFICATE VIEWER ── */}
      <AnimatePresence>
        {adminCertViewer?.isOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-2xl p-6 sm:p-7 rounded-3xl border border-[#8b1a1a]/20 bg-[#fffaf2] text-[#2a1008] shadow-2xl relative"
            >
              <div className="flex items-center justify-between pb-4 border-b border-[#8b1a1a]/15">
                <div>
                  <h2 className="text-xl font-bold text-[#2a1008]">{adminCertViewer.title}</h2>
                  <p className="text-xs text-[#7a4a35] mt-0.5">
                    {adminCertViewer.issuer} · {adminCertViewer.year}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setAdminCertViewer(null)}
                  className="w-9 h-9 rounded-full border border-[#8b1a1a]/25 bg-white text-[#8b1a1a] hover:bg-[#faeedd] flex items-center justify-center transition-colors shadow-xs"
                  aria-label="Close certificate viewer"
                >
                  <FiX className="text-base" />
                </button>
              </div>

              <div className="relative w-full aspect-[4/3] rounded-2xl overflow-hidden bg-white shadow-inner flex items-center justify-center border border-black/10 my-5">
                {adminCertViewer.images[adminCertViewer.currentIndex] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={adminCertViewer.images[adminCertViewer.currentIndex]}
                    alt={`${adminCertViewer.title} - ${adminCertViewer.currentIndex + 1}`}
                    className="w-full h-full object-contain p-2"
                  />
                ) : (
                  <div className="text-sm text-neutral-400">No image available</div>
                )}
              </div>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() =>
                    setAdminCertViewer((prev) =>
                      prev
                        ? {
                            ...prev,
                            currentIndex:
                              (prev.currentIndex - 1 + prev.images.length) %
                              prev.images.length,
                          }
                        : null
                    )
                  }
                  disabled={adminCertViewer.images.length <= 1}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all",
                    adminCertViewer.images.length <= 1
                      ? "opacity-30 cursor-not-allowed border-transparent"
                      : "bg-white border-[#8b1a1a]/25 text-[#8b1a1a] hover:bg-[#faeedd] active:scale-95 shadow-xs"
                  )}
                >
                  ← Prev
                </button>
                <span className="text-sm font-medium text-[#7a4a35]">
                  {adminCertViewer.currentIndex + 1} / {adminCertViewer.images.length}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setAdminCertViewer((prev) =>
                      prev
                        ? {
                            ...prev,
                            currentIndex:
                              (prev.currentIndex + 1) % prev.images.length,
                          }
                        : null
                    )
                  }
                  disabled={adminCertViewer.images.length <= 1}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all",
                    adminCertViewer.images.length <= 1
                      ? "opacity-30 cursor-not-allowed border-transparent"
                      : "bg-white border-[#8b1a1a]/25 text-[#8b1a1a] hover:bg-[#faeedd] active:scale-95 shadow-xs"
                  )}
                >
                  Next →
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: ADD / EDIT EDUCATION ── */}
      <AnimatePresence>
        {showEduModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl p-6 sm:p-8 rounded-3xl border border-[#8b1a1a]/20 bg-[#fffaf2] text-[#2a1008] shadow-2xl max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#8b1a1a]/15">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#2a1008]">
                    {editingEdu ? "Edit Education" : "Add Education"}
                  </h2>
                  <p className="text-xs text-[#7a4a35] mt-0.5">
                    Entries will appear in the Education Timeline in the About Me section.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowEduModal(false)}
                  className="p-2 rounded-xl text-[#7a4a35] hover:text-[#8b1a1a] hover:bg-[#faeedd] transition-colors"
                >
                  <FiX className="text-lg" />
                </button>
              </div>

              <form onSubmit={handleSaveEducation} className="mt-5 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[#2a1008]">
                      Level Tag *
                    </label>
                    <input
                      type="text"
                      required
                      value={eduForm.levelTag || ""}
                      onChange={(e) => setEduForm({ ...eduForm, levelTag: e.target.value })}
                      placeholder="e.g. B.TECH or PRE-UNIVERSITY"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#8b1a1a]/20 bg-white text-xs sm:text-sm text-[#2a1008] outline-none focus:border-[#8b1a1a] focus:ring-2 focus:ring-[#8b1a1a]/15 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[#2a1008]">
                      Period *
                    </label>
                    <input
                      type="text"
                      required
                      value={eduForm.period || ""}
                      onChange={(e) => setEduForm({ ...eduForm, period: e.target.value })}
                      placeholder="e.g. 2024 – 2028 or 2022 – 2024"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#8b1a1a]/20 bg-white text-xs sm:text-sm text-[#2a1008] outline-none focus:border-[#8b1a1a] focus:ring-2 focus:ring-[#8b1a1a]/15 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[#2a1008]">
                    Degree / Course Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={eduForm.degree || ""}
                    onChange={(e) => setEduForm({ ...eduForm, degree: e.target.value })}
                    placeholder="e.g. B.Tech Information Science & Engineering"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#8b1a1a]/20 bg-white text-xs sm:text-sm text-[#2a1008] outline-none focus:border-[#8b1a1a] focus:ring-2 focus:ring-[#8b1a1a]/15 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[#2a1008]">
                    Institution / College Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={eduForm.institution || ""}
                    onChange={(e) => setEduForm({ ...eduForm, institution: e.target.value })}
                    placeholder="e.g. N.M.A.M. Institute of Technology, Nitte"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#8b1a1a]/20 bg-white text-xs sm:text-sm text-[#2a1008] outline-none focus:border-[#8b1a1a] focus:ring-2 focus:ring-[#8b1a1a]/15 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[#2a1008]">
                      Status Badge (Optional)
                    </label>
                    <input
                      type="text"
                      value={eduForm.status || ""}
                      onChange={(e) => setEduForm({ ...eduForm, status: e.target.value })}
                      placeholder="e.g. In Progress or Completed"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#8b1a1a]/20 bg-white text-xs sm:text-sm text-[#2a1008] outline-none focus:border-[#8b1a1a] focus:ring-2 focus:ring-[#8b1a1a]/15 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[#2a1008]">
                      Sort Order (1, 2, 3...)
                    </label>
                    <input
                      type="number"
                      value={eduForm.orderIndex ?? 0}
                      onChange={(e) => setEduForm({ ...eduForm, orderIndex: parseInt(e.target.value) || 0 })}
                      className="w-full px-4 py-2.5 rounded-xl border border-[#8b1a1a]/20 bg-white text-xs sm:text-sm text-[#2a1008] outline-none focus:border-[#8b1a1a] focus:ring-2 focus:ring-[#8b1a1a]/15 transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#8b1a1a]/15">
                  <button
                    type="button"
                    onClick={() => setShowEduModal(false)}
                    className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#7a4a35] hover:text-[#2a1008] hover:bg-[#faeedd] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#8b1a1a] hover:bg-[#721515] text-white shadow-md shadow-[#8b1a1a]/25 transition-all"
                  >
                    {editingEdu ? "Update Education" : "Save Education"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ── MODAL: ADD / EDIT EXPERIENCE ── */}
      <AnimatePresence>
        {showExpModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-xl p-6 sm:p-8 rounded-3xl border border-[#8b1a1a]/20 bg-[#fffaf2] text-[#2a1008] shadow-2xl max-h-[92vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#8b1a1a]/15">
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#2a1008]">
                    {editingExp ? "Edit Experience" : "Add Experience"}
                  </h2>
                  <p className="text-xs text-[#7a4a35] mt-0.5">
                    Entries will appear in the Experience section under About Me.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowExpModal(false)}
                  className="p-2 rounded-xl text-[#7a4a35] hover:text-[#8b1a1a] hover:bg-[#faeedd] transition-colors"
                >
                  <FiX className="text-lg" />
                </button>
              </div>

              <form onSubmit={handleSaveExperience} className="mt-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[#2a1008]">
                    Role / Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={expForm.role || ""}
                    onChange={(e) => setExpForm({ ...expForm, role: e.target.value })}
                    placeholder="e.g. Web Intern or Freelance UI/UX & Frontend Projects"
                    className="w-full px-4 py-2.5 rounded-xl border border-[#8b1a1a]/20 bg-white text-xs sm:text-sm text-[#2a1008] outline-none focus:border-[#8b1a1a] focus:ring-2 focus:ring-[#8b1a1a]/15 transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[#2a1008]">
                      Company / Organization *
                    </label>
                    <input
                      type="text"
                      required
                      value={expForm.company || ""}
                      onChange={(e) => setExpForm({ ...expForm, company: e.target.value })}
                      placeholder="e.g. ABC Corp or Self-Employed"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#8b1a1a]/20 bg-white text-xs sm:text-sm text-[#2a1008] outline-none focus:border-[#8b1a1a] focus:ring-2 focus:ring-[#8b1a1a]/15 transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[#2a1008]">
                      Period *
                    </label>
                    <input
                      type="text"
                      required
                      value={expForm.period || ""}
                      onChange={(e) => setExpForm({ ...expForm, period: e.target.value })}
                      placeholder="e.g. May 2025 – July 2025"
                      className="w-full px-4 py-2.5 rounded-xl border border-[#8b1a1a]/20 bg-white text-xs sm:text-sm text-[#2a1008] outline-none focus:border-[#8b1a1a] focus:ring-2 focus:ring-[#8b1a1a]/15 transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[#2a1008]">
                    Description / Notes (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={expForm.description || ""}
                    onChange={(e) => setExpForm({ ...expForm, description: e.target.value })}
                    placeholder="Responsibilities, key achievements, tech used..."
                    className="w-full px-4 py-2.5 rounded-xl border border-[#8b1a1a]/20 bg-white text-xs sm:text-sm text-[#2a1008] outline-none focus:border-[#8b1a1a] focus:ring-2 focus:ring-[#8b1a1a]/15 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider mb-1 text-[#2a1008]">
                    Sort Order (1, 2, 3...)
                  </label>
                  <input
                    type="number"
                    value={expForm.orderIndex ?? 0}
                    onChange={(e) => setExpForm({ ...expForm, orderIndex: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 rounded-xl border border-[#8b1a1a]/20 bg-white text-xs sm:text-sm text-[#2a1008] outline-none focus:border-[#8b1a1a] focus:ring-2 focus:ring-[#8b1a1a]/15 transition-all"
                  />
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#8b1a1a]/15">
                  <button
                    type="button"
                    onClick={() => setShowExpModal(false)}
                    className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-[#7a4a35] hover:text-[#2a1008] hover:bg-[#faeedd] transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-[#8b1a1a] hover:bg-[#721515] text-white shadow-md shadow-[#8b1a1a]/25 transition-all"
                  >
                    {editingExp ? "Update Experience" : "Save Experience"}
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
