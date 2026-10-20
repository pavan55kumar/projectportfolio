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
import { FaGithub, FaGoogle, FaLinkedin, FaPenNib, FaReact, FaJsSquare, FaTimes } from "react-icons/fa";
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

// ─── 3-D Sphere ───────────────────────────────────────────────────────────────
// Scales with the screen width so it stays a tasteful orb on phones.
// To tweak on mobile: change `0.5` (size) and `0.55` (height) below.
function InteractiveSphere({ dark, mobile }: { dark: boolean; mobile: boolean }) {
  const mesh = useRef<any>(null);
  const width = useThree((s) => s.size.width);
  const scale = width < 480 ? 0.5 : width < 768 ? 0.65 : width < 1024 ? 0.85 : 1;

  useFrame(({ mouse }, delta) => {
    if (!mesh.current) return;
    if (mobile) {
      // no mouse on touch screens → gentle self-rotation instead
      mesh.current.rotation.y += delta * 0.25;
      mesh.current.rotation.x += delta * 0.08;
      return;
    }
    mesh.current.rotation.x +=
      (mouse.y * 0.4 - mesh.current.rotation.x) * 0.05;
    mesh.current.rotation.y +=
      (mouse.x * 0.4 - mesh.current.rotation.y) * 0.05;
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
        distort={mobile ? 0.32 : 0.42}
        speed={2.2}
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
    <div className="flex items-center gap-4 my-2">
      <div
        className={`flex-1 h-px bg-gradient-to-r from-transparent ${
          dark ? "via-cyan-500/40" : "via-[#8b1a1a]/30"
        } to-transparent`}
      />
      <div
        className={`w-1.5 h-1.5 rounded-full ${
          dark ? "bg-cyan-400" : "bg-[#8b1a1a]"
        }`}
      />
      <div
        className={`flex-1 h-px bg-gradient-to-r from-transparent ${
          dark ? "via-cyan-500/40" : "via-[#8b1a1a]/30"
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
        title: "Note Saver App",
        tech: "Python · Flask · Jinja2 · HTML · CSS · JavaScript",
        desc: "A simple Flask web app with Python backend and dynamic HTML/CSS/JS frontend using Jinja2 templates.",
        github: "https://github.com/pavan55kumar/FLASK-note-saver",
        emoji: "📝",
      },
      {
        title: "Spam Detection",
        tech: "Python · scikit-learn · NLTK · SpaCy · Streamlit · Transformers",
        desc: "Python ML app that detects spam messages using NLP pipelines and HuggingFace Transformers.",
        github: "https://github.com/pavan55kumar/E-mail-Spam-Detection",
        emoji: "🛡️",
      },
      {
        title: "Weather App",
        tech: "React · OpenWeather API · Tailwind CSS",
        desc: "Responsive weather app fetching real-time data and forecasts from the OpenWeather API.",
        github: "https://github.com/pavan55kumar/weather-app",
        emoji: "🌤️",
      },
      {
        title: "Todo Manager",
        tech: "React · Redux · TypeScript",
        desc: "Modern todo app with full Redux state management, TypeScript types, and drag-and-drop support.",
        github: "https://github.com/pavan55kumar/todo-manager",
        emoji: "✅",
      },
      {
        title: "Chatbot Assistant",
        tech: "Python · Flask · Transformers · Streamlit",
        desc: "AI-powered chatbot using HuggingFace Transformers with an elegant Streamlit web interface.",
        github: "https://github.com/pavan55kumar/chatbot-assistant",
        emoji: "🤖",
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
    testimonialLinkedin: "LinkedIn URL (optional)",
    testimonialSubmit: "Submit Testimonial",
    testimonialSuccess: "Thank you so much!",
    testimonialSuccessDesc: "Your testimonial has been received.",
    testimonialSendAnother: "Leave another",
    testimonialPlaceholderMsg: "Share your experience working with or knowing Pavan...",
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
        title: "ノート保存アプリ",
        tech: "Python · Flask · Jinja2 · HTML · CSS · JavaScript",
        desc: "PythonバックエンドとJinja2テンプレートを使用したFlaskウェブアプリ。",
        github: "https://github.com/pavan55kumar/FLASK-note-saver",
        emoji: "📝",
      },
      {
        title: "スパム検出",
        tech: "Python · scikit-learn · NLTK · SpaCy · Streamlit · Transformers",
        desc: "NLPとHuggingFace Transformersを使用したスパム検出MLアプリ。",
        github: "https://github.com/pavan55kumar/E-mail-Spam-Detection",
        emoji: "🛡️",
      },
      {
        title: "天気アプリ",
        tech: "React · OpenWeather API · Tailwind CSS",
        desc: "OpenWeather APIからリアルタイムデータを取得するレスポンシブな天気アプリ。",
        github: "https://github.com/pavan55kumar/weather-app",
        emoji: "🌤️",
      },
      {
        title: "Todoマネージャー",
        tech: "React · Redux · TypeScript",
        desc: "Reduxによる完全な状態管理とTypeScript型を備えたモダンなTodoアプリ。",
        github: "https://github.com/pavan55kumar/todo-manager",
        emoji: "✅",
      },
      {
        title: "チャットボット",
        tech: "Python · Flask · Transformers · Streamlit",
        desc: "HuggingFace TransformersとStreamlitを使用したAIチャットボット。",
        github: "https://github.com/pavan55kumar/chatbot-assistant",
        emoji: "🤖",
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
    testimonialLinkedin: "LinkedIn URL（任意）",
    testimonialSubmit: "送信する",
    testimonialSuccess: "ありがとうございます！",
    testimonialSuccessDesc: "推薦状を受け取りました。",
    testimonialSendAnother: "もう一つ書く",
    testimonialPlaceholderMsg: "パヴァンとの仕事や交流の経験を共有してください...",
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
  seed?: boolean;
};

const seedTestimonials: Testimonial[] = [
  {
    id: "s1",
    name: "Priya Sharma",
    role: "Peer, ISE'28 · NMAMIT",
    message: "Pavan has an incredible passion for technology. Working with him on group projects showed me how quickly he grasps complex concepts and turns ideas into reality. His dedication is truly inspiring.",
    linkedin: "https://linkedin.com",
    initials: "PS",
    avatarColor: "#0ea5e9",
    date: "Oct 2024",
    seed: true,
  },
  {
    id: "s2",
    name: "Rohan Kamath",
    role: "Classmate · NMAMIT ISE'28",
    message: "Pavan's eye for design combined with his coding skills makes him stand out. He built our project UI from scratch and it looked polished and professional — far beyond what we expected.",
    linkedin: "https://linkedin.com",
    initials: "RK",
    avatarColor: "#7c3aed",
    date: "Nov 2024",
    seed: true,
  },
  {
    id: "s3",
    name: "Sneha Bhat",
    role: "Project Partner · NMAMIT",
    message: "Exceptional collaborator — always prepared, communicates clearly, and consistently goes above and beyond. Pavan's front-end work on our hackathon project was the reason we won first place.",
    initials: "SB",
    avatarColor: "#10b981",
    date: "Dec 2024",
    seed: true,
  },
];

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
  const [testimonials, setTestimonials] = useState<Testimonial[]>(seedTestimonials);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ role: "", message: "", linkedin: "" });
  const [status, setStatus] = useState<"idle" | "success">("idle");
  const authorName =
    session?.user?.name?.trim() || session?.user?.email?.split("@")[0] || "";
  const authorImage = session?.user?.image || undefined;

  useEffect(() => {
    try {
      const saved = localStorage.getItem("pavan_testimonials");
      if (saved) {
        const parsed: Testimonial[] = JSON.parse(saved);
        setTestimonials([...seedTestimonials, ...parsed]);
      }
    } catch {}
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      sessionStatus !== "authenticated" ||
      !authorName ||
      !form.role.trim() ||
      !form.message.trim()
    ) return;
    const colors = ["#00d4ff", "#7c3aed", "#ec4899", "#f59e0b", "#10b981", "#0ea5e9"];
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
    };
    try {
      const existing: Testimonial[] = JSON.parse(localStorage.getItem("pavan_testimonials") || "[]");
      const updated = [...existing, newT];
      localStorage.setItem("pavan_testimonials", JSON.stringify(updated));
      setTestimonials([...seedTestimonials, ...updated]);
    } catch {
      setTestimonials((prev) => [...prev, newT]);
    }
    setStatus("success");
    setForm({ role: "", message: "", linkedin: "" });
  };

  const accent = dark ? "#00d4ff" : "#8b1a1a";

  return (
    <>
      {/* Cards grid */}
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className={cn(
                "relative rounded-2xl border p-6 flex flex-col gap-4 group overflow-hidden transition-all duration-500",
                dark
                  ? "glass-card border-white/8 hover:border-cyan-400/30 hover:shadow-[0_8px_40px_rgba(0,212,255,0.08)]"
                  : "glass-card border-[#8b1a1a]/12 hover:border-[#8b1a1a]/35 shadow-[0_2px_20px_rgba(139,26,26,0.06)] hover:shadow-[0_8px_40px_rgba(139,26,26,0.12)]"
              )}
            >
              <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none"
                style={{
                  background: `radial-gradient(ellipse at top left, ${item.avatarColor}10 0%, transparent 60%)`,
                }}
              />

              <span
                className="absolute top-3 right-5 text-7xl font-serif leading-none select-none pointer-events-none"
                style={{ color: item.avatarColor, opacity: dark ? 0.1 : 0.12 }}
              >
                ”
              </span>

              <p
                className={cn(
                  "text-sm leading-relaxed italic flex-1 relative z-10",
                  dark ? "text-white/70" : "text-[#5a3020]/80"
                )}
              >
                &ldquo;{item.message}&rdquo;
              </p>

              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, si) => (
                  <span key={si} className="text-amber-400 text-sm">★</span>
                ))}
              </div>

              <div className="flex items-center gap-3 pt-1 border-t relative z-10" style={{ borderColor: dark ? "rgba(255,255,255,0.06)" : "rgba(139,26,26,0.08)" }}>
                <div
                  className="relative w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-lg overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${item.avatarColor} 0%, ${item.avatarColor}99 100%)` }}
                >
                  {item.avatarImage ? (
                    <Image
                      src={item.avatarImage}
                      alt={`${item.name}'s Google profile`}
                      fill
                      sizes="40px"
                      className="object-cover"
                    />
                  ) : item.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn("text-sm font-semibold truncate", dark ? "text-white" : "text-[#2a1008]")}>
                    {item.name}
                  </p>
                  <p className={cn("text-xs truncate", dark ? "text-white/40" : "text-[#7a4a35]/70")}>
                    {item.role}
                  </p>
                </div>
                {item.linkedin && (
                  <motion.a
                    href={item.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${item.name} on LinkedIn`}
                    whileHover={{ scale: 1.2, y: -2 }}
                    className={cn(
                      "w-8 h-8 rounded-lg border flex items-center justify-center shrink-0 transition-all duration-200",
                      dark
                        ? "border-white/10 text-white/30 hover:border-[#0EA5E9]/60 hover:text-[#0EA5E9] hover:bg-[#0EA5E9]/10"
                        : "border-[#8b1a1a]/15 text-[#8b1a1a]/40 hover:border-[#0077B5]/50 hover:text-[#0077B5] hover:bg-[#0077B5]/8"
                    )}
                  >
                    <FaLinkedin className="text-sm" />
                  </motion.a>
                )}
                <span className={cn("text-[10px] shrink-0", dark ? "text-white/20" : "text-[#8b1a1a]/30")}>
                  {item.date}
                </span>
              </div>
            </motion.div>
          ))}
        </div>

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
              "group relative inline-flex items-center gap-3 overflow-hidden rounded-xl border px-7 py-3 font-semibold text-sm transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              dark
                ? "border-cyan-300/25 bg-[#07121b]/80 text-cyan-100 shadow-[0_8px_30px_rgba(0,0,0,0.2)] hover:border-cyan-200/50 hover:shadow-[0_10px_38px_rgba(0,212,255,0.12)] focus-visible:ring-cyan-300 focus-visible:ring-offset-[#030712]"
                : "border-[#8b1a1a]/20 bg-[#fffaf2]/80 text-[#6f1919] shadow-[0_8px_28px_rgba(139,26,26,0.08)] hover:border-[#8b1a1a]/45 hover:shadow-[0_10px_32px_rgba(139,26,26,0.14)] focus-visible:ring-[#8b1a1a] focus-visible:ring-offset-[#f5ede0]"
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 items-center justify-center rounded-lg border transition-all duration-300",
                dark
                  ? "border-cyan-200/15 bg-cyan-300/[0.08] text-cyan-200 group-hover:border-cyan-200/30 group-hover:bg-cyan-300/[0.14]"
                  : "border-[#8b1a1a]/10 bg-[#8b1a1a]/[0.05] text-[#8b1a1a] group-hover:border-[#8b1a1a]/20 group-hover:bg-[#8b1a1a]/[0.09]"
              )}
            >
              {showForm ? <FaTimes className="text-xs" /> : <FaPenNib className="text-xs transition-transform duration-300 group-hover:-rotate-12 group-hover:scale-110" />}
            </span>
            <span>{showForm ? (lang === "jp" ? "閉じる" : "Close") : t.leaveTestimonial}</span>
            <span className={cn(
              "ml-1 h-1.5 w-1.5 rounded-full transition-colors duration-300",
              showForm
                ? dark ? "bg-white/35" : "bg-[#8b1a1a]/35"
                : dark ? "bg-cyan-300 shadow-[0_0_10px_rgba(103,232,249,0.7)]" : "bg-[#8b1a1a]/60"
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
                    {lang === "jp" ? "Googleログインを確認しています..." : "Checking your Google sign-in..."}
                  </div>
                ) : !session?.user || !authorName ? (
                  <div className={cn(
                    "rounded-2xl border p-8 text-center space-y-4",
                    dark ? "glass-card border-white/10" : "bg-[#f5ede0]/80 border-[#8b1a1a]/15 shadow-[0_4px_32px_rgba(139,26,26,0.08)]"
                  )}>
                    <div className="space-y-1">
                      <h3 className={cn("text-lg font-bold", dark ? "text-white" : "text-[#2a1008]")}>
                        {lang === "jp" ? "Googleでログイン" : "Sign in to leave a testimonial"}
                      </h3>
                      <p className={cn("text-sm", dark ? "text-white/50" : "text-[#7a4a35]")}>
                        {lang === "jp" ? "名前とプロフィール写真はGoogleアカウントから取得します。" : "Your name and profile photo will come from your Google account."}
                      </p>
                    </div>
                    <motion.button
                      type="button"
                      whileHover={{ scale: 1.03, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => void signIn("google")}
                      className={cn(
                        "inline-flex items-center justify-center gap-3 rounded-xl border px-6 py-3 font-semibold text-sm transition-colors",
                        dark ? "border-white/15 bg-white text-[#202124] hover:bg-white/90" : "border-[#8b1a1a]/15 bg-white text-[#202124] hover:bg-white/90"
                      )}
                    >
                      <FaGoogle className="text-base" />
                      {lang === "jp" ? "Googleで続行" : "Continue with Google"}
                    </motion.button>
                  </div>
                ) : status === "success" ? (
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={cn(
                      "rounded-2xl border p-10 text-center space-y-3",
                      dark ? "glass-card border-white/10" : "bg-[#f5ede0] border-[#8b1a1a]/15"
                    )}
                  >
                    <div className="text-5xl">🙏</div>
                    <h3 className={cn("text-xl font-bold", dark ? "text-white" : "text-[#2a1008]")}>
                      {t.testimonialSuccess}
                    </h3>
                    <p className={cn("text-sm", dark ? "text-white/50" : "text-[#7a4a35]")}>
                      {t.testimonialSuccessDesc}
                    </p>
                    <button
                      onClick={() => { setStatus("idle"); setShowForm(false); }}
                      className={cn("text-sm font-semibold underline underline-offset-4 mt-2", dark ? "text-cyan-300" : "text-[#8b1a1a]")}
                    >
                      {t.testimonialSendAnother}
                    </button>
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
                        { icon: "🔒", text: lang === "jp" ? "ブラウザーに保存" : "Stored in this browser" },
                        { icon: "✨", text: lang === "jp" ? "すぐに表示" : "Appears instantly" },
                        { icon: "🌐", text: lang === "jp" ? "この端末で表示" : "Visible on this device" },
                      ].map(({ icon, text }) => (
                        <span
                          key={text}
                          className={cn(
                            "inline-flex items-center gap-1.5 text-[10px] font-medium px-2.5 py-1 rounded-full border",
                            dark ? "border-white/8 text-white/35 bg-white/3" : "border-[#8b1a1a]/12 text-[#7a4a35]/70 bg-[#8b1a1a]/4"
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
                      <div className="relative w-10 h-10 rounded-full shrink-0 overflow-hidden flex items-center justify-center text-sm font-bold text-white"
                        style={{ background: `linear-gradient(135deg, ${accent} 0%, ${accent}99 100%)` }}>
                        {authorImage ? (
                          <Image
                            src={authorImage}
                            alt={`${authorName}'s Google profile`}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : authorName.split(" ").map((word) => word[0]).join("").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={cn("text-sm font-semibold truncate", dark ? "text-white" : "text-[#2a1008]")}>
                          {authorName}
                        </p>
                        <p className={cn("text-xs", dark ? "text-white/40" : "text-[#7a4a35]/70")}>
                          {lang === "jp" ? "Googleアカウントで確認済み" : "Verified with Google"}
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
                      <label className={cn("text-xs font-semibold tracking-wide uppercase", dark ? "text-white/40" : "text-[#7a4a35]/70")}>
                        {t.testimonialLinkedin}
                      </label>
                      <div className="relative">
                        <FaLinkedin
                          className={cn("absolute left-3.5 top-1/2 -translate-y-1/2 text-sm pointer-events-none", dark ? "text-white/20" : "text-[#7a4a35]/30")}
                        />
                        <input
                          type="url"
                          name="linkedin"
                          value={form.linkedin}
                          onChange={handleChange}
                          placeholder="https://linkedin.com/in/yourprofile"
                          className={cn(inputClass, "pl-9")}
                        />
                      </div>
                    </div>

                    <motion.button
                      type="submit"
                      whileHover={{ scale: 1.02, y: -1 }}
                      whileTap={{ scale: 0.98 }}
                      disabled={!form.role.trim() || !form.message.trim()}
                      className={cn(
                        "relative w-full overflow-hidden px-8 py-4 rounded-xl font-semibold text-sm text-white transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed",
                        dark
                          ? "bg-gradient-to-r from-cyan-500 to-blue-600 shadow-[0_0_30px_rgba(0,212,255,0.2)] hover:shadow-[0_0_50px_rgba(0,212,255,0.4)]"
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

  const isMobile = useMediaQuery("(max-width: 767px)");

  const scrollRef = useRef<HTMLDivElement>(null);
  const pausedUntilRef = useRef<number>(0);
  const heroRef = useRef<HTMLElement>(null);

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
              <Stars radius={100} depth={50} count={isMobile ? 1800 : 4000} factor={4} fade speed={0.5} />
              <InteractiveSphere dark={dark} mobile={isMobile} />
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
          className="relative z-10 text-center px-6 max-w-4xl mx-auto"
        >
          <motion.div
            initial="hidden"
            animate="visible"
            variants={stagger}
            className="flex flex-col items-center gap-5 sm:gap-6"
          >
            {/* Avatar */}
            <motion.div variants={scaleIn} className="relative animate-float">
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
            <motion.div variants={fadeUp}>
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
              className="flex flex-wrap items-center justify-center gap-4 mt-2"
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
              className="flex items-center gap-6 mt-2"
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
          {t.projectsList.map(({ title, tech, desc, github, emoji }, i) => (
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
                <span className="text-4xl">{emoji}</span>
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
              {github && (
                <a
                  href={github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(
                    "mt-auto inline-flex items-center gap-2 text-sm font-semibold transition-colors duration-200 group/link",
                    dark
                      ? "text-cyan-300 hover:text-white"
                      : "text-[#8b1a1a] hover:text-[#2a1008]"
                  )}
                >
                  <FaGithub />
                  <span className="group-hover/link:underline">
                    View on GitHub
                  </span>
                  <span className="opacity-0 group-hover/link:opacity-100 transition-opacity">
                    →
                  </span>
                </a>
              )}
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
          {certCards.map((card, i) => {
            const color = dark ? card.colorDark : card.colorLight;
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
                    card.real
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

                    {card.real ? (
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
                            !card.real && "opacity-45"
                          )}
                        >
                          {card.title}
                        </h4>
                        <p
                          className={cn(
                            "text-xs mt-0.5 line-clamp-1",
                            dark ? "text-white/35" : "text-[#7a4a35]/60",
                            !card.real && "opacity-55"
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

                    {card.real ? (
                      <button
                        onClick={() => openCert(0)}
                        className={cn(
                          "text-xs font-semibold transition-colors duration-200",
                          dark
                            ? "text-cyan-300 hover:text-white"
                            : "text-[#8b1a1a] hover:text-[#2a1008]"
                        )}
                      >
                        View all certificates →
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
            © {new Date().getFullYear()} Pavan Kumar · Crafted with React &amp; Three.js
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