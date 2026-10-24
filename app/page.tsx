"use client";

import React, {
  useState,
  useEffect,
  Suspense,
  useRef,
  useCallback,
} from "react";
import Image from "next/image";
import Link from "next/link";
import { useFrame, useThree, Canvas } from "@react-three/fiber";
import {
  OrbitControls,
  Sphere,
  MeshDistortMaterial,
  Stars,
} from "@react-three/drei";
import {
  motion,
  useScroll,
  useTransform,
  Variants,
  AnimatePresence,
} from "framer-motion";
import { signIn, signOut, useSession } from "next-auth/react";
import { FaGithub, FaGoogle, FaLinkedin, FaPenNib, FaReact, FaJsSquare, FaTimes, FaCheck, FaArrowRight, FaUser, FaGraduationCap } from "react-icons/fa";
import { LuGraduationCap } from "react-icons/lu";
import {
  FiHome,
  FiUser,
  FiFolder,
  FiAward,
  FiMessageSquare,
  FiBriefcase,
  FiMail,
  FiFileText,
  FiCalendar,
} from "react-icons/fi";
import { useTheme } from "./theme-provider";
import { SkillIcon } from "@/lib/skills-catalog";


// ─── Utilities ────────────────────────────────────────────────────────────────
const cn = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(" ");

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);
  return matches;
}

// ─── Animation Variants ───────────────────────────────────────────────────────
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 60, filter: "blur(8px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] },
  },
};

const stagger: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  },
};

// ─── 3-D Touch & Motion Controller ───────────────────────────────────────────
type TouchControllerState = {
  rotX: number;
  rotY: number;
  velX: number;
  velY: number;
  ambientRotX: number;
  ambientRotY: number;
  tiltX: number;
  tiltY: number;
};

// Moving Starfield with orbital drift and reactive parallax
function MovingStars({
  mobile,
  touchRef,
}: {
  mobile: boolean;
  touchRef: React.MutableRefObject<TouchControllerState>;
}) {
  const groupRef = useRef<any>(null);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    // Continuous galactic orbital drift across 3D space
    groupRef.current.rotation.y += delta * 0.045;
    groupRef.current.rotation.x += delta * 0.018;

    // Smooth parallax response to touch drag & device gyroscope tilt
    const targetParallaxX = touchRef.current.rotX * 0.12 + touchRef.current.tiltY * 0.25;
    const targetParallaxY = touchRef.current.rotY * 0.12 + touchRef.current.tiltX * 0.25;

    groupRef.current.rotation.x += (targetParallaxX - groupRef.current.rotation.x) * 0.06;
    groupRef.current.rotation.y += (targetParallaxY - groupRef.current.rotation.y) * 0.06;
  });

  return (
    <group ref={groupRef}>
      <Stars
        radius={100}
        depth={50}
        count={mobile ? 2200 : 4500}
        factor={4}
        fade
        speed={1.5}
      />
    </group>
  );
}

// ─── 3-D Interactive Sphere (Touch + Gyroscope + Mouse) ──────────────────────
function InteractiveSphere({
  dark,
  mobile,
  touchRef,
}: {
  dark: boolean;
  mobile: boolean;
  touchRef: React.MutableRefObject<TouchControllerState>;
}) {
  const mesh = useRef<any>(null);
  const width = useThree((s) => s.size.width);
  const scale = width < 480 ? 0.52 : width < 768 ? 0.65 : width < 1024 ? 0.85 : 1;

  useFrame(({ mouse }, delta) => {
    if (!mesh.current) return;

    // Apply inertia and friction from touch flicks
    touchRef.current.rotY += touchRef.current.velX;
    touchRef.current.rotX += touchRef.current.velY;
    touchRef.current.velX *= 0.94;
    touchRef.current.velY *= 0.94;

    // Ambient self-rotation
    touchRef.current.ambientRotY += delta * 0.22;
    touchRef.current.ambientRotX += delta * 0.06;

    if (mobile) {
      // Mobile: interactive touch drag + inertia + phone gyroscope tilt + ambient breathing
      const targetY = touchRef.current.ambientRotY + touchRef.current.rotY + touchRef.current.tiltX * 0.8;
      const targetX = touchRef.current.ambientRotX + touchRef.current.rotX + touchRef.current.tiltY * 0.8;
      mesh.current.rotation.y += (targetY - mesh.current.rotation.y) * 0.12;
      mesh.current.rotation.x += (targetX - mesh.current.rotation.x) * 0.12;
    } else {
      // Desktop: mouse tracking + touch drag + ambient spin
      const targetX = (mouse.y * 0.45) + touchRef.current.rotX;
      const targetY = (mouse.x * 0.45) + touchRef.current.ambientRotY + touchRef.current.rotY;
      mesh.current.rotation.x += (targetX - mesh.current.rotation.x) * 0.06;
      mesh.current.rotation.y += (targetY - mesh.current.rotation.y) * 0.06;
    }
  });

  return (
    <Sphere
      ref={mesh}
      args={[1.3, 64, 128]}
      scale={scale}
      position={[0, mobile ? 0.55 : 0, 0]}
    >
      <MeshDistortMaterial
        color={dark ? "#00d4ff" : "#8b1a1a"}
        distort={mobile ? 0.36 : 0.42}
        speed={2.4}
        roughness={0.08}
        metalness={0.6}
      />
    </Sphere>
  );
}

// ─── Cursor (mouse devices only) ──────────────────────────────────────────────
function CursorGlow({ dark }: { dark: boolean }) {
  const [enabled, setEnabled] = useState(false);
  const [pos, setPos] = useState({ x: -200, y: -200 });
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    setEnabled(true);
    const onMove = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY });
    const onEnter = (e: MouseEvent) => {
      if ((e.target as HTMLElement).closest("a, button")) setHovered(true);
    };
    const onLeave = () => setHovered(false);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseover", onEnter);
    window.addEventListener("mouseout", onLeave);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseover", onEnter);
      window.removeEventListener("mouseout", onLeave);
    };
  }, []);

  if (!enabled) return null;

  const accent = dark ? "rgba(0,212,255,0.6)" : "rgba(139,26,26,0.7)";
  const fill = dark ? "rgb(0,212,255)" : "rgb(139,26,26)";
  const bg = dark ? "rgba(0,212,255,0.08)" : "rgba(139,26,26,0.08)";

  return (
    <>
      <div
        className="pointer-events-none fixed z-[9999] rounded-full transition-all duration-200"
        style={{
          width: hovered ? 48 : 32,
          height: hovered ? 48 : 32,
          left: pos.x - (hovered ? 24 : 16),
          top: pos.y - (hovered ? 24 : 16),
          border: `1px solid ${accent}`,
          background: hovered ? bg : "transparent",
        }}
      />
      <div
        className="pointer-events-none fixed z-[9999] w-1.5 h-1.5 rounded-full"
        style={{ left: pos.x - 3, top: pos.y - 3, background: fill }}
      />
    </>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
function Divider({ dark, className }: { dark: boolean; className?: string }) {
  return (
    <div
      className={cn(
        "flex items-center justify-center gap-2.5 my-3.5 mx-auto w-full max-w-[190px] sm:max-w-[230px]",
        className
      )}
    >
      <div
        className={cn(
          "flex-1 h-px bg-gradient-to-r from-transparent",
          dark ? "via-cyan-400/25 to-cyan-400/50" : "via-[#8b1a1a]/25 to-[#8b1a1a]/55"
        )}
      />
      <div
        className={cn(
          "w-10 sm:w-12 h-[3.5px] rounded-full shrink-0 transition-all duration-300",
          dark
            ? "bg-gradient-to-r from-cyan-500 via-cyan-300 to-cyan-500 shadow-[0_0_10px_rgba(34,211,238,0.6)]"
            : "bg-gradient-to-r from-[#8b1a1a] via-[#b33939] to-[#8b1a1a] shadow-[0_1px_6px_rgba(139,26,26,0.3)]"
        )}
      />
      <div
        className={cn(
          "flex-1 h-px bg-gradient-to-l from-transparent",
          dark ? "via-cyan-400/25 to-cyan-400/50" : "via-[#8b1a1a]/25 to-[#8b1a1a]/55"
        )}
      />
    </div>
  );
}

// ─── Grain Overlay ────────────────────────────────────────────────────────────
function GrainOverlay() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[1] opacity-[0.035]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundSize: "200px 200px",
      }}
    />
  );
}

// ─── Secure Contact Form ──────────────────────────────────────────────────────
const FORMSPREE_ID = "xaqlpqpj";

