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
import { FaGithub, FaGoogle, FaLinkedin, FaPenNib, FaReact, FaJsSquare, FaTimes, FaCheck, FaArrowRight, FaUser } from "react-icons/fa";
import { useTheme } from "./theme-provider";

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
function Divider({ dark }: { dark: boolean }) {
  return (
    <div className="flex items-center justify-center gap-3 my-3 mx-auto max-w-[80px]">
      <div
        className={`flex-1 h-px bg-gradient-to-r from-transparent ${
          dark ? "via-cyan-400/40" : "via-[#8b1a1a]/30"
        } to-transparent`}
      />
      <div
        className={`w-1.5 h-1.5 rounded-full shrink-0 ${
          dark
            ? "bg-cyan-400 shadow-[0_0_8px_rgba(0,212,255,0.7)]"
            : "bg-[#8b1a1a] shadow-[0_0_8px_rgba(139,26,26,0.35)]"
        }`}
      />
      <div
        className={`flex-1 h-px bg-gradient-to-r from-transparent ${
          dark ? "via-cyan-400/40" : "via-[#8b1a1a]/30"
        } to-transparent`}
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
    heroRole: "Full-Stack Developer & AI Enthusiast",
    whoIAm: "Who I Am",
    skillsStack: "Skills & Stack",
    whatIBuilt: "What I've Built",
    credentials: "Credentials",
    getInTouch: "Get in Touch",
    heroDesc:
      "2nd-year B.Tech student at NMAMIT, exploring web development, AI, and interactive projects that push the boundary of what's possible.",
    contactMe: "Contact Me",
    myWork: "My Work",
    aboutMeTitle: "About Me",
    aboutMeDesc:
      "I am a 2nd-year B.Tech student in Information Science and Engineering at N.M.A.M Institute of Technology, Nitte. Passionate about web development, 3D visuals, and interactive UI design. Skilled in C, Python, HTML, CSS, and React; I enjoy building websites and experimenting with AI-powered tools and creative prompts.",
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
        github: "https://github.com/pavankumareng29/Sankat-Saathi-IBM-Z-Datathon-2026-Project",
        labUrl: "/engineering-lab/sankat-saathi",
        logo: "/projects/sankat-saathi/cover.png",
        emoji: "🌊",
      },
      {
        title: "Atlas Life OS",
        tech: "React · Vite · Tailwind · Framer Motion · Supabase · PWA",
        desc: "Personal life operating system featuring an intelligent college attendance & bunk margin simulator, CGPA planner, Pomodoro focus engine, and cognitive AI morning brief.",
        github: "https://github.com/pavan55kumar/atlas",
        labUrl: "/engineering-lab/atlas",
        logo: "/projects/atlas/cover.png",
        emoji: "🧭",
      },
      {
        title: "Interactive 3D Portfolio",
        tech: "Next.js · React · Three.js · React Three Fiber · Drei · NextAuth",
        desc: "Modern personal portfolio with interactive 3D WebGL hero sphere, LinkedIn OAuth testimonials, and dedicated Engineering Lab deep-dives.",
        github: "https://github.com/pavan55kumar/projectportfolio",
        labUrl: "/engineering-lab/portfolio-3d",
        logo: "/projects/portfolio-3d/cover.png",
        emoji: "✨",
      },
      {
        title: "Spam Detection",
        tech: "Python · scikit-learn · NLTK · SpaCy · Streamlit · Transformers",
        desc: "Python ML app that detects spam messages using NLP pipelines and HuggingFace Transformers.",
        github: "https://github.com/pavan55kumar/E-mail-Spam-Detection",
        emoji: "🛡️",
      },
      {
        title: "Note Saver App",
        tech: "Python · Flask · Jinja2 · HTML · CSS · JavaScript",
        desc: "A simple Flask web app with Python backend and dynamic HTML/CSS/JS frontend using Jinja2 templates.",
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
        github: "https://github.com/pavankumareng29/Sankat-Saathi-IBM-Z-Datathon-2026-Project",
        labUrl: "/engineering-lab/sankat-saathi",
        logo: "/projects/sankat-saathi/cover.png",
        emoji: "🌊",
      },
      {
        title: "Atlas ライフOS",
        tech: "React · Vite · Tailwind · Framer Motion · Supabase · PWA",
        desc: "大学の出席欠席シミュレーター、CGPA計画、ポモドーロ集中タイマー、習慣ストリーク、AIブリーフィングを備えた統合学生ワークスペース。",
        github: "https://github.com/pavan55kumar/atlas",
        labUrl: "/engineering-lab/atlas",
        logo: "/projects/atlas/cover.png",
        emoji: "🧭",
      },
      {
        title: "3Dインタラクティブポートフォリオ",
        tech: "Next.js · React · Three.js · React Three Fiber · Drei · NextAuth",
        desc: "Three.jsによるインタラクティブな3D WebGLシーンとLinkedIn認証の推薦状システムを備えた個人ポートフォリオ。",
        github: "https://github.com/pavan55kumar/projectportfolio",
        labUrl: "/engineering-lab/portfolio-3d",
        logo: "/projects/portfolio-3d/cover.png",
        emoji: "✨",
      },
      {
        title: "スパム検出",
        tech: "Python · scikit-learn · NLTK · SpaCy · Streamlit · Transformers",
        desc: "NLPとHuggingFace Transformersを使用したスパム検出MLアプリ。",
        github: "https://github.com/pavan55kumar/E-mail-Spam-Detection",
        emoji: "🛡️",
      },
      {
        title: "ノート保存アプリ",
        tech: "Python · Flask · Jinja2 · HTML · CSS · JavaScript",
        desc: "PythonバックエンドとJinja2テンプレートを使用したFlaskウェブアプリ。",
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

// ── Your real certificate images (add more filenames here as you earn them) ──
const certFiles = ["az1.jpeg", "az2.jpeg", "az3.jpeg"];

const certCards = [
  {
    title: "Microsoft Certificates",
    subtitle: "Azure Fundamentals · AI Essentials · Cloud Basics",
    issuer: "Microsoft",
    year: "2024",
    icon: "🏅",
    colorDark: "#0ea5e9",
    colorLight: "#c9956a",
    real: true,
  },
  {
    title: "Add Your Certificate",
    subtitle: "Issued by · Platform · Topic",
    issuer: "Issuing Body",
    year: "—",
    icon: "📜",
    colorDark: "#7c3aed",
    colorLight: "#8b1a1a",
    real: false,
  },
  {
    title: "Add Your Certificate",
    subtitle: "Issued by · Platform · Topic",
    issuer: "Issuing Body",
    year: "—",
    icon: "🎖️",
    colorDark: "#10b981",
    colorLight: "#6b7280",
    real: false,
  },
  {
    title: "Add Your Certificate",
    subtitle: "Issued by · Platform · Topic",
    issuer: "Issuing Body",
    year: "—",
    icon: "🏆",
    colorDark: "#f59e0b",
    colorLight: "#d97706",
    real: false,
  },
  {
    title: "Add Your Certificate",
    subtitle: "Issued by · Platform · Topic",
    issuer: "Issuing Body",
    year: "—",
    icon: "⭐",
    colorDark: "#ec4899",
    colorLight: "#be185d",
    real: false,
  },
];

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
    <div className="relative w-full max-w-[320px] h-[130px] mx-auto flex items-center justify-center select-none pointer-events-none mb-3">
      {/* Background radial glow */}
      <div
        className="absolute inset-0 rounded-full blur-2xl opacity-60"
        style={{
          background: dark
            ? "radial-gradient(circle, rgba(0, 150, 255, 0.25) 0%, rgba(147, 51, 234, 0.2) 60%, transparent 80%)"
            : "radial-gradient(circle, rgba(201, 149, 106, 0.2) 0%, transparent 70%)",
        }}
      />

      {/* Decorative sparkles */}
      <span className="absolute top-1 left-6 text-cyan-400/70 text-sm">✦</span>
      <span className="absolute bottom-3 left-10 text-purple-400/60 text-xs">✦</span>
      <span className="absolute bottom-1 right-8 text-cyan-300/70 text-xs">✦</span>

      {/* Radiating sparks (top right) */}
      <div className="absolute top-1 right-12 flex items-end gap-1">
        <span className="w-0.5 h-2.5 rounded-full bg-cyan-400 -rotate-25 shadow-[0_0_8px_rgba(0,212,255,0.8)]" />
        <span className="w-0.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(0,212,255,0.8)]" />
        <span className="w-0.5 h-2.5 rounded-full bg-cyan-400 rotate-25 shadow-[0_0_8px_rgba(0,212,255,0.8)]" />
      </div>

      {/* Back card (Dark blue with user avatar and placeholder bars) */}
      <div
        className={cn(
          "absolute -top-1 left-4 sm:left-6 w-[190px] sm:w-[210px] rounded-2xl p-3 flex items-center gap-3 border shadow-lg transition-transform",
          dark
            ? "bg-[#132238]/95 border-blue-400/30 shadow-[0_8px_25px_rgba(0,100,255,0.25)]"
            : "bg-[#fffaf2] border-[#8b1a1a]/20 shadow-md"
        )}
      >
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
            dark
              ? "bg-blue-500/25 border-blue-400/40 text-blue-300"
              : "bg-[#8b1a1a]/10 border-[#8b1a1a]/20 text-[#8b1a1a]"
          )}
        >
          <FaUser className="text-xs" />
        </div>
        <div className="flex-1 space-y-1.5">
          <div
            className={cn(
              "h-2 w-20 rounded-full",
              dark ? "bg-blue-300/30" : "bg-[#8b1a1a]/25"
            )}
          />
          <div
            className={cn(
              "h-1.5 w-12 rounded-full",
              dark ? "bg-blue-300/20" : "bg-[#8b1a1a]/15"
            )}
          />
        </div>
      </div>

      {/* Front card (Purple with user avatar and placeholder bars) */}
      <div
        className={cn(
          "absolute top-7 right-4 sm:right-6 w-[190px] sm:w-[210px] rounded-2xl p-3 flex items-center gap-3 border shadow-xl z-10 transition-transform",
          dark
            ? "bg-[#251842]/95 border-purple-400/40 shadow-[0_12px_32px_rgba(147,51,234,0.35)]"
            : "bg-[#fff] border-[#c9956a]/30 shadow-lg"
        )}
      >
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border",
            dark
              ? "bg-purple-500/35 border-purple-300/50 text-purple-200"
              : "bg-[#c9956a]/20 border-[#c9956a]/40 text-[#8b1a1a]"
          )}
        >
          <FaUser className="text-xs" />
        </div>
        <div className="flex-1 space-y-1.5">
          <div
            className={cn(
              "h-2 w-24 rounded-full",
              dark ? "bg-purple-300/40" : "bg-[#8b1a1a]/30"
            )}
          />
          <div
            className={cn(
              "h-1.5 w-16 rounded-full",
              dark ? "bg-purple-300/25" : "bg-[#8b1a1a]/20"
            )}
          />
        </div>
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
              "max-w-xl mx-auto rounded-3xl border p-8 sm:p-10 text-center space-y-6 overflow-hidden relative",
              dark
                ? "bg-[#091122]/90 border-blue-500/25 shadow-[0_8px_32px_rgba(0,140,255,0.15)]"
                : "bg-[#fffaf2]/80 border-[#8b1a1a]/15 shadow-[0_8px_32px_rgba(139,26,26,0.08)]"
            )}
          >
            <TestimonialsEmptyIllustration dark={dark} />

            <div className="space-y-2">
              <h3 className={cn("text-2xl font-bold tracking-tight", dark ? "text-white" : "text-[#2a1008]")}>
                {t.noTestimonialsYet || (lang === "jp" ? "推薦状はまだありません" : "No testimonials yet")}
              </h3>
              <p className={cn("text-sm leading-relaxed max-w-md mx-auto", dark ? "text-white/60" : "text-[#7a4a35]/80")}>
                {t.noTestimonialsDesc || (lang === "jp"
                  ? "パヴァンとの協業やプロジェクトの体験を最初にシェアしませんか？Googleアカウントでサインインして、LinkedInプロフィールのリンクを添えて推薦状を投稿できます。"
                  : "Be the first peer, colleague, or collaborator to share your experience working with Pavan! Sign in with your Google account to leave a testimonial, and paste your LinkedIn profile link.")}
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3 pt-1">
              <span
                className={cn(
                  "inline-flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-full border shadow-sm",
                  dark
                    ? "border-white/10 text-white/80 bg-[#0e1726]/80"
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
                    ? "border-white/10 text-white/80 bg-[#0e1726]/80"
                    : "border-[#8b1a1a]/15 text-[#7a4a35] bg-[#8b1a1a]/5"
                )}
              >
                <FaLinkedin className="text-xs text-[#0A66C2]" />
                <span>{lang === "jp" ? "LinkedIn連携" : "LinkedIn Profile Badge"}</span>
              </span>
            </div>

            {!showForm && (
              <motion.button
                type="button"
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => { setShowForm(true); setStatus("idle"); }}
                className={cn(
                  "w-full max-w-sm mx-auto flex items-center justify-center gap-2.5 rounded-2xl px-8 py-3.5 font-semibold text-sm text-white shadow-xl transition-all duration-300 mt-2",
                  dark
                    ? "bg-gradient-to-r from-[#00d2ff] via-[#009bf9] to-[#0066ff] shadow-[0_0_25px_rgba(0,180,255,0.4)] hover:shadow-[0_0_35px_rgba(0,180,255,0.6)]"
                    : "bg-gradient-to-r from-[#8b1a1a] to-[#c9956a] shadow-[0_4px_20px_rgba(139,26,26,0.3)] hover:shadow-[0_6px_30px_rgba(139,26,26,0.45)]"
                )}
              >
                <FaPenNib className="text-xs" />
                <span>{t.leaveFirstTestimonial || (lang === "jp" ? "最初の推薦状を書く" : "Leave the First Testimonial")}</span>
              </motion.button>
            )}
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
                      <div className="flex items-center gap-1.5">
                        <p className={cn("text-sm font-semibold truncate", dark ? "text-white" : "text-[#2a1008]")}>
                          {item.name}
                        </p>
                        {item.linkedin && (
                          <a
                            href={item.linkedin.startsWith("http") ? item.linkedin : `https://${item.linkedin}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title="View LinkedIn Profile"
                            className="text-[#0A66C2] hover:scale-110 transition-transform shrink-0"
                          >
                            <FaLinkedin className="text-xs" />
                          </a>
                        )}
                      </div>
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

        {/* Leave a testimonial toggle */}
        <motion.div
          className="mt-10 flex flex-col items-center gap-6"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.button
            type="button"
            whileHover={{ scale: 1.04, y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => { setShowForm((v) => !v); setStatus("idle"); }}
            aria-expanded={showForm}
            className={cn(
              "group relative inline-flex items-center gap-3.5 overflow-hidden rounded-2xl border px-6 py-2.5 font-semibold text-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 shadow-lg",
              dark
                ? "border-cyan-500/25 bg-[#071322]/90 text-white hover:border-cyan-400/50 hover:shadow-[0_8px_30px_rgba(0,212,255,0.15)] focus-visible:ring-cyan-300 focus-visible:ring-offset-[#030712]"
                : "border-[#8b1a1a]/20 bg-[#fffaf2] text-[#6f1919] hover:border-[#8b1a1a]/45 shadow-[0_4px_20px_rgba(139,26,26,0.08)] focus-visible:ring-[#8b1a1a] focus-visible:ring-offset-[#f5ede0]"
            )}
          >
            <span
              className={cn(
                "flex h-7 w-7 items-center justify-center rounded-lg border transition-all duration-300",
                dark
                  ? "border-cyan-400/25 bg-cyan-400/10 text-cyan-300 group-hover:border-cyan-400/50"
                  : "border-[#8b1a1a]/15 bg-[#8b1a1a]/10 text-[#8b1a1a] group-hover:border-[#8b1a1a]/25"
              )}
            >
              {showForm ? <FaTimes className="text-xs" /> : <FaPenNib className="text-xs transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" />}
            </span>
            <span>{showForm ? (lang === "jp" ? "閉じる" : "Close") : t.leaveTestimonial}</span>
            <span className={cn(
              "ml-1 h-1.5 w-1.5 rounded-full transition-colors duration-300 shrink-0",
              dark
                ? "bg-cyan-400 shadow-[0_0_8px_rgba(0,212,255,0.8)]"
                : "bg-[#8b1a1a]/60"
            )} />
          </motion.button>

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

export default function Home() {
  const { dark, toggle: toggleTheme } = useTheme(); // shared with Engineering Lab
  const [showNav, setShowNav] = useState(true);
  const [lang, setLang] = useState<"en" | "jp">("en");
  const [certOpen, setCertOpen] = useState(false);
  const [certIndex, setCertIndex] = useState(0);
  const [navScrolled, setNavScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [dynamicProjects, setDynamicProjects] = useState<any[] | null>(null);
  const [dynamicCertificates, setDynamicCertificates] = useState<any[] | null>(null);

  useEffect(() => {
    fetch("/api/projects")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setDynamicProjects(data);
      })
      .catch(() => {});

    fetch("/api/certificates")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setDynamicCertificates(data);
      })
      .catch(() => {});
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
  }, []);

  // Cert modal
  const openCert = (i: number) => {
    setCertIndex(i);
    setCertOpen(true);
  };
  const closeCert = useCallback(() => setCertOpen(false), []);
  const showPrev = useCallback(
    () =>
      setCertIndex((i) => (i - 1 + certFiles.length) % certFiles.length),
    []
  );
  const showNext = useCallback(
    () => setCertIndex((i) => (i + 1) % certFiles.length),
    []
  );

  useEffect(() => {
    if (!certOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCert();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [certOpen, closeCert, showPrev, showNext]);

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

      {/* FABs (hidden while the mobile menu is open — the menu has its own) */}
      <div
        className={cn(
          "fixed bottom-6 right-5 sm:bottom-8 sm:right-8 z-50 flex flex-col gap-3 transition-opacity duration-300",
          mobileMenuOpen && "pointer-events-none opacity-0"
        )}
      >
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

          {/* Hamburger → X */}
          <button
            type="button"
            className={cn(
              "md:hidden relative h-11 w-11 rounded-full transition-colors duration-200",
              dark ? "text-white hover:bg-white/8" : "text-[#2a1008] hover:bg-[#8b1a1a]/8"
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

      {/* ── MOBILE MENU (full-screen, minimal) ── */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className={cn(
              "fixed inset-0 z-30 md:hidden flex flex-col overflow-y-auto px-7 pb-8 pt-24 backdrop-blur-2xl",
              dark ? "bg-[#030712]/95" : "bg-[#f5ede0]/97"
            )}
          >
            <nav className="flex flex-col" aria-label="Mobile">
              {sectionIds.map((id, i) => {
                const isActive = activeSection === id;
                return (
                  <motion.a
                    key={id}
                    href={`#${id}`}
                    onClick={goTo(id)}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 + i * 0.04, duration: 0.3 }}
                    className={cn(
                      "flex items-center justify-between border-b py-4 text-[26px] font-medium tracking-tight transition-colors",
                      dark ? "border-white/[0.07]" : "border-[#8b1a1a]/10",
                      isActive
                        ? dark ? "text-white" : "text-[#8b1a1a]"
                        : dark ? "text-white/45 active:text-white" : "text-[#2a1008]/50 active:text-[#2a1008]"
                    )}
                  >
                    {sectionLabels[id]}
                    {isActive && (
                      <span className={cn("h-1.5 w-1.5 rounded-full", dark ? "bg-cyan-400" : "bg-[#8b1a1a]")} />
                    )}
                  </motion.a>
                );
              })}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 + sectionIds.length * 0.04, duration: 0.3 }}
              >
                <Link
                  href="/connect"
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center justify-between py-4 text-[26px] font-medium tracking-tight transition-colors",
                    dark ? "text-white/45 active:text-white" : "text-[#2a1008]/50 active:text-[#2a1008]"
                  )}
                >
                  {t.engineeringLab}
                  <span className="text-lg">↗</span>
                </Link>
              </motion.div>
            </nav>

            <div className="mt-auto space-y-5 pt-8">
              <a
                href="/resume.pdf"
                download
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex h-12 w-full items-center justify-center rounded-full border text-sm font-semibold transition-colors",
                  dark
                    ? "border-white/20 text-white hover:bg-white/8"
                    : "border-[#8b1a1a]/35 text-[#8b1a1a] hover:bg-[#8b1a1a]/8"
                )}
              >
                {t.resume}
              </a>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-5">
                  {socials.map(({ href, icon, label }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className={cn("text-xl", dark ? "text-white/45 hover:text-white" : "text-[#7a4a35]/70 hover:text-[#8b1a1a]")}
                    >
                      {icon}
                    </a>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleTheme}
                    aria-label="Toggle theme"
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border text-base",
                      dark ? "border-white/15" : "border-[#8b1a1a]/25"
                    )}
                  >
                    {dark ? "☀️" : "🌙"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setLang(lang === "en" ? "jp" : "en")}
                    aria-label="Toggle language"
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border text-xs font-bold",
                      dark ? "border-white/15 text-cyan-300" : "border-[#8b1a1a]/25 text-[#8b1a1a]"
                    )}
                  >
                    {lang === "en" ? "JP" : "EN"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
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
                {t.heroRole}
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="text-5xl sm:text-7xl md:text-8xl font-extrabold tracking-tight text-gradient leading-none"
            >
              {t.name}
            </motion.h1>

            <motion.p
              variants={fadeUp}
              className={cn(
                "text-base sm:text-lg max-w-xl leading-relaxed",
                dark ? "text-white/50" : "text-[#7a4a35]"
              )}
            >
              {t.heroDesc}
            </motion.p>

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

          <div className="grid md:grid-cols-2 gap-10 md:gap-16 items-start">
            <motion.div variants={fadeUp} className="space-y-6">
              <p
                className={cn(
                  "text-base leading-relaxed",
                  dark ? "text-white/60" : "text-[#5a3020]"
                )}
              >
                {t.aboutMeDesc}
              </p>
              <div className="space-y-5">
                <div
                  className={cn(
                    "glass-card rounded-2xl p-5 border",
                    dark ? "border-white/8" : "border-[#8b1a1a]/12"
                  )}
                >
                  <h3 className="text-sm font-semibold text-gradient-gold mb-2 tracking-wide uppercase">
                    {t.education}
                  </h3>
                  <p
                    className={cn(
                      "text-sm leading-relaxed",
                      dark ? "text-white/55" : "text-[#7a4a35]"
                    )}
                  >
                    {t.educationDesc}
                  </p>
                </div>
                <div
                  className={cn(
                    "glass-card rounded-2xl p-5 border",
                    dark ? "border-white/8" : "border-[#8b1a1a]/12"
                  )}
                >
                  <h3
                    className={cn(
                      "text-sm font-semibold mb-3 tracking-wide uppercase",
                      dark ? "text-cyan-300" : "text-[#8b1a1a]"
                    )}
                  >
                    {t.experience}
                  </h3>
                  <ul className="space-y-2">
                    {t.experienceList.map((exp, i) => (
                      <li
                        key={i}
                        className={cn(
                          "flex items-start gap-3 text-sm",
                          dark ? "text-white/55" : "text-[#7a4a35]"
                        )}
                      >
                        <span
                          className={cn(
                            "w-1 h-1 rounded-full mt-2 shrink-0",
                            dark ? "bg-cyan-400" : "bg-[#8b1a1a]"
                          )}
                        />
                        {exp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <h3
                className={cn(
                  "text-sm font-semibold tracking-widest uppercase mb-6",
                  dark ? "text-white/40" : "text-[#7a4a35]/60"
                )}
              >
                {t.skillsStack}
              </h3>
              <div className="flex flex-wrap gap-3">
                {skills.map(({ label, icon }, i) => (
                  <motion.span
                    key={label}
                    variants={scaleIn}
                    custom={i}
                    whileHover={{ scale: 1.06, y: -2 }}
                    className={cn(
                      "inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold glass-card border transition-all duration-300 glow-border",
                      dark
                        ? "border-white/10 text-cyan-200 hover:border-cyan-400/40 hover:text-cyan-300"
                        : "border-[#8b1a1a]/18 text-[#8b1a1a] hover:border-[#8b1a1a]/45 hover:bg-[#8b1a1a]/6"
                    )}
                    style={{ animationDelay: `${i * 0.4}s` }}
                  >
                    {icon && <span className="text-base">{icon}</span>}
                    {label}
                  </motion.span>
                ))}
              </div>
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
          <motion.div variants={fadeUp} className="mb-8 sm:mb-10">
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
        </div>

        <motion.div
          ref={scrollRef}
          variants={stagger}
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-2"
          style={{
            paddingLeft: "max(1.5rem, calc((100vw - 72rem) / 2))",
            paddingRight: "max(1.5rem, calc((100vw - 72rem) / 2))",
          }}
        >
          {(dynamicProjects || t.projectsList).map(({ title, tech, desc, github, emoji, logo, labUrl }: any, i: number) => (
            <motion.div
              key={i}
              variants={fadeUp}
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
        </div>

        <div
          className="flex gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 pt-2"
          style={{
            paddingLeft: "max(1.5rem, calc((100vw - 72rem) / 2))",
            paddingRight: "max(1.5rem, calc((100vw - 72rem) / 2))",
          }}
        >
          {(dynamicCertificates || certCards).map((card: any, i: number) => {
            const color = dark ? (card.colorDark || card.color_dark || "#0ea5e9") : (card.colorLight || card.color_light || "#c9956a");
            const cardImg = card.imageUrl || card.image_url;
            const isReal = card.real !== false && (card.real === true || !!cardImg);
            return (
              <motion.div
                key={i}
                className="snap-start shrink-0 w-[280px] sm:w-[320px]"
                initial={{ opacity: 0, y: 70, rotateY: -18 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{
                  duration: 0.75,
                  delay: i * 0.13,
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

                    {cardImg ? (
                      <div className="relative w-full h-44 flex items-center justify-center">
                        <div
                          onClick={() => {
                            if (cardImg.startsWith("http") || cardImg.startsWith("/")) {
                              window.open(cardImg, "_blank");
                            } else {
                              openCert(0);
                            }
                          }}
                          className="relative w-48 h-32 rounded-xl overflow-hidden shadow-2xl cursor-pointer transition-all duration-300 hover:scale-105"
                          style={{ border: "1px solid rgba(255,255,255,0.18)" }}
                        >
                          <Image
                            src={cardImg}
                            alt={card.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </div>
                    ) : isReal ? (
                      <div className="relative w-full h-44 flex items-center justify-center">
                        {[
                          { rot: "-11deg", top: "6px",  scale: 0.86, z: 1 },
                          { rot: "1deg",   top: "16px", scale: 0.93, z: 2 },
                          { rot: "11deg",  top: "26px", scale: 1,    z: 3 },
                        ].map((s, idx) => (
                          <div
                            key={idx}
                            onClick={() => openCert(idx)}
                            className="absolute left-1/2 w-48 h-32 rounded-xl overflow-hidden shadow-2xl cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10"
                            style={{
                              border: "1px solid rgba(255,255,255,0.18)",
                              transform: `translateX(-50%) rotate(${s.rot}) scale(${s.scale})`,
                              top: s.top,
                              zIndex: s.z,
                            }}
                          >
                            <Image
                              src={`/certificates/${certFiles[idx]}`}
                              alt={`Certificate ${idx + 1}`}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ))}
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
                          Coming Soon
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

                    {isReal ? (
                      <button
                        onClick={() => {
                          if (cardImg) {
                            window.open(cardImg, "_blank");
                          } else {
                            openCert(0);
                          }
                        }}
                        className={cn(
                          "text-xs font-semibold transition-colors duration-200",
                          dark
                            ? "text-cyan-300 hover:text-white"
                            : "text-[#8b1a1a] hover:text-[#2a1008]"
                        )}
                      >
                        {cardImg ? "View Certificate ↗" : "View all certificates →"}
                      </button>
                    ) : (
                      <p
                        className={cn(
                          "text-[10px]",
                          dark ? "text-white/18" : "text-[#8b1a1a]/28"
                        )}
                      >
                        Replace with your certificate details
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
      </motion.section>

      {/* ── CERT MODAL ── */}
      <AnimatePresence>
        {certOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "fixed inset-0 backdrop-blur-md flex items-center justify-center z-[100] p-6",
              dark ? "bg-black/85" : "bg-[#2a1008]/70"
            )}
            onClick={closeCert}
          >
            <motion.div
              initial={{ scale: 0.88, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "relative max-w-3xl w-full rounded-2xl overflow-hidden p-6",
                dark
                  ? "glass-card border border-white/12"
                  : "bg-[#f5ede0] border border-[#8b1a1a]/20 shadow-2xl"
              )}
              onClick={(e) => e.stopPropagation()}
              onTouchStart={(e) => {
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
                onClick={closeCert}
                className={cn(
                  "absolute top-4 right-4 w-9 h-9 rounded-full border flex items-center justify-center transition-colors z-10",
                  dark
                    ? "glass border-white/15 text-white/60 hover:text-white"
                    : "bg-[#f5ede0] border-[#8b1a1a]/25 text-[#8b1a1a]/60 hover:text-[#8b1a1a]"
                )}
              >
                ✕
              </button>

              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden">
                <Image
                  src={`/certificates/${certFiles[certIndex]}`}
                  alt={`Certificate ${certIndex + 1}`}
                  fill
                  className="object-contain"
                />
              </div>

              <div className="flex items-center justify-between mt-5">
                <button
                  onClick={showPrev}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all",
                    dark
                      ? "glass border-white/10 text-white/70 hover:text-white hover:border-white/25"
                      : "bg-[#f5ede0] border-[#8b1a1a]/25 text-[#8b1a1a]/70 hover:text-[#8b1a1a] hover:border-[#8b1a1a]/50"
                  )}
                >
                  ← Prev
                </button>
                <span
                  className={cn(
                    "text-sm",
                    dark ? "text-white/30" : "text-[#7a4a35]/60"
                  )}
                >
                  {certIndex + 1} / {certFiles.length}
                </span>
                <button
                  onClick={showNext}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-xl border text-sm font-semibold transition-all",
                    dark
                      ? "glass border-white/10 text-white/70 hover:text-white hover:border-white/25"
                      : "bg-[#f5ede0] border-[#8b1a1a]/25 text-[#8b1a1a]/70 hover:text-[#8b1a1a] hover:border-[#8b1a1a]/50"
                  )}
                >
                  Next →
                </button>
              </div>
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
                "text-sm font-semibold tracking-widest uppercase mb-3",
                dark ? "text-cyan-400" : "text-[#8b1a1a]"
              )}
            >
              {t.whatOthersSay}
            </p>
            <h2 className="text-4xl sm:text-5xl font-extrabold text-gradient">
              {t.testimonials}
            </h2>
            <Divider dark={dark} />
            <p
              className={cn(
                "text-sm mt-4",
                dark ? "text-white/40" : "text-[#7a4a35]/70"
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