function ContactForm({
  dark,
  lang,
  inputClass,
  emailMe,
}: {
  dark: boolean;
  lang: "en" | "jp";
  inputClass: string;
  emailMe: string;
}) {
  const [fields, setFields] = useState({ name: "", email: "", message: "" });
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setFields((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fields.name || !fields.email || !fields.message) return;

    setStatus("sending");
    try {
      const res = await fetch(`https://formspree.io/f/${FORMSPREE_ID}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(fields),
      });

      if (res.ok) {
        setStatus("success");
        setFields({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch (err) {
      console.error("Form submission error:", err);
      setStatus("error");
    }
  };

  const btnClass = cn(
    "relative w-full overflow-hidden px-8 py-4 rounded-xl font-semibold text-sm text-white transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed",
    dark
      ? "bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_30px_rgba(0,212,255,0.25)] hover:shadow-[0_0_50px_rgba(0,212,255,0.45)]"
      : "bg-gradient-to-r from-[#8b1a1a] to-[#c9956a] shadow-[0_4px_24px_rgba(139,26,26,0.3)] hover:shadow-[0_6px_40px_rgba(139,26,26,0.45)]"
  );

  if (status === "success") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "rounded-2xl border p-10 text-center space-y-4",
          dark
            ? "glass-card border-white/10"
            : "bg-[#f5ede0] border-[#8b1a1a]/15"
        )}
      >
        <div className="text-5xl">✉️</div>
        <h3
          className={cn(
            "text-xl font-bold",
            dark ? "text-white" : "text-[#2a1008]"
          )}
        >
          {lang === "jp" ? "送信しました！" : "Message sent!"}
        </h3>
        <p
          className={cn(
            "text-sm",
            dark ? "text-white/50" : "text-[#7a4a35]"
          )}
        >
          {lang === "jp"
            ? "ご連絡ありがとうございます。できるだけ早くご返信します。"
            : "Thanks for reaching out — I'll get back to you as soon as possible."}
        </p>
        <button
          onClick={() => setStatus("idle")}
          className={cn(
            "text-sm font-semibold underline underline-offset-4",
            dark ? "text-cyan-300" : "text-[#8b1a1a]"
          )}
        >
          {lang === "jp" ? "別のメッセージを送る" : "Send another message"}
        </button>
      </motion.div>
    );
  }

  return (
    <motion.form
      onSubmit={handleSubmit}
      initial="hidden"
      animate="visible"
      variants={stagger}
      className="space-y-4"
      noValidate
    >
      <motion.div variants={fadeUp} className="grid sm:grid-cols-2 gap-4">
        <input
          type="text"
          name="name"
          value={fields.name}
          onChange={handleChange}
          placeholder={lang === "jp" ? "お名前" : "Your Name"}
          required
          className={inputClass}
        />
        <input
          type="email"
          name="email"
          value={fields.email}
          onChange={handleChange}
          placeholder={lang === "jp" ? "メール" : "Your Email"}
          required
          className={inputClass}
        />
      </motion.div>
      <motion.div variants={fadeUp}>
        <textarea
          name="message"
          value={fields.message}
          onChange={handleChange}
          rows={5}
          placeholder={lang === "jp" ? "メッセージ" : "Your Message"}
          required
          className={inputClass}
          style={{ resize: "none" }}
        />
      </motion.div>

      {status === "error" && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-400 text-sm text-center"
        >
          {lang === "jp"
            ? "送信に失敗しました。もう一度お試しください。"
            : "Something went wrong. Please try again or email directly."}
        </motion.p>
      )}

      <motion.div variants={fadeUp}>
        <motion.button
          type="submit"
          disabled={status === "sending"}
          whileHover={status !== "sending" ? { scale: 1.03, y: -2 } : {}}
          whileTap={status !== "sending" ? { scale: 0.97 } : {}}
          className={btnClass}
        >
          <span className="relative z-10">
            {status === "sending"
              ? lang === "jp"
                ? "送信中…"
                : "Sending…"
              : emailMe}
          </span>
          {status !== "sending" && (
            <span className="absolute inset-0 animate-shimmer" />
          )}
        </motion.button>
      </motion.div>

      <motion.p
        variants={fadeUp}
        className={cn(
          "text-center text-xs pt-1",
          dark ? "text-white/20" : "text-[#7a4a35]/40"
        )}
      >
        {lang === "jp"
          ? "🔒 メッセージは安全に送信されます"
          : "🔒 Sent securely via Formspree — your email stays private"}
      </motion.p>
    </motion.form>
  );
}

// ─── Static data ──────────────────────────────────────────────────────────────
const texts = {
  en: {
    home: "Home",
    about: "About",
    projects: "Projects",
    certifications: "Certifications",
    contact: "Contact",
    resume: "Resume",
    name: "Pavan Kumar",
    heroRole: "",
    whoIAm: "Who I Am",
    skillsStack: "Skills & Stack",
    whatIBuilt: "What I've Built",
    credentials: "Credentials",
    getInTouch: "Get in Touch",
    heroDesc: "",
    contactMe: "Contact Me",
    myWork: "My Work",
    aboutMeTitle: "About Me",
    aboutMeDesc: "",
    education: "Education",
    educationDesc:
      "B.Tech ISE — N.M.A.M.I.T Institute of Technology, Nitte  ·  2024 – 2028",
    experience: "Experience",
    experienceList: [
      "Web Intern · ABC Corp  (May 2025 – July 2025)",
      "Freelance UI/UX & Frontend Projects",
    ],
    projectsTitle: "Projects",
    projectsList: [
      {
        title: "Sankat Saathi (संकट साथी)",
        tech: "React 18 · Vite · Tailwind · Supabase · IBM Z · Haversine AI",
        desc: "AI-powered humanitarian flood relief platform that optimizes emergency citizen SOS requests, explains urgency scores, and coordinates warehouse supply dispatches.",
        category: "Hackathon",
        github: "https://github.com/pavankumareng29/Sankat-Saathi-IBM-Z-Datathon-2026-Project",
        labUrl: "/engineering-lab/sankat-saathi",
        logo: "/projects/sankat-saathi/cover.png",
        emoji: "🌊",
      },
      {
        title: "Atlas Life OS",
        tech: "React · Vite · Tailwind · Framer Motion · Supabase · PWA",
        desc: "Personal life operating system featuring an intelligent college attendance & bunk margin simulator, CGPA planner, Pomodoro focus engine, and cognitive AI morning brief.",
        category: "Personal",
        github: "https://github.com/pavan55kumar/atlas",
        labUrl: "/engineering-lab/atlas",
        logo: "/projects/atlas/cover.png",
        emoji: "🧭",
      },
      {
        title: "Interactive 3D Portfolio",
        tech: "Next.js · React · Three.js · React Three Fiber · Drei · NextAuth",
        desc: "Modern personal portfolio with interactive 3D WebGL hero sphere, LinkedIn OAuth testimonials, and dedicated Engineering Lab deep-dives.",
        category: "Personal",
        github: "https://github.com/pavan55kumar/projectportfolio",
        labUrl: "/engineering-lab/portfolio-3d",
        logo: "data:image/jpeg;base64,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",
        emoji: "✨",
      },
      {
        title: "Spam Detection",
        tech: "Python · scikit-learn · NLTK · SpaCy · Streamlit · Transformers",
        desc: "Python ML app that detects spam messages using NLP pipelines and HuggingFace Transformers.",
        category: "Academic",
        github: "https://github.com/pavan55kumar/E-mail-Spam-Detection",
        emoji: "🛡️",
      },
      {
        title: "Note Saver App",
        tech: "Python · Flask · Jinja2 · HTML · CSS · JavaScript",
        desc: "A simple Flask web app with Python backend and dynamic HTML/CSS/JS frontend using Jinja2 templates.",
        category: "Personal",
        github: "https://github.com/pavan55kumar/FLASK-note-saver",
        emoji: "📝",
      },
    ],
    certificationsTitle: "Certifications",
    certificationsDesc:
      "A collection of my professional certifications. Click any card to view.",
    emailLabel: "Pavankumar.eng29@gmail.com",
    emailMe: "Send Message",
    testimonials: "Testimonials",
    whatOthersSay: "What Others Say",
    leaveTestimonial: "Leave a Testimonial",
    testimonialName: "Your Name",
    testimonialRole: "Role / Title",
    testimonialMessage: "Your Experience",
    testimonialLinkedin: "LinkedIn Profile URL",
    testimonialSubmit: "Submit Testimonial",
    testimonialSuccess: "Thank you so much!",
    testimonialSuccessDesc: "Your testimonial has been received.",
    testimonialSendAnother: "Leave another",
    testimonialPlaceholderMsg: "Share your experience working with or knowing Pavan...",
    noTestimonialsYet: "No testimonials yet",
    noTestimonialsDesc: "Be the first peer, colleague, or collaborator to share your experience working with Pavan! Sign in with your Google account to leave a testimonial, and paste your LinkedIn profile link.",
    leaveFirstTestimonial: "Leave the First Testimonial",
    engineeringLab: "Engineering Lab",
  },
  jp: {
    home: "ホーム",
    about: "私について",
    projects: "プロジェクト",
    certifications: "認定資格",
    contact: "連絡先",
    resume: "履歴書",
    name: "パヴァン・クマール",
    heroRole: "フルスタック開発者 & AI愛好家",
    whoIAm: "私は誰か",
    skillsStack: "スキルとスタック",
    whatIBuilt: "作ったもの",
    credentials: "資格・認定",
    getInTouch: "お問い合わせ",
    heroDesc:
      "NMAMITの2年生で、ウェブ開発、AI、インタラクティブなプロジェクトを探求しています。",
    contactMe: "お問い合わせ",
    myWork: "私の作品",
    aboutMeTitle: "私について",
    aboutMeDesc:
      "私はN.M.A.M工科大学ニッテの情報科学工学の2年生です。ウェブ開発、3Dビジュアル、インタラクティブなUIデザインに情熱を持っています。C、Python、HTML、CSS、Reactに精通しています。",
    education: "学歴",
    educationDesc: "B.Tech ISE — N.M.A.M工科大学ニッテ  ·  2024 – 2028",
    experience: "経験",
    experienceList: [
      "ウェブインターン · ABC社  (2025年5月 – 7月)",
      "フリーランスのUI/UXとフロントエンドプロジェクト",
    ],
    projectsTitle: "プロジェクト",
    projectsList: [
      {
        title: "サンカット・サーティ (Sankat Saathi)",
        tech: "React 18 · Vite · Tailwind · Supabase · IBM Z · ハバーサインAI",
        desc: "IBM Z Datathon 2026向けに構築されたAI洪水救援プラットフォーム。緊急SOSの優先順位付けと物資配分を自動化します。",
        category: "Hackathon",
        github: "https://github.com/pavankumareng29/Sankat-Saathi-IBM-Z-Datathon-2026-Project",
        labUrl: "/engineering-lab/sankat-saathi",
        logo: "/projects/sankat-saathi/cover.png",
        emoji: "🌊",
      },
      {
        title: "Atlas ライフOS",
        tech: "React · Vite · Tailwind · Framer Motion · Supabase · PWA",
        desc: "大学の出席欠席シミュレーター、CGPA計画、ポモドーロ集中タイマー、習慣ストリーク、AIブリーフィングを備えた統合学生ワークスペース。",
        category: "Personal",
        github: "https://github.com/pavan55kumar/atlas",
        labUrl: "/engineering-lab/atlas",
        logo: "/projects/atlas/cover.png",
        emoji: "🧭",
      },
      {
        title: "3Dインタラクティブポートフォリオ",
        tech: "Next.js · React · Three.js · React Three Fiber · Drei · NextAuth",
        desc: "Three.jsによるインタラクティブな3D WebGLシーンとLinkedIn認証の推薦状システムを備えた個人ポートフォリオ。",
        category: "Personal",
        github: "https://github.com/pavan55kumar/projectportfolio",
        labUrl: "/engineering-lab/portfolio-3d",
        logo: "data:image/jpeg;base64,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",
        emoji: "✨",
      },
      {
        title: "スパム検出",
        tech: "Python · scikit-learn · NLTK · SpaCy · Streamlit · Transformers",
        desc: "NLPとHuggingFace Transformersを使用したスパム検出MLアプリ。",
        category: "Academic",
        github: "https://github.com/pavan55kumar/E-mail-Spam-Detection",
        emoji: "🛡️",
      },
      {
        title: "ノート保存アプリ",
        tech: "Python · Flask · Jinja2 · HTML · CSS · JavaScript",
        desc: "PythonバックエンドとJinja2テンプレートを使用したFlaskウェブアプリ。",
        category: "Personal",
        github: "https://github.com/pavan55kumar/FLASK-note-saver",
        emoji: "📝",
      },
    ],
    certificationsTitle: "認定資格",
    certificationsDesc:
      "私の専門的な認定資格のコレクションです。カードをクリックしてご覧ください。",
    emailLabel: "Pavankumar.eng29@gmail.com",
    emailMe: "メールを送る",
    testimonials: "推薦状",
    whatOthersSay: "みんなの声",
    leaveTestimonial: "推薦状を書く",
    testimonialName: "お名前",
    testimonialRole: "役職・肩書き",
    testimonialMessage: "あなたの体験",
    testimonialLinkedin: "LinkedIn プロフィールURL",
    testimonialSubmit: "送信する",
    testimonialSuccess: "ありがとうございます！",
    testimonialSuccessDesc: "推薦状を受け取りました。",
    testimonialSendAnother: "もう一つ書く",
    testimonialPlaceholderMsg: "パヴァンとの仕事や交流の経験を共有してください...",
    noTestimonialsYet: "推薦状はまだありません",
    noTestimonialsDesc: "パヴァンとの協業やプロジェクトの体験を最初にシェアしませんか？Googleアカウントでサインインして、LinkedInプロフィールのリンクを添えて推薦状を投稿できます。",
    leaveFirstTestimonial: "最初の推薦状を書く",
    engineeringLab: "エンジニアリングラボ",
  },
};

const skills = [
  { label: "React", icon: <FaReact /> },
  { label: "Three.js" },
  { label: "Next.js" },
  { label: "Tailwind" },
  { label: "JavaScript", icon: <FaJsSquare /> },
  { label: "Python" },
  { label: "UI/UX" },
  { label: "GSAP" },
];

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
    // Single data URL (never split on comma because base64 has ;base64,)
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

const defaultCertFiles: string[] = [];

function getCardImages(card: any): string[] {
  const imgs = parseCertificateImages(card.imageUrl || card.image_url, card.images);
  if (imgs.length > 0) return imgs;
  return [];
}


// ─── Testimonials ──────────────────────────────────────────────────────────────
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
  seed?: boolean;
};

// ─── Testimonials Illustration ────────────────────────────────────────────────
function TestimonialsEmptyIllustration({ dark }: { dark: boolean }) {
  return (
    <div className="relative w-full max-w-[280px] sm:max-w-[300px] h-[125px] mx-auto flex items-center justify-center select-none pointer-events-none mb-3">
      {/* Back card */}
      <div
        className={cn(
          "absolute top-0.5 left-2 sm:left-3 w-[185px] sm:w-[195px] rounded-xl p-3 border shadow-md transition-transform",
          dark
            ? "bg-[#0f1728]/80 border-slate-700/40"
            : "bg-slate-100/90 border-slate-200"
        )}
      >
        <div className="flex items-center gap-2.5">
          <div
            className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center shrink-0 border",
              dark
                ? "bg-slate-800/80 border-slate-700/60 text-slate-500"
                : "bg-slate-200/80 border-slate-300 text-slate-400"
            )}
          >
            <FaUser className="text-[10px]" />
          </div>
          <div className="flex-1 space-y-1.5">
            <div
              className={cn(
                "h-2 w-20 rounded-full",
                dark ? "bg-slate-700/50" : "bg-slate-300/60"
              )}
            />
            <div
              className={cn(
                "h-1.5 w-12 rounded-full",
                dark ? "bg-slate-700/35" : "bg-slate-300/40"
              )}
            />
          </div>
        </div>
        <div
          className={cn(
            "h-1.5 w-full rounded-full mt-2.5",
            dark ? "bg-slate-700/30" : "bg-slate-300/35"
          )}
        />
      </div>

      {/* Front card */}
      <div
        className={cn(
          "absolute top-6 right-2 sm:right-3 w-[215px] sm:w-[225px] rounded-xl p-3 border shadow-2xl z-10 transition-transform",
          dark
            ? "bg-[#141e30] border-slate-700/70 shadow-[0_12px_32px_rgba(0,0,0,0.6)]"
            : "bg-white border-slate-200 shadow-[0_8px_25px_rgba(0,0,0,0.08)]"
        )}
      >
        <div className="flex items-start justify-between gap-2">
          {/* Avatar with PR and verified blue check badge */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative shrink-0">
              <div
                className={cn(
                  "w-8 h-8 rounded-full border flex items-center justify-center text-[11px] font-bold tracking-tight",
                  dark
                    ? "bg-[#182334] border-slate-600/70 text-slate-200"
                    : "bg-slate-100 border-slate-300 text-slate-700"
                )}
              >
                PR
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-[#1877f2] flex items-center justify-center border-2 border-[#141e30] text-white shadow-sm">
                <FaCheck className="text-[7px]" />
              </div>
            </div>

            <div className="flex-1 space-y-1.5 ml-1">
              <div
                className={cn(
                  "h-2 w-20 rounded-full",
                  dark ? "bg-slate-600/70" : "bg-slate-400/50"
                )}
              />
              <div
                className={cn(
                  "h-1.5 w-12 rounded-full",
                  dark ? "bg-slate-700/50" : "bg-slate-300/50"
                )}
              />
            </div>
          </div>

          {/* 5 Rating Dots */}
          <div className="flex items-center gap-1 shrink-0 pt-1">
            {[0, 1, 2, 3, 4].map((i) => (
              <span
                key={i}
                className={cn(
                  "w-1.5 h-1.5 rounded-full",
                  dark ? "bg-slate-600/80" : "bg-slate-300"
                )}
              />
            ))}
          </div>
        </div>

        {/* Lower placeholder line */}
        <div
          className={cn(
            "h-1.5 w-full rounded-full mt-2.5",
            dark ? "bg-slate-700/40" : "bg-slate-300/40"
          )}
        />
      </div>
    </div>
  );
}

function TestimonialsSection({
  dark,
  lang,
  t,
  inputClass,
}: {
  dark: boolean;
  lang: "en" | "jp";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  t: any;
  inputClass: string;
}) {
  const { data: session, status: sessionStatus } = useSession();
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ role: "", message: "", linkedin: "" });
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const authorName =
    session?.user?.name?.trim() || session?.user?.email?.split("@")[0] || "";
  const authorImage = session?.user?.image || undefined;
  const userProvider = "google";

  useEffect(() => {
    let isMounted = true;
    const fetchTestimonials = async () => {
      try {
        const res = await fetch("/api/testimonials");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && isMounted) {
            const realOnes = data.filter((item: Testimonial) => !item.seed && !item.id?.startsWith("s"));
            setTestimonials(realOnes);
            setLoading(false);
            return;
          }
        }
      } catch {
        // Fallback to client localStorage if server route fails
      }

      try {
        const saved = localStorage.getItem("pavan_testimonials");
        if (saved && isMounted) {
          const parsed: Testimonial[] = JSON.parse(saved);
          const realOnes = parsed.filter((item: Testimonial) => !item.seed && !item.id?.startsWith("s"));
          setTestimonials(realOnes);
        }
      } catch {}
      if (isMounted) setLoading(false);
    };

    fetchTestimonials();
    return () => { isMounted = false; };
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      sessionStatus !== "authenticated" ||
      !authorName ||
      !form.role.trim() ||
      !form.message.trim()
    ) return;

    const colors = ["#0A66C2", "#00d4ff", "#7c3aed", "#ec4899", "#f59e0b", "#10b981"];
    const newT: Testimonial = {
      id: Date.now().toString(),
      name: authorName,
      role: form.role.trim(),
      message: form.message.trim(),
      linkedin: form.linkedin.trim() || undefined,
      avatarImage: authorImage,
      initials: authorName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase(),
      avatarColor: colors[Math.floor(Math.random() * colors.length)],
      date: new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" }),
      provider: userProvider,
    };

    // Save to persistent server API
    try {
      await fetch("/api/testimonials", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newT),
      });
    } catch (err) {
      console.warn("Failed to save testimonial to server:", err);
    }

    // Update local storage and UI state
    try {
      const existing: Testimonial[] = JSON.parse(localStorage.getItem("pavan_testimonials") || "[]")
        .filter((item: Testimonial) => !item.seed && !item.id?.startsWith("s"));
      const updated = [newT, ...existing];
      localStorage.setItem("pavan_testimonials", JSON.stringify(updated));
      setTestimonials(updated);
    } catch {
      setTestimonials((prev) => [newT, ...prev]);
    }

    setStatus("success");
    setForm({ role: "", message: "", linkedin: "" });
  };

  const accent = dark ? "#00d4ff" : "#8b1a1a";

  return (
    <>
      <div className="max-w-6xl mx-auto px-6">
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
          </div>
        ) : testimonials.length === 0 ? (
          /* Empty state: Clean invite for real testimonials with Google sign-in */
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className={cn(
              "max-w-lg mx-auto rounded-3xl border p-8 sm:p-10 text-center space-y-6 overflow-hidden relative shadow-2xl",
              dark
                ? "bg-[#0c1424] border-slate-800/90 shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                : "bg-[#fffaf2]/90 border-[#8b1a1a]/15 shadow-xl"
            )}
          >
            <TestimonialsEmptyIllustration dark={dark} />

            <div className="space-y-2">
              <h3 className={cn("text-xl sm:text-2xl font-bold tracking-tight", dark ? "text-white" : "text-[#2a1008]")}>
                {t.noTestimonialsYet || (lang === "jp" ? "推薦状はまだありません" : "No testimonials yet")}
              </h3>
              <p className={cn("text-xs sm:text-sm leading-relaxed max-w-md mx-auto", dark ? "text-slate-400" : "text-[#7a4a35]/80")}>
                {t.noTestimonialsDesc || (lang === "jp"
                  ? "パヴァンとの協業やプロジェクトの体験を最初にシェアしませんか？Googleアカウントでサインインして、LinkedInプロフィールのリンクを添えて推薦状を投稿できます。"
                  : "Be the first peer, colleague, or collaborator to share your experience working with Pavan! Sign in with your Google account to leave a testimonial, and paste your LinkedIn profile link.")}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-2.5 pt-1">
              <span
                className={cn(
                  "inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full border shadow-sm",
                  dark
                    ? "border-slate-800/80 text-slate-300 bg-[#121c2e]"
                    : "border-[#8b1a1a]/15 text-[#7a4a35] bg-[#8b1a1a]/5"
                )}
              >
                <FaGoogle className="text-xs text-[#EA4335]" />
                <span>{lang === "jp" ? "Googleログイン" : "Google Sign-In"}</span>
              </span>

              <span
                className={cn(
                  "inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full border shadow-sm",
                  dark
                    ? "border-slate-800/80 text-slate-300 bg-[#121c2e]"
                    : "border-[#8b1a1a]/15 text-[#7a4a35] bg-[#8b1a1a]/5"
                )}
              >
                <FaLinkedin className="text-xs text-[#0A66C2]" />
                <span>{lang === "jp" ? "LinkedIn連携" : "LinkedIn Profile Badge"}</span>
              </span>
            </div>

            <motion.button
              type="button"
              whileHover={{ scale: 1.02, y: -1 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setShowForm((v) => !v); setStatus("idle"); }}
              className={cn(
                "w-full max-w-sm mx-auto flex items-center justify-center gap-2 rounded-xl py-3 px-6 font-semibold text-sm text-white shadow-lg transition-all duration-300 mt-2",
                dark
                  ? "bg-[#0066ff] hover:bg-[#0055dd] shadow-blue-600/30 hover:shadow-blue-600/40"
                  : "bg-gradient-to-r from-[#8b1a1a] to-[#c9956a] shadow-[0_4px_20px_rgba(139,26,26,0.3)] hover:shadow-[0_6px_30px_rgba(139,26,26,0.45)]"
              )}
            >
              {showForm ? <FaTimes className="text-xs" /> : <FaPenNib className="text-xs" />}
              <span>
                {showForm
                  ? (lang === "jp" ? "閉じる" : "Close Form")
                  : (t.leaveFirstTestimonial || (lang === "jp" ? "最初の推薦状を書く" : "Leave the First Testimonial"))}
              </span>
            </motion.button>
          </motion.div>
        ) : (
          /* Cards grid: Only real testimonials */
          <div className="grid sm:grid-cols-2 lg:grid-cols-2 max-w-4xl mx-auto gap-6">
            {testimonials.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className={cn(
                  "relative rounded-2xl border p-6 sm:p-7 flex flex-col justify-between group overflow-hidden transition-all duration-300",
                  dark
                    ? "bg-[#0a1324]/85 border-white/10 hover:border-cyan-400/30 hover:shadow-[0_8px_32px_rgba(0,212,255,0.1)]"
                    : "bg-[#fffaf2]/90 border-[#8b1a1a]/15 hover:border-[#8b1a1a]/35 shadow-[0_4px_20px_rgba(139,26,26,0.06)]"
                )}
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <p
                      className={cn(
                        "text-sm sm:text-base leading-relaxed italic font-medium flex-1",
                        dark ? "text-white/90" : "text-[#2a1008]"
                      )}
                    >
                      &ldquo;{item.message}&rdquo;
                    </p>
                    <span
                      className={cn(
                        "text-4xl sm:text-5xl font-serif leading-none select-none pointer-events-none -mt-2",
                        dark ? "text-white/20" : "text-[#8b1a1a]/20"
                      )}
                    >
                      ”
                    </span>
                  </div>

                  <div className="flex gap-1 mt-3">
                    {Array.from({ length: 5 }).map((_, si) => (
                      <span key={si} className="text-amber-400 text-sm">★</span>
                    ))}
                  </div>
                </div>

                <div
                  className={cn(
                    "w-full h-px my-4",
                    dark ? "bg-white/[0.08]" : "bg-[#8b1a1a]/10"
                  )}
                />

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 shadow overflow-hidden"
                      style={{
                        background: item.avatarColor || "#0A66C2",
                      }}
                    >
                      {item.avatarImage ? (
                        <Image
                          src={item.avatarImage}
                          alt={`${item.name}'s profile photo`}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      ) : (
                        item.initials || item.name.slice(0, 1).toUpperCase()
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className={cn("text-sm font-semibold truncate", dark ? "text-white" : "text-[#2a1008]")}>
                        {item.name}
                      </p>
                      <p className={cn("text-xs truncate", dark ? "text-white/50" : "text-[#7a4a35]/70")}>
                        {item.role}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {item.linkedin && (
                      <motion.a
                        href={item.linkedin.startsWith("http") ? item.linkedin : `https://${item.linkedin}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`${item.name}'s LinkedIn Profile`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.96 }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0A66C2]/15 border border-[#0A66C2]/35 text-[#38bdf8] hover:bg-[#0A66C2] hover:text-white transition-all shadow-sm"
                      >
                        <FaLinkedin className="text-xs text-[#0A66C2]" />
                        <span>LinkedIn</span>
                      </motion.a>
                    )}
                    <span className={cn("text-xs", dark ? "text-white/40" : "text-[#8b1a1a]/40")}>
                      {item.date}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Leave a testimonial toggle (Only shown when testimonials exist) */}
        <motion.div
          className={cn(testimonials.length > 0 ? "mt-10" : "mt-6", "flex flex-col items-center gap-6")}
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          {testimonials.length > 0 && (
            <motion.button
              type="button"
              whileHover={{ scale: 1.03, y: -1 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setShowForm((v) => !v); setStatus("idle"); }}
              aria-expanded={showForm}
              className={cn(
                "group relative inline-flex items-center gap-2.5 rounded-xl border px-6 py-2.5 text-xs sm:text-sm font-medium transition-all duration-300 shadow-md",
                dark
                  ? "border-slate-800 bg-[#0e1626] text-slate-300 hover:text-white hover:border-slate-700 hover:bg-[#131f33]"
                  : "border-[#8b1a1a]/20 bg-[#fffaf2] text-[#6f1919] hover:border-[#8b1a1a]/45 shadow-sm"
              )}
            >
              {showForm ? (
                <FaTimes className="text-xs text-slate-400" />
              ) : (
                <FaPenNib className="text-xs text-slate-400 group-hover:text-white transition-colors" />
              )}
              <span>{showForm ? (lang === "jp" ? "閉じる" : "Close") : t.leaveTestimonial}</span>
            </motion.button>
          )}

          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -10 }}
                animate={{ opacity: 1, height: "auto", y: 0 }}
                exit={{ opacity: 0, height: 0, y: -10 }}
                transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-2xl overflow-hidden"
              >
                {sessionStatus === "loading" ? (
                  <div className={cn(
                    "rounded-2xl border p-8 text-center text-sm",
                    dark ? "glass-card border-white/10 text-white/60" : "bg-[#f5ede0] border-[#8b1a1a]/15 text-[#7a4a35]"
                  )}>
                    {lang === "jp" ? "認証状態を確認しています..." : "Checking authentication..."}
                  </div>
                ) : !session?.user || !authorName ? (
                  <div className={cn(
                    "rounded-2xl border p-8 text-center space-y-5",
                    dark ? "glass-card border-white/10" : "bg-[#f5ede0]/80 border-[#8b1a1a]/15 shadow-[0_4px_32px_rgba(139,26,26,0.08)]"
                  )}>
                    <div
                      className="mx-auto w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-md border"
                      style={{
                        backgroundColor: "rgba(234, 67, 53, 0.1)",
                        borderColor: "rgba(234, 67, 53, 0.25)",
                        color: "#EA4335",
                      }}
                    >
                      <FaGoogle />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className={cn("text-xl font-bold", dark ? "text-white" : "text-[#2a1008]")}>
                        {lang === "jp" ? "Googleでサインイン" : "Sign in with Google"}
                      </h3>
                      <p className={cn("text-sm max-w-md mx-auto", dark ? "text-white/60" : "text-[#7a4a35]")}>
                        {lang === "jp"
                          ? "Googleアカウントでログインすると、お名前とプロフィール写真が自動的に使用されます。その後、LinkedInプロフィールのリンクを貼ることができます。"
                          : "Sign in with your Google account to automatically use your name & profile photo. You can then paste your LinkedIn link so your LinkedIn profile appears on your testimonial!"}
                      </p>
                    </div>
                    <div className="flex items-center justify-center pt-2">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.03, y: -1 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => void signIn("google")}
                        className="inline-flex items-center justify-center gap-3 rounded-xl px-8 py-3.5 font-semibold text-sm bg-white hover:bg-neutral-100 text-[#202124] shadow-lg shadow-black/10 border border-neutral-300 transition-all duration-200"
                      >
                        <FaGoogle className="text-base text-[#EA4335]" />
                        <span>{lang === "jp" ? "Googleで続行" : "Continue with Google"}</span>
                      </motion.button>
                    </div>
                  </div>
                ) : status === "success" ? (
                  <motion.div
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className={cn(
                      "rounded-3xl border p-10 text-center space-y-5 max-w-xl mx-auto shadow-xl",
                      dark
                        ? "bg-[#0a1324]/90 border-white/10 shadow-[0_12px_40px_rgba(0,0,0,0.4)]"
                        : "bg-[#fffaf2] border-[#8b1a1a]/15 shadow-lg"
                    )}
                  >
                    <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400 shadow-[0_0_24px_rgba(16,185,129,0.25)]">
                      <FaCheck className="text-2xl text-emerald-400" />
                    </div>
                    <div className="space-y-1.5">
                      <h3 className={cn("text-2xl font-bold tracking-tight", dark ? "text-white" : "text-[#2a1008]")}>
                        {t.testimonialSuccess || (lang === "jp" ? "ありがとうございます！" : "Thank you so much!")}
                      </h3>
                      <p className={cn("text-sm", dark ? "text-white/60" : "text-[#7a4a35]")}>
                        {t.testimonialSuccessDesc || (lang === "jp" ? "推薦状を受け取りました。" : "Your testimonial has been received.")}
                      </p>
                    </div>
                    <div className="pt-2">
                      <motion.button
                        type="button"
                        whileHover={{ scale: 1.03, y: -1 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => { setStatus("idle"); setShowForm(true); }}
                        className={cn(
                          "inline-flex items-center gap-3 px-6 py-3 rounded-xl border text-sm font-semibold transition-all duration-300",
                          dark
                            ? "border-cyan-400/30 bg-[#0c1b2f]/90 text-white hover:border-cyan-400/60 hover:bg-[#11243e] shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                            : "border-[#8b1a1a]/25 bg-[#fffaf2] text-[#8b1a1a] hover:border-[#8b1a1a]/50 shadow-sm"
                        )}
                      >
                        <FaPenNib className="text-xs" />
                        <span>{t.testimonialSendAnother || (lang === "jp" ? "もう一つ書く" : "Leave another")}</span>
                        <FaArrowRight className="text-xs text-cyan-400" />
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.form
                    onSubmit={handleSubmit}
                    className={cn(
                      "rounded-2xl border p-7 space-y-5",
                      dark ? "glass-card border-white/10" : "bg-[#f5ede0]/80 border-[#8b1a1a]/15 shadow-[0_4px_32px_rgba(139,26,26,0.08)]"
                    )}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    noValidate
                  >
                    <div className="space-y-1">
                      <h3 className={cn("text-lg font-bold", dark ? "text-white" : "text-[#2a1008]")}>
                        {t.leaveTestimonial}
                      </h3>
                      <p className={cn("text-xs", dark ? "text-white/35" : "text-[#7a4a35]/70")}>
                        {lang === "jp" ? "あなたの声がポートフォリオをより充実させます" : "Your words help visitors understand who I am as a collaborator"}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {[
                        { icon: <FaGoogle className="text-xs text-[#EA4335]" />, text: lang === "jp" ? "Google認証済み" : "Google Signed-In" },
                        { icon: <FaLinkedin className="text-xs text-[#0A66C2]" />, text: lang === "jp" ? "LinkedIn連携可能" : "LinkedIn Profile Badge" },
                      ].map(({ icon, text }, idx) => (
                        <span
                          key={idx}
                          className={cn(
                            "inline-flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full border",
                            dark ? "border-white/8 text-white/50 bg-white/3" : "border-[#8b1a1a]/12 text-[#7a4a35]/80 bg-[#8b1a1a]/4"
                          )}
                        >
                          <span>{icon}</span>{text}
                        </span>
                      ))}
                    </div>

                    <div className={cn(
                      "flex items-center gap-3 rounded-xl border px-4 py-3",
                      dark ? "border-white/10 bg-white/3" : "border-[#8b1a1a]/12 bg-white/40"
                    )}>
                      <div className="relative w-11 h-11 rounded-full shrink-0 overflow-hidden flex items-center justify-center text-sm font-bold text-white shadow border border-white/20"
                        style={{ background: `linear-gradient(135deg, ${accent} 0%, ${accent}99 100%)` }}>
                        {authorImage ? (
                          <Image
                            src={authorImage}
                            alt={`${authorName}'s profile photo`}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        ) : authorName.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-semibold truncate", dark ? "text-white" : "text-[#2a1008]")}>
                          {authorName}
                        </p>
                        <p className={cn("text-xs flex items-center gap-1.5", dark ? "text-white/40" : "text-[#7a4a35]/70")}>
                          <FaGoogle className="text-[10px] text-[#EA4335]" />
                          <span>{lang === "jp" ? "Googleアカウントでログイン中" : "Signed in with Google"}</span>
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => void signOut()}
                        className={cn("text-xs font-semibold underline underline-offset-4", dark ? "text-white/50 hover:text-white" : "text-[#8b1a1a]/70 hover:text-[#8b1a1a]")}
                      >
                        {lang === "jp" ? "ログアウト" : "Sign out"}
                      </button>
                    </div>

                    <div className="space-y-1.5">
                      <label className={cn("text-xs font-semibold tracking-wide uppercase", dark ? "text-white/40" : "text-[#7a4a35]/70")}>
                        {t.testimonialRole} *
                      </label>
                      <input
                        type="text"
                        name="role"
                        value={form.role}
                        onChange={handleChange}
                        placeholder={lang === "jp" ? "エンジニア · NMAMIT" : "Peer · ISE'28 · NMAMIT"}
                        required
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className={cn("text-xs font-semibold tracking-wide uppercase", dark ? "text-white/40" : "text-[#7a4a35]/70")}>
                        {t.testimonialMessage} *
                      </label>
                      <textarea
                        name="message"
                        value={form.message}
                        onChange={handleChange}
                        rows={4}
                        placeholder={t.testimonialPlaceholderMsg}
                        required
                        style={{ resize: "none" }}
                        className={inputClass}
                      />
                    </div>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <label className={cn("text-xs font-semibold tracking-wide uppercase", dark ? "text-white/40" : "text-[#7a4a35]/70")}>
                          {t.testimonialLinkedin}
                        </label>
                        <span className={cn("text-[11px] font-medium", dark ? "text-cyan-300/80" : "text-[#8b1a1a]/80")}>
                          {lang === "jp" ? "カードに表示されます" : "Displayed on your testimonial"}
                        </span>
                      </div>
                      <p className={cn("text-xs leading-normal", dark ? "text-white/45" : "text-[#7a4a35]/75")}>
                        {lang === "jp"
                          ? "あなたのLinkedInプロフィールのリンクを貼り付けてください。推薦状にあなたのLinkedInリンクが表示されます。"
                          : "Paste your LinkedIn profile link (e.g. https://linkedin.com/in/username) so visitors can view and verify your LinkedIn profile."}
                      </p>
                      <div className="relative">
                        <FaLinkedin
                          className={cn("absolute left-3.5 top-1/2 -translate-y-1/2 text-sm pointer-events-none text-[#0A66C2]")}
                        />
                        <input
                          type="url"
                          name="linkedin"
                          value={form.linkedin}
                          onChange={handleChange}
                          placeholder="https://linkedin.com/in/yourprofile"
                          className={cn(inputClass, "pl-10")}
                        />
                      </div>
                      {form.linkedin.trim() && (
                        <div className="flex items-center gap-1.5 text-xs text-[#0A66C2] font-medium pt-1">
                          <FaLinkedin className="text-xs" />
                          <span className="truncate">
                            {lang === "jp" ? "リンクされたプロフィール: " : "LinkedIn profile linked: "}
                            {form.linkedin.trim()}
                          </span>
                        </div>
                      )}
                    </div>

                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={!form.role.trim() || !form.message.trim()}
                      className={cn(
                        "relative w-full overflow-hidden px-8 py-4 rounded-xl font-semibold text-sm text-white transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed",
                        dark
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_30px_rgba(0,212,255,0.3)] hover:shadow-[0_0_50px_rgba(0,212,255,0.4)]"
                          : "bg-gradient-to-r from-[#8b1a1a] to-[#c9956a] shadow-[0_4px_24px_rgba(139,26,26,0.3)] hover:shadow-[0_6px_40px_rgba(139,26,26,0.45)]"
                      )}
                    >
                      <span className="relative z-10 flex items-center justify-center gap-2">
                        <span>✍️</span> {t.testimonialSubmit}
                      </span>
                      <span className="absolute inset-0 animate-shimmer" />
                    </motion.button>
                  </motion.form>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
const sectionIds = ["home", "about", "projects", "certifications", "testimonials", "contact"] as const;

const PROJECT_CATEGORIES = ["All", "Personal", "Academic", "Hackathon", "Open Source"] as const;
const CERTIFICATE_CATEGORIES = ["All", "Course Certificate", "Internship", "Achievement", "Academic Recognition"] as const;

export default function Home() {
  const { dark, toggle: toggleTheme } = useTheme(); // shared with Engineering Lab
  const [showNav, setShowNav] = useState(true);
  const [lang, setLang] = useState<"en" | "jp">("en");
  const [certOpen, setCertOpen] = useState(false);
  const [certIndex, setCertIndex] = useState(0);
  const [certModalImages, setCertModalImages] = useState<string[]>([]);
  const [certModalTitle, setCertModalTitle] = useState<string>("");
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [dynamicProjects, setDynamicProjects] = useState<any[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  const [dynamicCertificates, setDynamicCertificates] = useState<any[]>([]);
  const [certsLoading, setCertsLoading] = useState(true);

  const [activeProjectCategory, setActiveProjectCategory] = useState<string>("All");
  const [activeCertCategory, setActiveCertCategory] = useState<string>("All");

  const [siteProfile, setSiteProfile] = useState<{ heroDesc?: string; aboutMeDesc?: string; heroRole?: string } | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [dynamicEducation, setDynamicEducation] = useState<any[]>([]);
  const [educationLoading, setEducationLoading] = useState(true);

  const [dynamicExperience, setDynamicExperience] = useState<any[]>([]);
  const [experienceLoading, setExperienceLoading] = useState(true);

  const [dynamicSkills, setDynamicSkills] = useState<any[]>([]);
  const [skillsLoading, setSkillsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    fetch("/api/projects", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (isMounted) {
          if (Array.isArray(data)) setDynamicProjects(data);
          setProjectsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setProjectsLoading(false);
      });

    fetch("/api/certificates", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (isMounted) {
          if (Array.isArray(data)) setDynamicCertificates(data);
          setCertsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setCertsLoading(false);
      });

    fetch("/api/profile", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (isMounted) {
          if (data && typeof data === "object") setSiteProfile(data);
          setProfileLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setProfileLoading(false);
      });

    fetch("/api/education", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (isMounted) {
          if (Array.isArray(data)) setDynamicEducation(data);
          setEducationLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setEducationLoading(false);
      });

    fetch("/api/experience", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (isMounted) {
          if (Array.isArray(data)) setDynamicExperience(data);
          setExperienceLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setExperienceLoading(false);
      });

    fetch("/api/skills", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (isMounted) {
          if (Array.isArray(data)) setDynamicSkills(data);
          setSkillsLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) setSkillsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const isMobile = useMediaQuery("(max-width: 767px)");

  const scrollRef = useRef<HTMLDivElement>(null);
  const pausedUntilRef = useRef<number>(0);
  const heroRef = useRef<HTMLElement>(null);

  // 3D scene mobile touch & gyroscope orientation state
  const touchState = useRef<TouchControllerState>({
    rotX: 0,
    rotY: 0,
    velX: 0,
    velY: 0,
    ambientRotX: 0,
    ambientRotY: 0,
    tiltX: 0,
    tiltY: 0,
  });

  // Mobile touch drag & gyroscope tilt listener (non-blocking for smooth scrolling)
  useEffect(() => {
    let lastTouchX = 0;
    let lastTouchY = 0;
    let isTouching = false;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        isTouching = true;
        lastTouchX = e.touches[0].clientX;
        lastTouchY = e.touches[0].clientY;
        touchState.current.velX = 0;
        touchState.current.velY = 0;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (!isTouching || e.touches.length !== 1) return;
      const clientX = e.touches[0].clientX;
      const clientY = e.touches[0].clientY;
      const dx = clientX - lastTouchX;
      const dy = clientY - lastTouchY;

      // Only engage if user is interacting within hero region
      if (window.scrollY < window.innerHeight * 1.2) {
        touchState.current.rotY += dx * 0.007;
        touchState.current.rotX += dy * 0.007;
        touchState.current.velX = dx * 0.004;
        touchState.current.velY = dy * 0.004;
      }

      lastTouchX = clientX;
      lastTouchY = clientY;
    };

    const onTouchEnd = () => {
      isTouching = false;
    };

    // Mobile gyroscope tilt reaction
    const onDeviceOrientation = (e: DeviceOrientationEvent) => {
      if (window.scrollY > window.innerHeight) return;
      if (e.gamma !== null && e.beta !== null) {
        const normGamma = Math.max(-45, Math.min(45, e.gamma));
        const normBeta = Math.max(-45, Math.min(45, e.beta - 40));
        touchState.current.tiltX = (normGamma / 45) * 0.45;
        touchState.current.tiltY = (normBeta / 45) * 0.45;
      }
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });

    if (typeof window !== "undefined" && "DeviceOrientationEvent" in window) {
      window.addEventListener("deviceorientation", onDeviceOrientation, { passive: true });
    }

    return () => {
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      if (typeof window !== "undefined" && "DeviceOrientationEvent" in window) {
        window.removeEventListener("deviceorientation", onDeviceOrientation);
      }
    };
  }, []);

  const { scrollYProgress } = useScroll();
  const progressScaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  const { scrollYProgress: heroScrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(heroScrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(heroScrollYProgress, [0, 0.8], [1, 0]);

  const t = texts[lang];

  const allProjects = dynamicProjects;
  const filteredProjects = activeProjectCategory === "All"
    ? allProjects
    : allProjects.filter((p: any) => {
        const cat = (p.category || "Personal").toString().trim().toLowerCase();
        return cat === activeProjectCategory.trim().toLowerCase();
      });

  const rawCertificates = dynamicCertificates;
  const allCertificates = rawCertificates.filter((c: any) => {
    if (!c || !c.title) return false;
    const title = c.title.trim().toLowerCase();
    return title !== "add your certificate" && !title.includes("add your certificate");
  });
  const filteredCertificates = activeCertCategory === "All"
    ? allCertificates
    : allCertificates.filter((c: any) => {
        const cat = (c.category || "Course Certificate").toString().trim().toLowerCase();
        return cat === activeCertCategory.trim().toLowerCase();
      });

  const sectionLabels: Record<(typeof sectionIds)[number], string> = {
    home: t.home,
    about: t.about,
    projects: t.projects,
    certifications: t.certifications,
    testimonials: t.testimonials,
    contact: t.contact,
  };

  // Nav show/hide + background
  useEffect(() => {
    let lastY = 0;
    const onScroll = () => {
      const y = window.scrollY;
      setNavScrolled(y > 30);
      setShowNav(y < 50 || y < lastY);
      lastY = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock page scroll while the mobile menu is open
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  // Close the menu if the screen grows to desktop size
  useEffect(() => {
    if (!isMobile) setMobileMenuOpen(false);
  }, [isMobile]);

  // Reliable section navigation (works from the mobile menu too)
  const goTo = useCallback(
    (id: string) => (e: React.MouseEvent) => {
      e.preventDefault();
      setMobileMenuOpen(false);
      window.setTimeout(() => {
        const el = document.getElementById(id);
        if (!el) return;
        const top =
          id === "home"
            ? 0
            : el.getBoundingClientRect().top + window.scrollY - 12;
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
        window.history.replaceState(null, "", `#${id}`);
      }, 80);
    },
    []
  );

  // Active section tracking
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { rootMargin: "-40% 0px -55% 0px" }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  // Projects auto-scroll
  useEffect(() => {
    const id = setInterval(() => {
      const el = scrollRef.current;
      if (!el || Date.now() < pausedUntilRef.current) return;
      const max = el.scrollWidth - el.clientWidth;
      el.scrollLeft >= max - 10
        ? el.scrollTo({ left: 0, behavior: "smooth" })
        : el.scrollBy({ left: 340, behavior: "smooth" });
    }, 3800);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const pause = () => {
      pausedUntilRef.current = Date.now() + 6000;
    };
    el.addEventListener("scroll", pause, { passive: true });
    el.addEventListener("pointerdown", pause);
    el.addEventListener("wheel", pause, { passive: true });
    return () => {
      el.removeEventListener("scroll", pause);
      el.removeEventListener("pointerdown", pause);
      el.removeEventListener("wheel", pause);
    };
  }, [activeProjectCategory]);

  // Cert modal
  const openCert = (images: string[], i = 0, title = "") => {
    const list = images.length > 0 ? images : defaultCertFiles;
    setCertModalImages(list);
    setCertIndex(Math.max(0, Math.min(i, list.length - 1)));
    setCertModalTitle(title);
    setCertOpen(true);
  };
  const closeCert = useCallback(() => setCertOpen(false), []);
  const showPrev = useCallback(() => {
    setCertModalImages((imgs) => {
      if (imgs.length <= 1) return imgs;
      setCertIndex((i) => (i - 1 + imgs.length) % imgs.length);
      return imgs;
    });
  }, []);
  const showNext = useCallback(() => {
    setCertModalImages((imgs) => {
      if (imgs.length <= 1) return imgs;
      setCertIndex((i) => (i + 1) % imgs.length);
      return imgs;
    });
  }, []);

  useEffect(() => {
    if (!certOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCert();
      if (certModalImages.length > 1) {
        if (e.key === "ArrowLeft") showPrev();
        if (e.key === "ArrowRight") showNext();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [certOpen, closeCert, showPrev, showNext, certModalImages.length]);

  const inputClass = dark
    ? "w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-cyan-400/60 transition-all duration-300 backdrop-blur-sm text-sm"
    : "w-full px-4 py-3 rounded-xl bg-[#ede0cc]/60 border border-[#8b1a1a]/18 text-[#2a1008] placeholder-[#7a4a35]/50 focus:outline-none focus:border-[#8b1a1a]/50 focus:bg-[#ede0cc]/90 transition-all duration-300 text-sm";

  const socials = [
    { href: "https://github.com/pavan55kumar", icon: <FaGithub />, label: "GitHub" },
    { href: "https://www.linkedin.com/in/pavan-kumar-6864b2320", icon: <FaLinkedin />, label: "LinkedIn" },
  ];

  return (
    <div
      className={cn(
        "min-h-screen font-sans overflow-x-hidden transition-colors duration-700 relative",
        dark
          ? "bg-[#030712] text-white"
          : "bg-[#f5ede0] text-[#2a1008] light-mode"
      )}
    >
      {/* ── Scroll progress bar ── */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-[3px] z-[9998] origin-left"
        style={{
          scaleX: progressScaleX,
          background: dark
            ? "linear-gradient(90deg, #00d4ff, #7c3aed)"
            : "linear-gradient(90deg, #8b1a1a, #c9956a)",
        }}
      />

      <CursorGlow dark={dark} />
      <GrainOverlay />

      {/* Background atmosphere */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div
          className="absolute -top-40 -left-40 w-[700px] h-[700px] rounded-full"
          style={{
            background: dark
              ? "radial-gradient(circle, #0ea5e9 0%, transparent 70%)"
              : "radial-gradient(circle, #c9956a 0%, transparent 70%)",
            filter: "blur(80px)",
            opacity: dark ? 0.2 : 0.35,
          }}
        />
        <div
          className="absolute -bottom-40 -right-20 w-[600px] h-[600px] rounded-full"
          style={{
            background: dark
              ? "radial-gradient(circle, #7c3aed 0%, transparent 70%)"
              : "radial-gradient(circle, #8b1a1a 0%, transparent 70%)",
            filter: "blur(100px)",
            opacity: dark ? 0.15 : 0.22,
          }}
        />
        {!dark && (
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full"
            style={{
              background: "radial-gradient(circle, #e8c9a0 0%, transparent 70%)",
              filter: "blur(120px)",
              opacity: 0.5,
            }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: dark
              ? "linear-gradient(rgba(255,255,255,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.3) 1px,transparent 1px)"
              : "linear-gradient(rgba(139,26,26,0.06) 1px,transparent 1px),linear-gradient(90deg,rgba(139,26,26,0.06) 1px,transparent 1px)",
            backgroundSize: "80px 80px",
            opacity: dark ? 0.03 : 1,
          }}
        />
      </div>

      {/* FABs */}
      <div className="fixed bottom-6 right-5 sm:bottom-8 sm:right-8 z-30 flex flex-col gap-3 transition-opacity duration-300">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Toggle Dark Mode"
          title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          onClick={toggleTheme}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center text-lg shadow-xl transition-all duration-300",
            dark
              ? "glass border border-white/15 hover:border-cyan-400/50"
              : "bg-[#f5ede0] border border-[#8b1a1a]/25 hover:border-[#8b1a1a]/60 shadow-[0_2px_16px_rgba(139,26,26,0.15)]"
          )}
        >
          {dark ? "☀️" : "🌙"}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          aria-label="Toggle Language"
          title={lang === "en" ? "Switch to Japanese" : "Switch to English"}
          onClick={() => setLang(lang === "en" ? "jp" : "en")}
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center text-xs font-bold shadow-xl transition-all duration-300",
            dark
              ? "glass border border-white/15 text-cyan-300 hover:border-cyan-400/50"
              : "bg-[#f5ede0] border border-[#8b1a1a]/25 text-[#8b1a1a] hover:border-[#8b1a1a]/60 shadow-[0_2px_16px_rgba(139,26,26,0.15)]"
          )}
        >
          {lang === "en" ? "JP" : "EN"}
        </motion.button>
      </div>

      {/* ── NAVBAR ── */}
      <motion.nav
        initial={false}
        animate={{
          y: showNav || mobileMenuOpen ? 0 : -100,
          opacity: showNav || mobileMenuOpen ? 1 : 0,
        }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={cn(
          "fixed w-full top-0 z-40 transition-all duration-500",
          navScrolled && !mobileMenuOpen
            ? dark
              ? "glass border-b border-white/8 shadow-2xl"
              : "bg-[#f5ede0]/95 backdrop-blur-xl border-b border-[#8b1a1a]/15 shadow-[0_2px_24px_rgba(139,26,26,0.12)]"
            : "bg-transparent border-b border-transparent"
        )}
      >
        <div className="max-w-6xl mx-auto px-6 py-3 sm:py-4 flex items-center justify-between">
          <motion.a
            href="#home"
            className="text-xl font-extrabold text-gradient"
            whileHover={{ scale: 1.03 }}
            onClick={goTo("home")}
          >
            {t.name}
          </motion.a>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-1">
            {sectionIds.map((id) => {
              const isActive = activeSection === id;
              return (
                <a
                  key={id}
                  href={`#${id}`}
                  onClick={goTo(id)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    isActive
                      ? dark
                        ? "text-cyan-300 bg-cyan-400/10"
                        : "text-[#8b1a1a] bg-[#8b1a1a]/10 font-semibold"
                      : dark
                      ? "text-white/60 hover:text-white hover:bg-white/6"
                      : "text-[#7a4a35] hover:text-[#2a1008] hover:bg-[#8b1a1a]/8"
                  )}
                >
                  {sectionLabels[id]}
                </a>
              );
            })}
            <Link
              href="/connect"
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                dark
                  ? "text-white/60 hover:text-white hover:bg-white/6"
                  : "text-[#7a4a35] hover:text-[#2a1008] hover:bg-[#8b1a1a]/8"
              )}
            >
              {t.engineeringLab}
            </Link>
            <a
              href="/resume.pdf"
              download
              className={cn(
                "ml-3 px-4 py-2 rounded-lg text-sm font-semibold border transition-all duration-300",
                dark
                  ? "border-cyan-400/40 text-cyan-300 hover:bg-cyan-400/10 hover:border-cyan-400/70"
                  : "border-[#8b1a1a]/40 text-[#8b1a1a] hover:bg-[#8b1a1a]/10 hover:border-[#8b1a1a]/70"
              )}
            >
              {t.resume}
            </a>
          </div>

          {/* Hamburger */}
          <button
            type="button"
            className={cn(
              "md:hidden relative h-11 w-11 rounded-full border transition-all duration-200",
              dark
                ? "border-white/15 text-white hover:bg-white/8"
                : "border-[#8b1a1a]/20 text-[#2a1008] hover:bg-[#8b1a1a]/8",
              mobileMenuOpen && (dark ? "bg-white/10 border-white/30" : "bg-[#8b1a1a]/10 border-[#8b1a1a]/30")
            )}
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((o) => !o)}
          >
            <motion.span
              className="absolute left-1/2 top-1/2 -ml-[10px] -mt-px h-[1.5px] w-5 rounded-full bg-current"
              animate={{ y: mobileMenuOpen ? 0 : -4, rotate: mobileMenuOpen ? 45 : 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            />
            <motion.span
              className="absolute left-1/2 top-1/2 -ml-[10px] -mt-px h-[1.5px] w-5 rounded-full bg-current"
              animate={{ y: mobileMenuOpen ? 0 : 4, rotate: mobileMenuOpen ? -45 : 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            />
          </button>
        </div>
      </motion.nav>

      {/* ── MOBILE MENU (minimal floating popover card) ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop click-away */}
            <motion.div
              key="mobile-menu-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-40 bg-black/25 backdrop-blur-[2px] md:hidden"
              aria-hidden="true"
            />

            {/* Floating Popover Card */}
            <motion.div
              key="mobile-menu-card"
              initial={{ opacity: 0, scale: 0.92, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: -10 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className={cn(
                "fixed top-[66px] right-4 sm:right-6 z-50 md:hidden w-[280px] rounded-[26px] p-3 shadow-2xl origin-top-right border select-none",
                dark
                  ? "bg-[#070f1e]/96 border-white/12 text-white shadow-[0_22px_60px_rgba(0,0,0,0.7)] backdrop-blur-2xl"
                  : "bg-[#fffaf2]/98 border-[#8b1a1a]/15 text-[#2a1008] shadow-[0_20px_50px_rgba(42,16,8,0.18)] backdrop-blur-2xl"
              )}
            >
              {/* Pointer Beak pointing up toward the hamburger button */}
              <div
                className={cn(
                  "absolute -top-[7px] right-[23px] w-3.5 h-3.5 rotate-45 border-t border-l pointer-events-none",
                  dark
                    ? "bg-[#070f1e] border-white/12"
                    : "bg-[#fffaf2] border-[#8b1a1a]/15"
                )}
              />

              {/* Navigation Items */}
              <nav className="flex flex-col space-y-1" aria-label="Mobile Navigation">
                {/* 1. Home */}
                <a
                  href="#home"
                  onClick={goTo("home")}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[15px] transition-colors",
                    activeSection === "home"
                      ? dark
                        ? "bg-cyan-400/15 text-cyan-300 font-semibold"
                        : "bg-[#8b1a1a]/10 text-[#8b1a1a] font-semibold"
                      : dark
                        ? "text-white/80 hover:bg-white/8 hover:text-white"
                        : "text-[#2a1008]/80 hover:bg-[#8b1a1a]/6 hover:text-[#8b1a1a]"
                  )}
                >
                  <div className="flex items-center gap-3.5">
                    <FiHome className="text-lg shrink-0" />
                    <span>{sectionLabels.home}</span>
                  </div>
                  {activeSection === "home" && (
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full shrink-0",
                        dark ? "bg-cyan-400" : "bg-[#8b1a1a]"
                      )}
                    />
                  )}
                </a>

                {/* 2. About */}
                <a
                  href="#about"
                  onClick={goTo("about")}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[15px] transition-colors",
                    activeSection === "about"
                      ? dark
                        ? "bg-cyan-400/15 text-cyan-300 font-semibold"
                        : "bg-[#8b1a1a]/10 text-[#8b1a1a] font-semibold"
                      : dark
                        ? "text-white/80 hover:bg-white/8 hover:text-white"
                        : "text-[#2a1008]/80 hover:bg-[#8b1a1a]/6 hover:text-[#8b1a1a]"
                  )}
                >
                  <div className="flex items-center gap-3.5">
                    <FiUser className="text-lg shrink-0" />
                    <span>{sectionLabels.about}</span>
                  </div>
                  {activeSection === "about" && (
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full shrink-0",
                        dark ? "bg-cyan-400" : "bg-[#8b1a1a]"
                      )}
                    />
                  )}
                </a>

                {/* 3. Projects */}
                <a
                  href="#projects"
                  onClick={goTo("projects")}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[15px] transition-colors",
                    activeSection === "projects"
                      ? dark
                        ? "bg-cyan-400/15 text-cyan-300 font-semibold"
                        : "bg-[#8b1a1a]/10 text-[#8b1a1a] font-semibold"
                      : dark
                        ? "text-white/80 hover:bg-white/8 hover:text-white"
                        : "text-[#2a1008]/80 hover:bg-[#8b1a1a]/6 hover:text-[#8b1a1a]"
                  )}
                >
                  <div className="flex items-center gap-3.5">
                    <FiFolder className="text-lg shrink-0" />
                    <span>{sectionLabels.projects}</span>
                  </div>
                  {activeSection === "projects" && (
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full shrink-0",
                        dark ? "bg-cyan-400" : "bg-[#8b1a1a]"
                      )}
                    />
                  )}
                </a>

                {/* 4. Certifications */}
                <a
                  href="#certifications"
                  onClick={goTo("certifications")}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[15px] transition-colors",
                    activeSection === "certifications"
                      ? dark
                        ? "bg-cyan-400/15 text-cyan-300 font-semibold"
                        : "bg-[#8b1a1a]/10 text-[#8b1a1a] font-semibold"
                      : dark
                        ? "text-white/80 hover:bg-white/8 hover:text-white"
                        : "text-[#2a1008]/80 hover:bg-[#8b1a1a]/6 hover:text-[#8b1a1a]"
                  )}
                >
                  <div className="flex items-center gap-3.5">
                    <FiAward className="text-lg shrink-0" />
                    <span>{sectionLabels.certifications}</span>
                  </div>
                  {activeSection === "certifications" && (
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full shrink-0",
                        dark ? "bg-cyan-400" : "bg-[#8b1a1a]"
                      )}
                    />
                  )}
                </a>

                {/* 5. Testimonials */}
                <a
                  href="#testimonials"
                  onClick={goTo("testimonials")}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[15px] transition-colors",
                    activeSection === "testimonials"
                      ? dark
                        ? "bg-cyan-400/15 text-cyan-300 font-semibold"
                        : "bg-[#8b1a1a]/10 text-[#8b1a1a] font-semibold"
                      : dark
                        ? "text-white/80 hover:bg-white/8 hover:text-white"
                        : "text-[#2a1008]/80 hover:bg-[#8b1a1a]/6 hover:text-[#8b1a1a]"
                  )}
                >
                  <div className="flex items-center gap-3.5">
                    <FiMessageSquare className="text-lg shrink-0" />
                    <span>{sectionLabels.testimonials}</span>
                  </div>
                  {activeSection === "testimonials" && (
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full shrink-0",
                        dark ? "bg-cyan-400" : "bg-[#8b1a1a]"
                      )}
                    />
                  )}
                </a>

                {/* 6. Engineering Lab */}
                <Link
                  href="/connect"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[15px] transition-colors",
                    dark
                      ? "text-white/80 hover:bg-white/8 hover:text-white"
                      : "text-[#2a1008]/80 hover:bg-[#8b1a1a]/6 hover:text-[#8b1a1a]"
                  )}
                >
                  <div className="flex items-center gap-3.5">
                    <FiBriefcase className="text-lg shrink-0" />
                    <span>{t.engineeringLab}</span>
                  </div>
                </Link>

                {/* 7. Contact */}
                <a
                  href="#contact"
                  onClick={goTo("contact")}
                  className={cn(
                    "flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-[15px] transition-colors",
                    activeSection === "contact"
                      ? dark
                        ? "bg-cyan-400/15 text-cyan-300 font-semibold"
                        : "bg-[#8b1a1a]/10 text-[#8b1a1a] font-semibold"
                      : dark
                        ? "text-white/80 hover:bg-white/8 hover:text-white"
                        : "text-[#2a1008]/80 hover:bg-[#8b1a1a]/6 hover:text-[#8b1a1a]"
                  )}
                >
                  <div className="flex items-center gap-3.5">
                    <FiMail className="text-lg shrink-0" />
                    <span>{sectionLabels.contact}</span>
                  </div>
                  {activeSection === "contact" && (
                    <span
                      className={cn(
                        "h-2 w-2 rounded-full shrink-0",
                        dark ? "bg-cyan-400" : "bg-[#8b1a1a]"
                      )}
                    />
                  )}
                </a>
              </nav>

              {/* Subtle Divider */}
              <div
                className={cn(
                  "my-2.5 border-t",
                  dark ? "border-white/10" : "border-[#8b1a1a]/10"
                )}
              />

              {/* Bottom Actions: Socials + Resume Button */}
              <div className="flex items-center justify-between px-2 pt-0.5 pb-1">
                <div className="flex items-center gap-3.5">
                  <a
                    href="https://github.com/pavan55kumar"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="GitHub"
                    className={cn(
                      "text-xl transition-colors",
                      dark ? "text-white/70 hover:text-white" : "text-[#2a1008]/75 hover:text-[#8b1a1a]"
                    )}
                  >
                    <FaGithub />
                  </a>
                  <a
                    href="https://www.linkedin.com/in/pavan-kumar-6864b2320"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="LinkedIn"
                    className={cn(
                      "text-xl transition-colors",
                      dark ? "text-white/70 hover:text-white" : "text-[#2a1008]/75 hover:text-[#8b1a1a]"
                    )}
                  >
                    <FaLinkedin />
                  </a>
                </div>

                <a
                  href="/resume.pdf"
                  download
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors",
                    dark
                      ? "border-white/20 text-white/90 hover:bg-white/10 hover:border-white/40"
                      : "border-[#8b1a1a]/25 text-[#2a1008]/90 hover:bg-[#8b1a1a]/8 hover:border-[#8b1a1a]/45"
                  )}
                >
                  <FiFileText className="text-sm shrink-0" />
                  <span>{t.resume}</span>
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── HERO ── */}
      <section
        id="home"
        ref={heroRef}
        className="relative min-h-[100svh] w-full flex items-center justify-center overflow-hidden py-24"
      >
        <div className="absolute inset-0 z-0">
          <Canvas
            camera={{ position: [0, 0, 3.5] }}
            dpr={[1, 1.5]}
            style={{ touchAction: isMobile ? "pan-y" : "none" }}
          >
            <ambientLight intensity={0.8} />
            <directionalLight position={[5, 5, 5]} intensity={1.2} />
            <pointLight
              position={[-5, -5, -5]}
              color={dark ? "#7c3aed" : "#c9956a"}
              intensity={0.6}
            />
            <Suspense fallback={null}>
              <MovingStars mobile={isMobile} touchRef={touchState} />
              <InteractiveSphere dark={dark} mobile={isMobile} touchRef={touchState} />
            </Suspense>
            {/* Not mounted on phones: OrbitControls would block page scrolling */}
            {!isMobile && (
              <OrbitControls
                enableZoom={false}
                autoRotate
                autoRotateSpeed={0.4}
                enablePan={false}
              />
            )}
          </Canvas>
        </div>

        <motion.div
          style={{ y: heroY, opacity: heroOpacity }}
          className="relative z-10 text-center px-6 max-w-4xl mx-auto pointer-events-none"
        >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="flex flex-col items-center gap-5 sm:gap-6"
          >
            {/* Avatar */}
            <motion.div variants={scaleIn} className="relative animate-float pointer-events-auto">
              <div
                className={cn(
                  "w-28 h-28 rounded-full overflow-hidden border-2 shadow-lg",
                  dark
                    ? "border-cyan-400/60 shadow-[0_0_40px_rgba(0,212,255,0.3)]"
                    : "border-[#8b1a1a]/50 shadow-[0_0_40px_rgba(139,26,26,0.25)]"
                )}
              >
                <Image
                  src="/pavan.jpeg"
                  alt="Pavan Kumar"
                  width={112}
                  height={112}
                  className="object-cover"
                />
              </div>
              <div
                className={cn(
                  "absolute inset-0 rounded-full border-2",
                  dark ? "border-cyan-400/40" : "border-[#8b1a1a]/35"
                )}
                style={{
                  animation: "pulse-ring 2.5s cubic-bezier(0,0,0.2,1) infinite",
                }}
              />
            </motion.div>

            {/* Badge */}
            <motion.div variants={fadeUp} className="pointer-events-auto">
              {profileLoading ? (
                <span
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border glass",
                    dark
                      ? "border-cyan-400/30 text-cyan-300"
                      : "border-[#8b1a1a]/30 text-[#8b1a1a] bg-[#f5ede0]/60"
                  )}
                >
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full animate-pulse",
                      dark ? "bg-cyan-400" : "bg-[#8b1a1a]"
                    )}
                  />
                  <span
                    className={cn(
                      "inline-block h-3.5 w-36 rounded-full animate-pulse",
                      dark ? "bg-cyan-400/20" : "bg-[#8b1a1a]/15"
                    )}
                  />
                </span>
              ) : (
                <span
                  className={cn(
                    "inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold border glass",
                    dark
                      ? "border-cyan-400/30 text-cyan-300"
                      : "border-[#8b1a1a]/30 text-[#8b1a1a] bg-[#f5ede0]/60"
                  )}
                >
                  <span
                    className={cn(
                      "w-1.5 h-1.5 rounded-full animate-pulse",
                      dark ? "bg-cyan-400" : "bg-[#8b1a1a]"
                    )}
                  />
                  {(lang === "en" && siteProfile?.heroRole)
                    ? siteProfile.heroRole
                    : (siteProfile?.heroRole || t.heroRole)}
                </span>
              )}
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight text-gradient leading-none"
            >
              {t.name}
            </motion.h1>

            <motion.div
              variants={fadeUp}
              className="w-full flex justify-center"
            >
              {profileLoading ? (
                <div className="w-full max-w-xl space-y-2 py-1 flex flex-col items-center">
                  <div
                    className={cn(
                      "h-4 w-11/12 max-w-lg rounded-full animate-pulse",
                      dark ? "bg-white/10" : "bg-[#8b1a1a]/10"
                    )}
                  />
                  <div
                    className={cn(
                      "h-4 w-4/5 max-w-md rounded-full animate-pulse",
                      dark ? "bg-white/10" : "bg-[#8b1a1a]/10"
                    )}
                  />
                </div>
              ) : (
                <p
                  className={cn(
                    "text-base sm:text-lg max-w-xl leading-relaxed text-center",
                    dark ? "text-white/50" : "text-[#7a4a35]"
                  )}
                >
                  {(lang === "en" && siteProfile?.heroDesc)
                    ? siteProfile.heroDesc
                    : (siteProfile?.heroDesc || t.heroDesc)}
                </p>
              )}
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="flex flex-wrap items-center justify-center gap-4 mt-2 pointer-events-auto"
            >
              <motion.a
                href="#contact"
                onClick={goTo("contact")}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "relative overflow-hidden px-8 py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-300",
                  dark
                    ? "bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_30px_rgba(0,212,255,0.3)] hover:shadow-[0_0_45px_rgba(0,212,255,0.5)]"
                    : "bg-gradient-to-r from-[#8b1a1a] to-[#c9956a] shadow-[0_4px_24px_rgba(139,26,26,0.35)] hover:shadow-[0_6px_36px_rgba(139,26,26,0.5)]"
                )}
              >
                <span className="relative z-10">{t.contactMe}</span>
                <span className="absolute inset-0 animate-shimmer" />
              </motion.a>
              <motion.a
                href="#projects"
                onClick={goTo("projects")}
                whileHover={{ scale: 1.04, y: -2 }}
                whileTap={{ scale: 0.97 }}
                className={cn(
                  "px-8 py-3.5 rounded-xl font-semibold text-sm transition-all duration-300",
                  dark
                    ? "border border-white/20 text-white/80 glass hover:border-white/40 hover:text-white"
                    : "border border-[#8b1a1a]/35 text-[#8b1a1a] bg-[#f5ede0]/70 hover:border-[#8b1a1a]/60"
                )}
              >
                {t.myWork}
              </motion.a>
            </motion.div>

            <motion.div
              variants={fadeUp}
              className="flex items-center gap-6 mt-2 pointer-events-auto"
            >
              {socials.map(({ href, icon, label }) => (
                <motion.a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  whileHover={{ scale: 1.2, y: -3 }}
                  className={cn(
                    "text-2xl transition-colors duration-300",
                    dark
                      ? "text-white/40 hover:text-cyan-400"
                      : "text-[#7a4a35]/60 hover:text-[#8b1a1a]"
                  )}
                >
                  {icon}
                </motion.a>
              ))}
            </motion.div>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2, duration: 1 }}
          className="absolute bottom-6 sm:bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <span
            className={cn(
              "text-xs tracking-widest uppercase",
              dark ? "text-white/25" : "text-[#8b1a1a]/40"
            )}
          >
            Scroll
          </span>
          <div
            className={cn(
              "w-px h-10 sm:h-12 bg-gradient-to-b to-transparent animate-pulse",
              dark ? "from-cyan-400/60" : "from-[#8b1a1a]/50"
            )}
          />
        </motion.div>
      </section>

      {/* ── ABOUT ── */}
      <motion.section
        id="about"
        className="py-16 sm:py-24 relative z-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
      >
        <div className="max-w-5xl mx-auto px-6">
          <motion.div variants={fadeUp} className="mb-10 sm:mb-14 text-center">
            <p
              className={cn(
                "text-sm font-semibold tracking-widest uppercase mb-3",
                dark ? "text-cyan-400" : "text-[#8b1a1a]"
              )}
            >
              {t.whoIAm}
            </p>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gradient">
              {t.aboutMeTitle}
            </h2>
            <Divider dark={dark} />
          </motion.div>

          <div className="space-y-10 sm:space-y-14">
            {/* Bio Story Narrative */}
            <motion.div variants={fadeUp} className="max-w-3xl">
              {profileLoading ? (
                <div className="space-y-2.5 py-1">
                  <div className={cn("h-4 w-full rounded-full animate-pulse", dark ? "bg-white/10" : "bg-[#8b1a1a]/10")} />
                  <div className={cn("h-4 w-11/12 rounded-full animate-pulse", dark ? "bg-white/10" : "bg-[#8b1a1a]/10")} />
                  <div className={cn("h-4 w-4/5 rounded-full animate-pulse", dark ? "bg-white/10" : "bg-[#8b1a1a]/10")} />
                </div>
              ) : (
                <p
                  className={cn(
                    "text-base sm:text-lg leading-relaxed",
                    dark ? "text-white/70" : "text-[#5a3020]"
                  )}
                >
                  {(lang === "en" && siteProfile?.aboutMeDesc) ? siteProfile.aboutMeDesc : (siteProfile?.aboutMeDesc || t.aboutMeDesc)}
                </p>
              )}
            </motion.div>

            {/* ── 1. EDUCATION (Matching Reference Image) ── */}
            <motion.div variants={fadeUp} className="pt-2 sm:pt-4">
              {/* Header with Gold Graduation Cap Icon */}
              <div className="flex items-center gap-3.5 mb-6 sm:mb-8">
                <div
                  className={cn(
                    "text-2xl sm:text-3xl shrink-0",
                    dark ? "text-amber-400" : "text-[#8b1a1a]"
                  )}
                >
                  <LuGraduationCap />
                </div>
                <div>
                  <h3
                    className={cn(
                      "text-base sm:text-lg font-bold tracking-[0.25em] uppercase leading-tight",
                      dark ? "text-white" : "text-[#2a1008]"
                    )}
                  >
                    {t.education}
                  </h3>
                  <p
                    className={cn(
                      "text-[10px] sm:text-[11px] font-semibold tracking-[0.22em] uppercase mt-0.5",
                      dark ? "text-slate-400" : "text-[#7a4a35]/70"
                    )}
                  >
                    ACADEMIC BACKGROUND
                  </p>
                </div>
              </div>

              {/* Connected Timeline Track */}
              <div className="relative">
                {/* Continuous vertical track line */}
                <div
                  className={cn(
                    "absolute left-3.5 top-4 bottom-4 w-[1px] -translate-x-1/2 pointer-events-none",
                    dark ? "bg-slate-700/60" : "bg-[#8b1a1a]/15"
                  )}
                />

                <div className="divide-y divide-white/[0.05]">
                  {educationLoading ? (
                    <div className="space-y-4 py-2">
                      {[1, 2].map((idx) => (
                        <div key={idx} className="relative pl-11 sm:pl-13 py-4 sm:py-5 animate-pulse">
                          <div
                            className={cn(
                              "absolute left-3.5 top-7 -translate-x-1/2 -translate-y-1/2 w-7 h-7 rounded-full border",
                              dark ? "border-slate-800 bg-slate-900/40" : "border-[#8b1a1a]/15 bg-white/60"
                            )}
                          />
                          <div className="space-y-2.5">
                            <div className={cn("h-3 w-20 rounded-full", dark ? "bg-white/15" : "bg-[#8b1a1a]/15")} />
                            <div className={cn("h-4.5 w-3/5 rounded", dark ? "bg-white/20" : "bg-[#8b1a1a]/20")} />
                            <div className={cn("h-3.5 w-2/5 rounded", dark ? "bg-white/10" : "bg-[#8b1a1a]/10")} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : dynamicEducation.length === 0 ? (
                    <div className={cn("pl-11 py-6 text-xs sm:text-sm italic", dark ? "text-white/40" : "text-[#7a4a35]/60")}>
                      No education records found.
                    </div>
                  ) : (
                    dynamicEducation.map((item, idx) => {
                    const isFirst = idx === 0;
                    const isInProgress = item.status && item.status.toLowerCase().includes("progress");

                    const tagColor = isFirst
                      ? dark ? "text-amber-400" : "text-amber-700"
                      : idx === 1
                      ? dark ? "text-cyan-400" : "text-blue-700"
                      : dark ? "text-slate-400" : "text-stone-600";

                    return (
                      <div key={item.id || idx} className="relative pl-11 sm:pl-13 py-4 sm:py-5 group">
                        {/* Timeline Node Badge on the track */}
                        <div
                          className="absolute left-3.5 top-7 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center z-10"
                        >
                          {isFirst ? (
                            <div
                              className={cn(
                                "w-7 h-7 rounded-full flex items-center justify-center border transition-transform duration-300 group-hover:scale-110",
                                dark
                                  ? "bg-[#06111e] border-amber-400/60 text-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.25)]"
                                  : "bg-white border-amber-700/40 text-amber-700 shadow-xs"
                              )}
                            >
                              <LuGraduationCap className="text-xs" />
                            </div>
                          ) : idx === 1 ? (
                            <div
                              className={cn(
                                "w-7 h-7 rounded-full flex items-center justify-center border transition-transform duration-300 group-hover:scale-110",
                                dark ? "bg-[#06111e] border-cyan-400/60" : "bg-white border-blue-600/40"
                              )}
                            >
                              <span
                                className={cn(
                                  "w-2.5 h-2.5 rounded-full",
                                  dark ? "bg-cyan-400 shadow-[0_0_8px_#22d3ee]" : "bg-blue-600"
                                )}
                              />
                            </div>
                          ) : (
                            <div
                              className={cn(
                                "w-7 h-7 rounded-full flex items-center justify-center border transition-transform duration-300 group-hover:scale-110",
                                dark ? "bg-[#06111e] border-slate-600/60" : "bg-white border-stone-300"
                              )}
                            >
                              <span
                                className={cn(
                                  "w-2.5 h-2.5 rounded-full",
                                  dark ? "bg-slate-400" : "bg-stone-500"
                                )}
                              />
                            </div>
                          )}
                        </div>

                        {/* Row Content */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 sm:gap-4">
                          {/* Left: Tag, Degree, Institution */}
                          <div className="min-w-0 flex-1">
                            <span
                              className={cn(
                                "text-xs font-bold uppercase tracking-[0.16em] inline-block",
                                tagColor
                              )}
                            >
                              {item.levelTag}
                            </span>
                            <h4
                              className={cn(
                                "text-sm sm:text-base font-semibold tracking-normal mt-1 leading-snug",
                                dark ? "text-white" : "text-[#2a1008]"
                              )}
                            >
                              {item.degree}
                            </h4>
                            <p
                              className={cn(
                                "text-xs sm:text-[13px] font-normal leading-relaxed mt-1",
                                dark ? "text-slate-400" : "text-[#7a4a35]"
                              )}
                            >
                              {item.institution}
                            </p>
                          </div>

                          {/* Right Badges */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-end gap-1.5 sm:gap-2 shrink-0 pt-0.5">
                            {item.period && (
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border tracking-wide whitespace-nowrap",
                                  dark
                                    ? "bg-slate-900/60 border-slate-800 text-slate-300 shadow-xs"
                                    : "bg-[#8b1a1a]/5 border-[#8b1a1a]/15 text-[#2a1008]/80 shadow-xs"
                                )}
                              >
                                <FiCalendar className="text-[11px] opacity-70" />
                                {item.period}
                              </span>
                            )}

                            {item.status && isInProgress && (
                              <span
                                className={cn(
                                  "inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border whitespace-nowrap",
                                  dark
                                    ? "bg-emerald-500/10 border-emerald-500/25 text-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.15)]"
                                    : "bg-emerald-50 border-emerald-300 text-emerald-800"
                                )}
                              >
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]" />
                                {item.status}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
                </div>
              </div>
            </motion.div>

            {/* Subtle Horizontal Divider between Education and Experience */}
            <div
              className={cn(
                "my-8 sm:my-10 border-b",
                dark ? "border-slate-800/80" : "border-[#8b1a1a]/15"
              )}
            />

            {/* ── 2. EXPERIENCE (Matching Reference Image) ── */}
            <motion.div variants={fadeUp}>
              {/* Header matching reference image: Title + Subtitle */}
              <div className="mb-4 sm:mb-5">
                <h3
                  className={cn(
                    "text-base sm:text-lg font-bold tracking-[0.25em] uppercase leading-tight",
                    dark ? "text-white" : "text-[#2a1008]"
                  )}
                >
                  {t.experience}
                </h3>
                <p
                  className={cn(
                    "text-[10px] sm:text-[11px] font-semibold tracking-[0.22em] uppercase mt-0.5",
                    dark ? "text-slate-400" : "text-[#7a4a35]/70"
                  )}
                >
                  CAREER &amp; INTERNSHIPS
                </p>
              </div>

              {/* Thin horizontal line beneath the header */}
              <div
                className={cn(
                  "w-full h-[1px] mb-6 sm:mb-7",
                  dark ? "bg-slate-800/80" : "bg-[#8b1a1a]/15"
                )}
              />

              {/* Clean & Minimal Experience Timeline (No Card Containers) */}
              <div className="space-y-6 sm:space-y-7">
                {experienceLoading ? (
                  <div className="space-y-6 py-2">
                    {[1, 2].map((idx) => (
                      <div key={idx} className="relative pl-6 sm:pl-7 py-2 animate-pulse">
                        <div
                          className={cn(
                            "absolute left-1 top-2.5 -translate-x-1/2 w-2.5 h-2.5 rounded-full",
                            dark ? "bg-cyan-400/40" : "bg-[#8b1a1a]/40"
                          )}
                        />
                        <div className="space-y-2">
                          <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                            <div className={cn("h-4 w-44 rounded", dark ? "bg-white/20" : "bg-[#8b1a1a]/20")} />
                            <div className={cn("h-4 w-28 rounded-md", dark ? "bg-white/10" : "bg-[#8b1a1a]/10")} />
                          </div>
                          <div className={cn("h-3.5 w-3/4 rounded", dark ? "bg-white/10" : "bg-[#8b1a1a]/10")} />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : dynamicExperience.length === 0 ? (
                  <div className={cn("pl-6 py-4 text-xs sm:text-sm italic", dark ? "text-white/40" : "text-[#7a4a35]/60")}>
                    No experience records found.
                  </div>
                ) : (
                  dynamicExperience.map((exp: any, i: number, arr: any[]) => {
                  let role = exp.role || "";
                  let company = exp.company || "";
                  let period = exp.period || "";
                  let description = exp.description || "";

                  if (typeof exp === "string") {
                    const match = exp.match(/^([^(]+?)(?:\s*\((.*?)\))?$/);
                    const main = match ? match[1].trim() : exp;
                    period = match && match[2] ? match[2].trim() : "";
                    const parts = main.split("·").map((s: string) => s.trim());
                    role = parts[0] || "";
                    company = parts[1] || "";
                  }

                  return (
                    <div key={exp.id || i} className="relative pl-6 sm:pl-7 group">
                      {/* Short connecting vertical line if not last */}
                      {i < arr.length - 1 && (
                        <div
                          className={cn(
                            "absolute left-1 top-4 bottom-0 w-[1.5px] pointer-events-none",
                            dark ? "bg-slate-700/60" : "bg-[#8b1a1a]/15"
                          )}
                        />
                      )}

                      {/* Cyan glowing dot */}
                      <div
                        className={cn(
                          "absolute left-1 top-2 -translate-x-1/2 w-2.5 h-2.5 rounded-full transition-transform duration-300 group-hover:scale-125",
                          dark
                            ? "bg-cyan-400 shadow-[0_0_8px_#22d3ee]"
                            : "bg-[#8b1a1a] shadow-xs"
                        )}
                      />

                      {/* Header row: Role · Company on left, Date Badge on right */}
                      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1.5 sm:gap-4">
                        <h4
                          className={cn(
                            "text-sm sm:text-base font-bold tracking-tight",
                            dark ? "text-white" : "text-[#2a1008]"
                          )}
                        >
                          {role}
                          {company && (
                            <span className={dark ? "text-cyan-300 font-semibold" : "text-[#8b1a1a] font-semibold"}>
                              {" "}· {company}
                            </span>
                          )}
                        </h4>

                        {period && (
                          <span
                            className={cn(
                              "inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border shrink-0 self-start sm:self-auto",
                              dark
                                ? "bg-slate-900/60 border-slate-800 text-slate-300 shadow-xs"
                                : "bg-[#8b1a1a]/5 border-[#8b1a1a]/15 text-[#2a1008]/80 shadow-xs"
                            )}
                          >
                            <FiCalendar className="text-[11px] opacity-70" />
                            {period}
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      {description && (
                        <p
                          className={cn(
                            "text-xs sm:text-[13px] font-normal leading-relaxed mt-1.5",
                            dark ? "text-slate-400" : "text-[#7a4a35]"
                          )}
                        >
                          {description}
                        </p>
                      )}
                    </div>
                  );
                })
              )}
              </div>
            </motion.div>

            {/* Subtle Horizontal Divider between Experience and Skills */}
            <div
              className={cn(
                "my-8 sm:my-10 border-b",
                dark ? "border-slate-800/80" : "border-[#8b1a1a]/15"
              )}
            />

            {/* ── SKILLS & STACK (Matching Reference Image) ── */}
            <motion.div variants={fadeUp} className="pt-4 sm:pt-6">
              {/* Cyan Accent Indicator Bar */}
              <div
                className={cn(
                  "w-12 h-1 rounded-full mb-3",
                  dark
                    ? "bg-cyan-400 shadow-[0_0_12px_#22d3ee]"
                    : "bg-[#8b1a1a] shadow-xs"
                )}
              />
              <h3
                className={cn(
                  "text-xl sm:text-2xl font-extrabold tracking-wider mb-6 sm:mb-8 uppercase",
                  dark ? "text-white" : "text-[#2a1008]"
                )}
              >
                SKILLS &amp; <span className={dark ? "text-cyan-400" : "text-[#8b1a1a]"}>STACK</span>
              </h3>

              {/* 4-Column Grid with Clean & Minimal Aesthetic (Matching Reference Design) */}
              {skillsLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5 md:gap-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8].map((idx) => (
                    <div
                      key={idx}
                      className={cn(
                        "rounded-xl sm:rounded-2xl px-3.5 py-3 sm:px-4.5 sm:py-3.5 md:px-5 md:py-4 flex items-center gap-3 sm:gap-4 border animate-pulse min-h-[48px] sm:min-h-[56px] md:min-h-[62px]",
                        dark
                          ? "bg-[#040e1c]/60 border-cyan-500/10"
                          : "bg-[#fffaf2]/80 border-[#8b1a1a]/10"
                      )}
                    >
                      <div
                        className={cn(
                          "w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 rounded-lg shrink-0",
                          dark ? "bg-white/10" : "bg-[#8b1a1a]/10"
                        )}
                      />
                      <div
                        className={cn(
                          "h-4 w-20 rounded",
                          dark ? "bg-white/15" : "bg-[#8b1a1a]/15"
                        )}
                      />
                    </div>
                  ))}
                </div>
              ) : dynamicSkills.length === 0 ? (
                <div className={cn("py-8 text-center text-xs sm:text-sm italic", dark ? "text-white/40" : "text-[#7a4a35]/60")}>
                  No skills added yet.
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5 md:gap-4">
                  {dynamicSkills.map((skill: any, i: number) => (
                  <motion.div
                    key={skill.id || skill.name}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                      duration: 0.35,
                      ease: [0.22, 1, 0.36, 1],
                      delay: (i % 8) * 0.03,
                    }}
                    whileHover={{ scale: 1.02, y: -2 }}
                    className={cn(
                      "relative rounded-xl sm:rounded-2xl px-3.5 py-3 sm:px-4.5 sm:py-3.5 md:px-5 md:py-4 flex items-center gap-3 sm:gap-4 border transition-all duration-200 group cursor-default min-h-[48px] sm:min-h-[56px] md:min-h-[62px]",
                      dark
                        ? "bg-[#040e1c]/80 border-cyan-500/20 hover:border-cyan-400 hover:bg-[#07172b]/90 shadow-sm hover:shadow-[0_0_18px_rgba(34,211,238,0.2)] backdrop-blur-md"
                        : "bg-[#fffaf2] border-[#8b1a1a]/15 hover:border-[#8b1a1a]/40 hover:bg-[#faeedd]/70 shadow-xs hover:shadow-sm"
                    )}
                  >
                    {/* Active/Hover cyan indicator dot in top-right corner matching reference image */}
                    <span
                      className={cn(
                        "absolute top-2.5 right-2.5 sm:top-3 sm:right-3 w-1.5 h-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none",
                        dark
                          ? "bg-cyan-400 shadow-[0_0_8px_#22d3ee]"
                          : "bg-[#8b1a1a] shadow-[0_0_6px_rgba(139,26,26,0.6)]"
                      )}
                    />

                    {/* Clean direct logo without inner box frame */}
                    <div className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105">
                      <SkillIcon
                        iconKey={skill.iconKey}
                        iconUrl={skill.iconUrl}
                        name={skill.name}
                        className="w-full h-full object-contain"
                      />
                    </div>

                    {/* Skill Name */}
                    <div className="min-w-0 flex-1">
                      <span
                        className={cn(
                          "font-semibold text-xs sm:text-sm md:text-base tracking-normal truncate block transition-colors",
                          dark
                            ? "text-white group-hover:text-cyan-200"
                            : "text-[#2a1008] group-hover:text-[#8b1a1a]"
                        )}
                      >
                        {skill.name}
                      </span>
                    </div>
                  </motion.div>
                ))}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ── PROJECTS ── */}
      <motion.section
        id="projects"
        className="py-16 sm:py-24 relative z-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={stagger}
      >
        <div className="max-w-6xl mx-auto px-6">
          <motion.div variants={fadeUp} className="mb-6 sm:mb-8">
            <p
              className={cn(
                "text-sm font-semibold tracking-widest uppercase mb-3",
                dark ? "text-cyan-400" : "text-[#8b1a1a]"
              )}
            >
              {t.whatIBuilt}
            </p>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gradient">
              {t.projectsTitle}
            </h2>
            <Divider dark={dark} />
          </motion.div>

          {/* Project Category Filter Pills */}
          <motion.div
            variants={fadeUp}
            className="mb-8 flex items-center gap-2 overflow-x-auto scrollbar-hide py-1"
          >
            {PROJECT_CATEGORIES.map((cat) => {
              const isActive = activeProjectCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setActiveProjectCategory(cat);
                    if (scrollRef.current) {
                      scrollRef.current.scrollTo({ left: 0, behavior: "instant" });
                    }
                  }}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0",
                    isActive
                      ? dark
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(0,212,255,0.25)] font-semibold"
                        : "bg-[#8b1a1a] text-white border border-[#8b1a1a] shadow-md shadow-[#8b1a1a]/25 font-semibold"
                      : dark
                      ? "bg-white/[0.04] text-white/60 border border-white/10 hover:text-white hover:border-white/20 hover:bg-white/[0.08]"
                      : "bg-[#8b1a1a]/5 text-[#7a4a35] border border-[#8b1a1a]/15 hover:text-[#2a1008] hover:border-[#8b1a1a]/30 hover:bg-[#8b1a1a]/10"
                  )}
                >
                  {cat}
                </button>
              );
            })}
          </motion.div>
        </div>

        {projectsLoading ? (
          <div
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-2"
            style={{
              paddingLeft: "max(1.5rem, calc((100vw - 72rem) / 2))",
              paddingRight: "max(1.5rem, calc((100vw - 72rem) / 2))",
            }}
          >
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={cn(
                  "snap-start shrink-0 w-[300px] sm:w-[360px] glass-card border rounded-2xl p-7 flex flex-col gap-4 animate-pulse",
                  dark ? "border-white/8 bg-white/[0.02]" : "border-[#8b1a1a]/14 bg-white/60"
                )}
              >
                <div className="flex items-center justify-between">
                  <div className={cn("w-12 h-12 rounded-xl", dark ? "bg-white/10" : "bg-[#8b1a1a]/10")} />
                  <div className={cn("h-5 w-20 rounded-full", dark ? "bg-white/10" : "bg-[#8b1a1a]/10")} />
                </div>
                <div className={cn("h-6 w-3/4 rounded mt-2", dark ? "bg-white/20" : "bg-[#8b1a1a]/20")} />
                <div className={cn("h-3.5 w-full rounded", dark ? "bg-white/10" : "bg-[#8b1a1a]/10")} />
                <div className="space-y-2 mt-1">
                  <div className={cn("h-3 w-full rounded", dark ? "bg-white/10" : "bg-[#8b1a1a]/10")} />
                  <div className={cn("h-3 w-5/6 rounded", dark ? "bg-white/10" : "bg-[#8b1a1a]/10")} />
                  <div className={cn("h-3 w-2/3 rounded", dark ? "bg-white/10" : "bg-[#8b1a1a]/10")} />
                </div>
                <div className="flex gap-3 mt-auto pt-4 border-t border-white/5">
                  <div className={cn("h-8 w-24 rounded-lg", dark ? "bg-white/10" : "bg-[#8b1a1a]/10")} />
                  <div className={cn("h-8 w-24 rounded-lg", dark ? "bg-white/10" : "bg-[#8b1a1a]/10")} />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              key="empty-projects"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "py-12 px-6 rounded-2xl border text-center flex flex-col items-center justify-center max-w-md mx-auto",
                dark
                  ? "border-white/10 bg-white/[0.02] text-white/60"
                  : "border-[#8b1a1a]/15 bg-[#8b1a1a]/[0.02] text-[#7a4a35]"
              )}
            >
              <span className="text-3xl mb-2">📂</span>
              <p className="text-sm font-semibold">No projects found in this category.</p>
              <button
                type="button"
                onClick={() => {
                  setActiveProjectCategory("All");
                  if (scrollRef.current) {
                    scrollRef.current.scrollTo({ left: 0, behavior: "instant" });
                  }
                }}
                className={cn(
                  "mt-3 text-xs underline font-semibold transition-colors cursor-pointer",
                  dark ? "text-cyan-400 hover:text-cyan-300" : "text-[#8b1a1a] hover:text-[#5c0f0f]"
                )}
              >
                Show all projects
              </button>
            </motion.div>
          </div>
        ) : (
          <motion.div
            ref={scrollRef}
            key={activeProjectCategory}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2"
            style={{
              paddingLeft: "max(1.5rem, calc((100vw - 72rem) / 2))",
              paddingRight: "max(1.5rem, calc((100vw - 72rem) / 2))",
            }}
          >
            {filteredProjects.map(({ title, tech, desc, github, emoji, logo, labUrl, liveUrl }: any, i: number) => (
            <motion.div
              key={title || i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.38,
                delay: Math.min(i * 0.06, 0.24),
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ y: -6, scale: 1.02 }}
              className={cn(
                "snap-start shrink-0 w-[300px] sm:w-[360px] glass-card border rounded-2xl p-7 flex flex-col gap-4 group",
                dark
                  ? "border-white/8 hover:border-cyan-400/30"
                  : "border-[#8b1a1a]/14 hover:border-[#8b1a1a]/35 shadow-[0_2px_20px_rgba(139,26,26,0.07)] hover:shadow-[0_6px_32px_rgba(139,26,26,0.14)]"
              )}
              style={{
                transition:
                  "transform 0.4s cubic-bezier(0.22,1,0.36,1), border-color 0.3s, box-shadow 0.3s",
              }}
            >
              <div className="flex items-start justify-between">
                {logo ? (
                  <div
                    className={cn(
                      "relative w-12 h-12 rounded-xl overflow-hidden border p-1 shadow-md transition-transform duration-300 group-hover:scale-105 flex items-center justify-center shrink-0",
                      dark
                        ? "border-cyan-400/30 bg-cyan-950/40 shadow-[0_0_15px_rgba(0,212,255,0.15)]"
                        : "border-[#8b1a1a]/20 bg-[#fbf5ea] shadow-[0_2px_12px_rgba(139,26,26,0.08)]"
                    )}
                  >
                    <Image
                      src={logo}
                      alt={title}
                      width={44}
                      height={44}
                      unoptimized={typeof logo === "string" && logo.startsWith("data:")}
                      className="w-full h-full object-cover rounded-lg"
                    />
                  </div>
                ) : (
                  <span className="text-4xl">{emoji}</span>
                )}
                <div
                  className={cn(
                    "w-8 h-8 rounded-full border flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300",
                    dark ? "border-white/10" : "border-[#8b1a1a]/20"
                  )}
                >
                  <FaGithub
                    className={cn(
                      "text-sm",
                      dark ? "text-white/60" : "text-[#8b1a1a]/60"
                    )}
                  />
                </div>
              </div>
              <div>
                <h4
                  className={cn(
                    "text-lg font-bold mb-1",
                    dark ? "text-white" : "text-[#2a1008]"
                  )}
                >
                  {title}
                </h4>
                <p
                  className={cn(
                    "text-xs font-medium tracking-wide mb-3",
                    dark ? "text-cyan-300/70" : "text-[#c9956a]"
                  )}
                >
                  {tech}
                </p>
                <p
                  className={cn(
                    "text-sm leading-relaxed",
                    dark ? "text-white/50" : "text-[#5a3020]/80"
                  )}
                >
                  {desc}
                </p>
              </div>
              <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
                {liveUrl && (
                  <a
                    href={liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all",
                      dark
                        ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                        : "border-emerald-700/25 bg-emerald-600/10 text-emerald-800 hover:bg-emerald-600/20"
                    )}
                  >
                    <span>🚀</span> Live App ↗
                  </a>
                )}
                {labUrl && (
                  <Link
                    href={labUrl}
                    className={cn(
                      "inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all",
                      dark
                        ? "border-cyan-400/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20"
                        : "border-[#8b1a1a]/20 bg-[#8b1a1a]/5 text-[#8b1a1a] hover:bg-[#8b1a1a]/10"
                    )}
                  >
                    <span>🧪</span> {lang === "jp" ? "ラボで体験" : "Live Demo & Lab"} →
                  </Link>
                )}
                {github && (
                  <a
                    href={github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={cn(
                      "inline-flex items-center gap-1.5 text-xs font-semibold transition-colors duration-200 group/link py-1.5 px-2",
                      dark
                        ? "text-white/60 hover:text-white"
                        : "text-[#7a4a35] hover:text-[#2a1008]"
                    )}
                  >
                    <FaGithub />
                    <span className="group-hover/link:underline">
                      GitHub
                    </span>
                  </a>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
        )}
      </motion.section>

      {/* ── CERTIFICATIONS ── */}
      <motion.section
        id="certifications"
        className="py-16 sm:py-24 relative z-10 overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.1 }}
        variants={stagger}
      >
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className="w-[700px] h-[320px] rounded-full"
            style={{
              background: dark
                ? "radial-gradient(ellipse, #0ea5e9 0%, transparent 70%)"
                : "radial-gradient(ellipse, #c9956a 0%, transparent 70%)",
              filter: "blur(80px)",
              opacity: 0.08,
            }}
          />
        </div>

        <div className="max-w-6xl mx-auto px-6">
          <motion.div variants={fadeUp} className="mb-8 sm:mb-10 text-center">
            <p
              className={cn(
                "text-sm font-semibold tracking-widest uppercase mb-3",
                dark ? "text-cyan-400" : "text-[#8b1a1a]"
              )}
            >
              {t.credentials}
            </p>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gradient">
              {t.certificationsTitle}
            </h2>
            <Divider dark={dark} />
            <p
              className={cn(
                "text-sm mt-4",
                dark ? "text-white/40" : "text-[#7a4a35]/70"
              )}
            >
              {t.certificationsDesc}
            </p>
          </motion.div>

          {/* Certificate Category Filter Pills */}
          <motion.div
            variants={fadeUp}
            className="mb-8 flex items-center justify-center gap-2 overflow-x-auto scrollbar-hide py-1"
          >
            {CERTIFICATE_CATEGORIES.map((cat) => {
              const isActive = activeCertCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCertCategory(cat)}
                  className={cn(
                    "px-4 py-1.5 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0",
                    isActive
                      ? dark
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 shadow-[0_0_12px_rgba(0,212,255,0.25)] font-semibold"
                        : "bg-[#8b1a1a] text-white border border-[#8b1a1a] shadow-md shadow-[#8b1a1a]/25 font-semibold"
                      : dark
                      ? "bg-white/[0.04] text-white/60 border border-white/10 hover:text-white hover:border-white/20 hover:bg-white/[0.08]"
                      : "bg-[#8b1a1a]/5 text-[#7a4a35] border border-[#8b1a1a]/15 hover:text-[#2a1008] hover:border-[#8b1a1a]/30 hover:bg-[#8b1a1a]/10"
                  )}
                >
                  {cat}
                </button>
              );
            })}
          </motion.div>
        </div>

        {certsLoading ? (
          <div
            className="flex gap-6 overflow-x-auto scrollbar-hide pb-4 pt-2"
            style={{
              paddingLeft: "max(1.5rem, calc((100vw - 72rem) / 2))",
              paddingRight: "max(1.5rem, calc((100vw - 72rem) / 2))",
            }}
          >
            {[1, 2, 3].map((idx) => (
              <div
                key={idx}
                className={cn(
                  "snap-start shrink-0 w-[280px] sm:w-[320px] rounded-2xl p-5 border animate-pulse flex flex-col gap-3",
                  dark
                    ? "bg-[#040e1c]/60 border-cyan-500/10"
                    : "bg-[#fffaf2]/80 border-[#8b1a1a]/10"
                )}
              >
                <div className={cn("w-full h-36 rounded-xl", dark ? "bg-white/10" : "bg-[#8b1a1a]/10")} />
                <div className="flex items-center justify-between mt-1">
                  <div className={cn("h-4 w-20 rounded-full", dark ? "bg-white/10" : "bg-[#8b1a1a]/10")} />
                  <div className={cn("h-4 w-12 rounded", dark ? "bg-white/10" : "bg-[#8b1a1a]/10")} />
                </div>
                <div className={cn("h-5 w-4/5 rounded", dark ? "bg-white/20" : "bg-[#8b1a1a]/20")} />
                <div className={cn("h-3.5 w-1/2 rounded", dark ? "bg-white/10" : "bg-[#8b1a1a]/10")} />
              </div>
            ))}
          </div>
        ) : filteredCertificates.length === 0 ? (
          <div className="max-w-6xl mx-auto px-6">
            <motion.div
              key="empty-certs"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={cn(
                "py-12 px-6 rounded-2xl border text-center flex flex-col items-center justify-center max-w-md mx-auto",
                dark
                  ? "border-white/10 bg-white/[0.02] text-white/60"
                  : "border-[#8b1a1a]/15 bg-[#8b1a1a]/[0.02] text-[#7a4a35]"
              )}
            >
              <span className="text-3xl mb-2">📜</span>
              <p className="text-sm font-semibold">No certificates found in this category.</p>
              <button
                type="button"
                onClick={() => setActiveCertCategory("All")}
                className={cn(
                  "mt-3 text-xs underline font-semibold transition-colors cursor-pointer",
                  dark ? "text-cyan-400 hover:text-cyan-300" : "text-[#8b1a1a] hover:text-[#5c0f0f]"
                )}
              >
                Show all certificates
              </button>
            </motion.div>
          </div>
        ) : (
          <>
            <div
              key={activeCertCategory}
              className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 pt-2"
              style={{
                paddingLeft: "max(1.5rem, calc((100vw - 72rem) / 2))",
                paddingRight: "max(1.5rem, calc((100vw - 72rem) / 2))",
              }}
            >
              {filteredCertificates.map((card: any, i: number) => {
            const color = dark ? (card.colorDark || card.color_dark || "#0ea5e9") : (card.colorLight || card.color_light || "#c9956a");
            const cardImages = getCardImages(card);
            const isReal = card.real !== false && (card.real === true || cardImages.length > 0);

            return (
              <motion.div
                key={card.id ? `cert-${card.id}` : `cert-${card.title || i}-${i}`}
                className="snap-start shrink-0 w-[280px] sm:w-[320px]"
                initial={{ opacity: 0, y: 30, rotateY: -10 }}
                animate={{ opacity: 1, y: 0, rotateY: 0 }}
                transition={{
                  duration: 0.5,
                  delay: Math.min(i * 0.08, 0.28),
                  ease: [0.22, 1, 0.36, 1],
                }}
                whileHover={{ y: -4 }}
                style={{ perspective: 900 }}
              >
                <div
                  className={cn(
                    "relative h-[340px] rounded-2xl overflow-hidden border flex flex-col group transition-all duration-500",
                    isReal
                      ? dark
                        ? "glass-card border-white/12 hover:border-cyan-400/50 shadow-[0_8px_40px_rgba(0,0,0,0.5)]"
                        : "glass-card border-[#8b1a1a]/18 hover:border-[#8b1a1a]/50 shadow-[0_8px_40px_rgba(139,26,26,0.14)]"
                      : dark
                      ? "glass-card border-dashed border-white/10 hover:border-white/20"
                      : "glass-card border-dashed border-[#8b1a1a]/14 hover:border-[#8b1a1a]/32"
                  )}
                >
                  <div
                    className="h-1 w-full shrink-0"
                    style={{
                      background: `linear-gradient(90deg, ${color} 0%, transparent 100%)`,
                    }}
                  />

                  <div className="relative flex-1 flex items-center justify-center overflow-hidden px-5">
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-500"
                      style={{
                        background: `radial-gradient(circle at center, ${color} 0%, transparent 70%)`,
                      }}
                    />

                    {isReal && cardImages.length > 0 ? (
                      <div className="relative w-full h-44 flex items-center justify-center">
                        {cardImages.length === 1 ? (
                          /* SINGLE CERTIFICATE: Horizontal, clean, no rotation, no fake duplicate stack */
                          <div
                            onClick={() => openCert(cardImages, 0, card.title)}
                            className="w-48 sm:w-52 h-32 sm:h-34 rounded-xl overflow-hidden shadow-2xl cursor-pointer transition-all duration-300 hover:scale-105 border border-white/20 relative bg-white"
                          >
                            <Image
                              src={cardImages[0]}
                              alt={card.title}
                              fill
                              unoptimized={typeof cardImages[0] === "string" && cardImages[0].startsWith("data:")}
                              className="object-cover"
                            />
                          </div>
                        ) : cardImages.length === 2 ? (
                          /* TWO CERTIFICATES: 2-card stack */
                          [
                            { rot: "-7deg", top: "10px", scale: 0.93, z: 1 },
                            { rot: "5deg",  top: "20px", scale: 1,    z: 2 },
                          ].map((s, idx) => (
                            <div
                              key={idx}
                              onClick={() => openCert(cardImages, idx, card.title)}
                              className="absolute left-1/2 w-48 h-32 rounded-xl overflow-hidden shadow-2xl cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10 bg-white"
                              style={{
                                border: "1px solid rgba(255,255,255,0.18)",
                                transform: `translateX(-50%) rotate(${s.rot}) scale(${s.scale})`,
                                top: s.top,
                                zIndex: s.z,
                              }}
                            >
                              <Image
                                src={cardImages[idx]}
                                alt={`${card.title} - ${idx + 1}`}
                                fill
                                unoptimized={typeof cardImages[idx] === "string" && cardImages[idx].startsWith("data:")}
                                className="object-cover"
                              />
                            </div>
                          ))
                        ) : (
                          /* THREE OR MORE: 3-fan stack */
                          [
                            { rot: "-11deg", top: "6px",  scale: 0.86, z: 1 },
                            { rot: "1deg",   top: "16px", scale: 0.93, z: 2 },
                            { rot: "11deg",  top: "26px", scale: 1,    z: 3 },
                          ].map((s, idx) => (
                            <div
                              key={idx}
                              onClick={() => openCert(cardImages, idx, card.title)}
                              className="absolute left-1/2 w-48 h-32 rounded-xl overflow-hidden shadow-2xl cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10 bg-white"
                              style={{
                                border: "1px solid rgba(255,255,255,0.18)",
                                transform: `translateX(-50%) rotate(${s.rot}) scale(${s.scale})`,
                                top: s.top,
                                zIndex: s.z,
                              }}
                            >
                              <Image
                                src={cardImages[idx]}
                                alt={`${card.title} - ${idx + 1}`}
                                fill
                                unoptimized={typeof cardImages[idx] === "string" && cardImages[idx].startsWith("data:")}
                                className="object-cover"
                              />
                            </div>
                          ))
                        )}
                        {cardImages.length > 1 && (
                          <span className="absolute bottom-1 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/75 text-cyan-300 border border-cyan-400/30 z-20 backdrop-blur-xs">
                            {cardImages.length} certs
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-3 opacity-35 group-hover:opacity-55 transition-opacity duration-400">
                        <span className="text-6xl select-none">{card.icon}</span>
                        <div
                          className="w-14 h-px"
                          style={{ background: color, opacity: 0.5 }}
                        />
                        <span
                          className="text-[10px] tracking-[0.2em] uppercase font-semibold"
                          style={{ color }}
                        >
                          {isReal ? (card.issuer || "Verified") : "Coming Soon"}
                        </span>
                      </div>
                    )}
                  </div>

                  <div
                    className={cn(
                      "p-5 border-t shrink-0",
                      dark ? "border-white/6" : "border-[#8b1a1a]/8"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <h4
                          className={cn(
                            "font-bold text-sm truncate",
                            dark ? "text-white" : "text-[#2a1008]",
                            !isReal && "opacity-45"
                          )}
                        >
                          {card.title}
                        </h4>
                        <p
                          className={cn(
                            "text-xs mt-0.5 line-clamp-1",
                            dark ? "text-white/35" : "text-[#7a4a35]/60",
                            !isReal && "opacity-55"
                          )}
                        >
                          {card.subtitle}
                        </p>
                      </div>
                      <span
                        className="shrink-0 text-xs font-bold px-2 py-0.5 rounded-md"
                        style={{
                          background: `${color}22`,
                          color,
                        }}
                      >
                        {card.year}
                      </span>
                    </div>

                    {isReal && cardImages.length > 0 ? (
                      <button
                        type="button"
                        onClick={() => openCert(cardImages, 0, card.title)}
                        className={cn(
                          "text-xs font-semibold transition-colors duration-200 inline-flex items-center gap-1 cursor-pointer",
                          dark
                            ? "text-cyan-300 hover:text-white"
                            : "text-[#8b1a1a] hover:text-[#2a1008]"
                        )}
                      >
                        {cardImages.length > 1 ? "View all certificates →" : "View certificate →"}
                      </button>
                    ) : (
                      <p
                        className={cn(
                          "text-[10px]",
                          dark ? "text-white/40" : "text-[#7a4a35]/60"
                        )}
                      >
                        {card.issuer || "Certificate"}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div
          variants={fadeUp}
          className="flex items-center justify-center gap-3 mt-4"
        >
          <div
            className={cn(
              "w-10 h-px",
              dark ? "bg-white/15" : "bg-[#8b1a1a]/15"
            )}
          />
          <span
            className={cn(
              "text-[10px] tracking-[0.2em] uppercase",
              dark ? "text-white/25" : "text-[#8b1a1a]/35"
            )}
          >
            Scroll to explore
          </span>
          <div
            className={cn(
              "w-10 h-px",
              dark ? "bg-white/15" : "bg-[#8b1a1a]/15"
            )}
          />
        </motion.div>
          </>
        )}
      </motion.section>

      {/* ── CERT MODAL ── */}
      <AnimatePresence>
        {certOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "fixed inset-0 backdrop-blur-md flex items-center justify-center z-[100] p-4 sm:p-6",
              dark ? "bg-black/85" : "bg-[#2a1008]/75"
            )}
            onClick={closeCert}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "relative max-w-3xl w-full rounded-2xl overflow-hidden p-5 sm:p-6 shadow-2xl",
                dark
                  ? "glass-card border border-white/12"
                  : "bg-[#fffaf2] border border-[#8b1a1a]/20 shadow-[0_20px_60px_rgba(139,26,26,0.25)]"
              )}
              onClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => {
                if (certModalImages.length <= 1) return;
                const startX = e.touches[0].clientX;
                const onEnd = (ev: TouchEvent) => {
                  const dx = ev.changedTouches[0].clientX - startX;
                  if (dx < -50) showNext();
                  else if (dx > 50) showPrev();
                  document.removeEventListener("touchend", onEnd);
                };
                document.addEventListener("touchend", onEnd);
              }}
            >
              <button
                type="button"
                onClick={closeCert}
                className={cn(
                  "absolute top-4 right-4 w-9 h-9 rounded-full border flex items-center justify-center transition-colors z-20 cursor-pointer shadow-md",
                  dark
                    ? "glass border-white/15 text-white/70 hover:text-white hover:bg-white/10"
                    : "bg-white border-[#8b1a1a]/25 text-[#8b1a1a] hover:bg-[#faeedd]"
                )}
                aria-label="Close certificate viewer"
              >
                ✕
              </button>

              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden bg-white shadow-inner flex items-center justify-center border border-black/5">
                {certModalImages[certIndex] ? (
                  <Image
                    src={certModalImages[certIndex]}
                    alt={certModalTitle ? `${certModalTitle} - Certificate ${certIndex + 1}` : `Certificate ${certIndex + 1}`}
                    fill
                    unoptimized={typeof certModalImages[certIndex] === "string" && certModalImages[certIndex].startsWith("data:")}
                    className="object-contain p-2"
                    priority
                  />
                ) : (
                  <div className="text-sm text-neutral-400">No image available</div>
                )}
              </div>

              {/* Only show navigation controls when multiple certificates exist */}
              {certModalImages.length > 1 && (
                <div className="flex items-center justify-between mt-5">
                  <button
                    type="button"
                    onClick={showPrev}
                    className={cn(
                      "flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer",
                      dark
                        ? "glass border-white/10 text-white/80 hover:text-white hover:border-white/25 active:scale-95"
                        : "bg-white border-[#8b1a1a]/25 text-[#8b1a1a] hover:bg-[#faeedd] active:scale-95 shadow-xs"
                    )}
                  >
                    ← Prev
                  </button>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      dark ? "text-white/45" : "text-[#7a4a35]"
                    )}
                  >
                    {certIndex + 1} / {certModalImages.length}
                  </span>
                  <button
                    type="button"
                    onClick={showNext}
                    className={cn(
                      "flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all cursor-pointer",
                      dark
                        ? "glass border-white/10 text-white/80 hover:text-white hover:border-white/25 active:scale-95"
                        : "bg-white border-[#8b1a1a]/25 text-[#8b1a1a] hover:bg-[#faeedd] active:scale-95 shadow-xs"
                    )}
                  >
                    Next →
                  </button>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── TESTIMONIALS ── */}
      <motion.section
        id="testimonials"
        className="py-16 sm:py-24 relative z-10 overflow-hidden"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.05 }}
        variants={stagger}
      >
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div
            className="w-[800px] h-[360px] rounded-full"
            style={{
              background: dark
                ? "radial-gradient(ellipse, #7c3aed 0%, transparent 70%)"
                : "radial-gradient(ellipse, #c9956a 0%, transparent 70%)",
              filter: "blur(100px)",
              opacity: 0.07,
            }}
          />
        </div>

        <div className="max-w-6xl mx-auto px-6">
          <motion.div variants={fadeUp} className="mb-8 sm:mb-10 text-center">
            <p
              className={cn(
                "text-xs sm:text-sm font-semibold tracking-[0.25em] uppercase mb-2",
                dark ? "text-slate-400" : "text-[#8b1a1a]"
              )}
            >
              {t.whatOthersSay}
            </p>
            <h2
              className={cn(
                "text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight",
                dark ? "text-white" : "text-[#2a1008]"
              )}
            >
              {t.testimonials}
            </h2>
            <div
              className={cn(
                "w-12 h-px mx-auto my-3.5",
                dark ? "bg-slate-700/60" : "bg-[#8b1a1a]/25"
              )}
            />
            <p
              className={cn(
                "text-xs sm:text-sm leading-relaxed max-w-md mx-auto",
                dark ? "text-slate-400" : "text-[#7a4a35]/80"
              )}
            >
              {lang === "jp"
                ? "共に働いた仲間や知人からの声"
                : "Kind words from peers, collaborators & the people I've worked with"}
            </p>
          </motion.div>
        </div>

        <TestimonialsSection
          dark={dark}
          lang={lang}
          t={t}
          inputClass={inputClass}
        />
      </motion.section>

      {/* ── CONTACT ── */}
      <motion.section
        id="contact"
        className="py-16 sm:py-24 relative z-10"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={stagger}
      >
        <div className="max-w-2xl mx-auto px-6">
          <motion.div variants={fadeUp} className="mb-8 sm:mb-10 text-center">
            <p
              className={cn(
                "text-sm font-semibold tracking-widest uppercase mb-3",
                dark ? "text-cyan-400" : "text-[#8b1a1a]"
              )}
            >
              {t.getInTouch}
            </p>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gradient">
              {t.contact}
            </h2>
            <Divider dark={dark} />
            <p
              className={cn(
                "text-sm mt-4",
                dark ? "text-white/40" : "text-[#7a4a35]/70"
              )}
            >
              {t.emailLabel}
            </p>
          </motion.div>

          <ContactForm
            dark={dark}
            lang={lang}
            inputClass={inputClass}
            emailMe={t.emailMe}
          />
        </div>
      </motion.section>

      {/* ── FOOTER ── */}
      <footer
        className={cn(
          "relative z-10 py-8 border-t",
          dark ? "border-white/6" : "border-[#8b1a1a]/10"
        )}
      >
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p
            className={cn(
              "text-xs tracking-wide",
              dark ? "text-white/25" : "text-[#7a4a35]/50"
            )}
          >
            © {new Date().getFullYear()} Pavan Kumar · Crafted with React &amp; Three.js ·{" "}
            <Link
              href="/admin"
              className="opacity-40 hover:opacity-100 hover:underline transition-opacity"
              title="Admin Portal"
            >
              Admin
            </Link>
          </p>
          <div className="flex items-center gap-5">
            {socials.map(({ href, icon, label }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className={cn(
                  "text-lg transition-all duration-200",
                  dark ? "text-white/25 hover:text-cyan-400" : "text-[#7a4a35]/40 hover:text-[#8b1a1a]"
                )}
              >
                {icon}
              </a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}