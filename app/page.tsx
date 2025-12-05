"use client";

import React, { useState, useEffect, Suspense, useRef } from "react";
import Image from "next/image";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Sphere, MeshDistortMaterial, Stars } from "@react-three/drei";
import { motion, Variants } from "framer-motion";
import { FaGithub, FaLinkedin, FaReact, FaJsSquare } from "react-icons/fa";


// Helper function to conditionally join class names
const cn = (...classes: (string | boolean | undefined | null)[]) =>
  classes.filter(Boolean).join(" ");

function Blob(props: { className?: string; style?: React.CSSProperties }) {
  return (
    <div
      {...props}
      style={{
        position: "fixed",
        zIndex: 1,
        pointerEvents: "none",
        filter: "blur(100px)",
        mixBlendMode: "screen",
        opacity: 0.5,
        ...props.style,
      }}
    />
  );
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      ease: "easeOut",
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0 },
};

const texts = {
  en: {
    home: "Home",
    about: "About",
    projects: "Projects",
    certifications: "Certifications",
    contact: "Contact",
    resume: "Resume",
    name: "Pavan Kumar",
    heroDesc:
      "Hello! I’m a 2nd-year B.Tech student at NMAMIT, exploring web development, AI, and interactive projects.",
    contactMe: "Contact Me",
    myWork: "My Work",
    aboutMeTitle: "About Me",
    aboutMeDesc:
      "I am a 2nd-year B.Tech student in Information Science and Engineering at N.M.A.M Institute of Technology, Nitte. I’m passionate about web development, 3D visuals, and interactive UI design. Skilled in C, Python, HTML, CSS, and React; I enjoy building websites and experimenting with AI-powered tools and creative prompts.",
    education: "Education",
    educationDesc: "B.Tech ISE, N.M.A.M.I.T Institute of Technology Nitte — 2024 to 2028 (ongoing)",
    experience: "Experience",
    experienceList: [
      "Web Intern, ABC Corp (May 2025–July 2025)",
      "Freelance UI/UX & Frontend projects",
    ],
    projectsTitle: "Projects", 
   projectsList: [
  {
    title: "Note saver app",
    tech: "Python, Flask, Jinja2, HTML, CSS, JavaScript",
    desc: "A simple Flask web app using Python for backend and HTML/CSS/JavaScript for the frontend with Jinja2 for dynamic content.",
    github: "https://github.com/pavan55kumar/FLASK-note-saver"
  },
  {
    title: "Spam Detection Project",
    tech: "Python, Tkinter, scikit-learn, Pandas, Joblib, NLTK, SpaCy, Streamlit, Transformers",
    desc: "A Python-based ML app that detects spam messages using NLP.",
    github: "https://github.com/pavan55kumar/E-mail-Spam-Detection"
  },
    {
    title: "Weather App",
    tech: "React, OpenWeather API, Tailwind",
    desc: "A responsive weather app fetching real-time data from OpenWeather API.",
    github: "https://github.com/pavan55kumar/weather-app"
  },
  {
    title: "Todo Manager",
    tech: "React, Redux, TypeScript",
    desc: "A modern todo app with state management using Redux and TypeScript.",
    github: "https://github.com/pavan55kumar/todo-manager"
  },
  {
    title: "Chatbot Assistant",
    tech: "Python, Flask, Transformers, Streamlit",
    desc: "An AI-powered chatbot using HuggingFace Transformers with a simple web interface.",
    github: "https://github.com/pavan55kumar/chatbot-assistant"
  }
  
],

    certificationsTitle: "Certifications",
    certificationsDesc: "A collection of my professional certifications. Click to view.",
    certPlaceholderTitle: "Certification Title",
    certPlaceholderIssuer: "Issued by...",
    emailLabel: "📧 Pavankumar.eng29@gmail.com",
    emailMe: "Email Me",
  },
  jp: {
    home: "ホーム",
    about: "私について",
    projects: "プロジェクト",
    certifications: "認定資格",
    contact: "連絡先",
    resume: "履歴書",
    name: "パヴァン・クマール",
    heroDesc:
      "こんにちは！私はNMAMITの2年生のB.Tech学生で、ウェブ開発、AI、インタラクティブなプロジェクトを探求しています。",
    contactMe: "お問い合わせ",
    myWork: "私の作品",
    aboutMeTitle: "私について",
    aboutMeDesc:
      "私はN.M.A.M工科大学ニッテの情報科学工学の2年生です。ウェブ開発、3Dビジュアル、インタラクティブなUIデザインに情熱を持っています。C、Python、HTML、CSS、Reactに精通し、ウェブサイトを作成し、AIツールを使ったクリエイティブな取り組みを楽しんでいます。",
    education: "学歴",
    educationDesc: "N.M.A.M工科大学ニッテ、B.Tech ISE — 2024年から2028年（進行中）",
    experience: "経験",
    experienceList: [
      "ウェブインターン、ABC社 (2025年5月～7月)",
      "フリーランスのUI/UXとフロントエンドプロジェクト",
    ],
    projectsTitle: "プロジェクト",
projectsList: [
  {
    title: "まだ追加されていません",
    tech: "React、Three.js、Tailwind",
    desc: "インタラクティブな3Dヒーロー...",
    github: "" // placeholder
  },
  {
    title: "まだ追加されていません",
    tech: "React、Express、MongoDB",
    desc: "学生向けのリアルタイムバス...",
    github: "" // placeholder
  }
]
,
    certificationsTitle: "認定資格",
    certificationsDesc: "私の専門的な認定資格のコレクションです。クリックしてご覧ください。",
    certPlaceholderTitle: "認定資格名",
    certPlaceholderIssuer: "発行元...",
    emailLabel: "📧 Pavankumar.eng29@gmail.com",
    emailMe: "メールを送る",
  },
};

export default function Home() {
  const [showNav, setShowNav] = useState(true);
  const [dark, setDark] = useState(true);
  const [lang, setLang] = useState<"en" | "jp">("en");

  const scrollRef = useRef<HTMLDivElement>(null);
const pausedUntilRef = useRef<number>(0);
 // Auto-scroll effect
useEffect(() => {
  const interval = setInterval(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;

    // Respect pause
    if (Date.now() < pausedUntilRef.current) return;

    scroller.scrollBy({ left: 320, behavior: "smooth" });

    // Loop back to start if near the end
    const max = scroller.scrollWidth - scroller.clientWidth;
    if (scroller.scrollLeft >= max - 10) {
      scroller.scrollTo({ left: 0, behavior: "smooth" });
    }
  }, 4000);

  return () => clearInterval(interval);
}, []);

// Pause auto-scroll on user interaction
useEffect(() => {
  const scroller = scrollRef.current;
  if (!scroller) return;

  const pause = () => { pausedUntilRef.current = Date.now() + 5000; }; // pause 5s

  const onScroll = () => pause();
  const onPointerDown = () => pause();
  const onWheel = () => pause();

  scroller.addEventListener("scroll", onScroll, { passive: true });
  scroller.addEventListener("pointerdown", onPointerDown);
  scroller.addEventListener("wheel", onWheel, { passive: true });

  return () => {
    scroller.removeEventListener("scroll", onScroll);
    scroller.removeEventListener("pointerdown", onPointerDown);
    scroller.removeEventListener("wheel", onWheel);
  };
}, []);

useEffect(() => {
  const interval = setInterval(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 320, behavior: "smooth" });
    }
  }, 4000); // auto-scroll every 4 seconds

  return () => clearInterval(interval);
}, []);

 

  useEffect(() => {
    let lastY = 0;
    const handleScroll = () => {
      const currentY = window.scrollY;
      if (currentY < 50) setShowNav(true);
      else if (currentY > lastY) setShowNav(false);
      else setShowNav(true);
      lastY = currentY;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  

 const inputClasses = "p-3 rounded bg-gray-800 dark:bg-gray-700 text-white border border-gray-700 dark:border-gray-600";

// ------------ Certificates modal state & helpers ------------
const certFiles = ["az1.jpeg", "az2.jpeg", "az3.jpeg"]; // your certificate images

const [certOpen, setCertOpen] = useState(false);
const [certIndex, setCertIndex] = useState(0);

const openCert = (index: number) => {
  setCertIndex(index);
  setCertOpen(true);
};

const closeCert = () => setCertOpen(false);

const showPrev = () =>
  setCertIndex((i) => (i - 1 + certFiles.length) % certFiles.length);

const showNext = () =>
  setCertIndex((i) => (i + 1) % certFiles.length);

// Keyboard navigation
useEffect(() => {
  if (!certOpen) return;
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "Escape") closeCert();
    if (e.key === "ArrowLeft") showPrev();
    if (e.key === "ArrowRight") showNext();
  };
  window.addEventListener("keydown", onKey);
  return () => window.removeEventListener("keydown", onKey);
}, [certOpen]);

return (
  <div
    className={cn(
      "min-h-screen relative font-sans overflow-x-hidden transition-colors duration-500",
      dark ? "bg-gray-900 text-white" : "bg-[#f5f5f7] text-gray-900"
    )}
  >

      {/* Dark/Light Mode Toggle */}
      <button
        aria-label="Toggle Dark Mode"
        onClick={() => setDark(!dark)}
        className="fixed bottom-6 right-6 z-50 rounded-full p-3 bg-cyan-600 hover:bg-cyan-700 text-white shadow-lg transition"
      >
        {dark ? "☀️" : "🌙"}
      </button>

      {/* Language Toggle */}
      <button
        aria-label="Toggle Language"
        onClick={() => setLang(lang === "en" ? "jp" : "en")}
        className="fixed bottom-6 right-20 z-50 rounded-full p-3 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg transition"
      >
        {lang === "en" ? "JP" : "EN"}
      </button>

      {/* Background blobs */}
      <Blob className="w-96 h-96 rounded-full bg-blue-700/70" style={{ top: -80, left: -80 }} />
      <Blob className="w-64 h-96 rounded-full bg-cyan-400/50" style={{ bottom: 60, right: 0 }} />

      {/* Navbar */}
      <nav
        className={cn(
          "fixed w-full top-0 z-40 backdrop-blur-xl border-b shadow-lg transition-transform duration-300",
          dark
            ? "bg-gray-900/70 border-white/10"
            : "bg-[#f5f5f7]/70 border-gray-300/40",
          showNav ? "translate-y-0" : "-translate-y-full"
        )}
      >
          <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
          <h2 className="text-2xl font-extrabold animate-gradient bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-600 bg-clip-text text-transparent">
            {texts[lang].name}
          </h2>
  

       {/* Navigation Links */}
    <div className="flex flex-wrap justify-center sm:justify-end gap-3 sm:gap-6 text-sm font-medium">
      <a href="#home" className="hover:text-cyan-400 transition">{texts[lang].home}</a>
      <a href="#about" className="hover:text-cyan-400 transition">{texts[lang].about}</a>
      <a href="#projects" className="hover:text-cyan-400 transition">{texts[lang].projects}</a>
      <a href="#certifications" className="hover:text-cyan-400 transition">{texts[lang].certifications}</a>
      <a href="#contact" className="hover:text-cyan-400 transition">{texts[lang].contact}</a>
      <a href="/resume.pdf" download className="hover:text-yellow-400 transition">{texts[lang].resume}</a>
    </div>
  </div>
</nav>

      {/* Hero Section */}
      <motion.section
        id="home"
        className="h-screen w-full flex flex-col-reverse md:flex-row items-center justify-center gap-12 relative pt-20 md:pt-0 overflow-visible"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.6 }}
        variants={containerVariants}
      >
        <div className="absolute inset-0 -z-20">
          <Canvas>
            <ambientLight intensity={1} />
            <directionalLight position={[3, 3, 3]} />
            <Suspense fallback={null}>
              <Stars radius={85} depth={30} count={3500} factor={4} fade />
              <Sphere args={[1.3, 100, 200]}>
                <MeshDistortMaterial color={dark ? "#3b82f6" : "#2563eb"} distort={0.38} speed={2} />
              </Sphere>
            </Suspense>
            <OrbitControls enableZoom={false} autoRotate />
          </Canvas>
        </div>

        <motion.div className="text-center md:text-left max-w-xl px-6 z-30 flex flex-col items-center md:items-start" variants={containerVariants}>
          <motion.div className="w-32 h-32 mb-6 rounded-full border-4 border-cyan-400 shadow-lg overflow-hidden" variants={itemVariants}>
            <Image src="/pavan.jpg" alt="Pavan Kumar" width={128} height={128} />
          </motion.div>

          <motion.h1
            className="text-3xl sm:text-5xl md:text-6xl font-extrabold animate-gradient bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-600 bg-clip-text text-transparent"
            variants={itemVariants}
          >
            {texts[lang].name}
          </motion.h1>

          <motion.p className="mt-4 text-sm sm:text-lg md:text-xl leading-relaxed max-w-lg" variants={itemVariants}>
            {texts[lang].heroDesc}
          </motion.p>

          <motion.div className="mt-8 flex justify-center md:justify-start gap-6 w-full max-w-md" variants={containerVariants}>
            <motion.a href="#contact" className="flex-1 text-center px-8 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl shadow-lg font-semibold hover:from-cyan-500 hover:to-blue-700 transition hover:scale-105" variants={itemVariants}>
              {texts[lang].contactMe}
            </motion.a>
            <motion.a href="#projects" className="flex-1 text-center px-8 py-3 border border-white rounded-xl hover:bg-white hover:text-black transition font-semibold" variants={itemVariants}>
              {texts[lang].myWork}
            </motion.a>
          </motion.div>

          <motion.div className="mt-8 flex gap-6 justify-center md:justify-start text-3xl text-cyan-400 w-full max-w-md" variants={containerVariants}>
            <motion.a href="https://github.com/pavan55kumar" target="_blank" rel="noopener noreferrer" className="hover:drop-shadow-[0_0_10px_#06b6d4] transition" aria-label="GitHub profile" variants={itemVariants}>
              <FaGithub />
            </motion.a>
            <motion.a href="https://www.linkedin.com/in/pavan-kumar-6864b2320" target="_blank" rel="noopener noreferrer" className="hover:drop-shadow-[0_0_10px_#06b6d4] transition" aria-label="LinkedIn profile" variants={itemVariants}>
              <FaLinkedin />
            </motion.a>
          </motion.div>
        </motion.div>
      </motion.section>

      {/* About Section */}
      <motion.section id="about" className="py-24 max-w-3xl mx-auto px-6 text-center relative z-30" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} variants={containerVariants}>
        <motion.h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent" variants={itemVariants}>
          {texts[lang].aboutMeTitle}
        </motion.h2>

        <motion.p className="text-gray-300 dark:text-gray-400 text-lg mb-12 leading-relaxed" variants={itemVariants}>
          {texts[lang].aboutMeDesc}
        </motion.p>

        <motion.div className="flex flex-wrap justify-center gap-5 mb-16 max-w-xl mx-auto" variants={containerVariants}>
          {[{ label: "React", icon: <FaReact /> }, { label: "Three.js", icon: null }, { label: "Next.js", icon: null }, { label: "Tailwind", icon: null }, { label: "JavaScript", icon: <FaJsSquare /> }, { label: "UI/UX", icon: null }, { label: "GSAP", icon: null }].map(({ label, icon }, i) => (
            <motion.span key={label} className="px-4 py-3 rounded-xl bg-gradient-to-br from-blue-900 to-cyan-700 text-cyan-300 font-semibold border border-blue-500/40 shadow cursor-default select-none" variants={itemVariants} transition={{ delay: i * 0.15 }}>
              {icon && <span className="mr-2">{icon}</span>}
              {label}
            </motion.span>
          ))}
        </motion.div>

        <motion.div className="text-left mx-auto max-w-lg space-y-4" variants={containerVariants}>
          <motion.h3 className="font-semibold mb-2 text-xl bg-gradient-to-r from-yellow-400 to-pink-400 bg-clip-text text-transparent" variants={itemVariants}>
            {texts[lang].education}
          </motion.h3>
          <motion.p className="text-gray-400" variants={itemVariants}>
            {texts[lang].educationDesc}
          </motion.p>

          <motion.h3 className="font-semibold mb-2 text-xl bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent" variants={itemVariants}>
            {texts[lang].experience}
          </motion.h3>
          <motion.ul className="list-disc ml-6 text-gray-400 space-y-2" variants={containerVariants}>
            {texts[lang].experienceList.map((exp, idx) => (
              <motion.li key={idx} variants={itemVariants}>
                {exp}
              </motion.li>
            ))}
          </motion.ul>
        </motion.div>
      </motion.section>

      {/* Projects Section */}
      <motion.section
  id="projects"
  className="py-24 px-0 w-full relative z-30"  // changed
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.4 }}
  variants={containerVariants}
>
<div className="max-w-6xl mx-auto px-6">
  <motion.h2
    className="text-4xl font-bold mb-8 bg-gradient-to-r from-cyan-300 to-blue-600 bg-clip-text text-transparent"
    variants={itemVariants}
  >
    {texts[lang].projectsTitle}
  </motion.h2>

  <div className="relative">
    {/* Arrow buttons go here (optional) */}
 
    {/* Scroll container goes here */}
 <motion.div
  ref={scrollRef}
  className="flex gap-4 sm:gap-6 overflow-x-auto snap-x snap-mandatory scrollbar-hide pb-4 px-2 sm:px-6"
  variants={containerVariants}
>

  {texts[lang].projectsList.map(({ title, tech, desc, github }, i) => (
    <motion.div
      key={i}
      className={cn(
  "snap-start min-w-[280px] sm:min-w-[320px] md:min-w-[380px] lg:min-w-[420px] p-6 sm:p-8 rounded-2xl shadow-xl transition-transform hover:scale-105 hover:-translate-y-2",
  i % 2 === 0
    ? "bg-gradient-to-br from-blue-800 to-blue-900 border border-blue-500/30"
    : "bg-gradient-to-bl from-cyan-800 to-blue-900 border border-cyan-400/30"
)}

      variants={itemVariants}
      transition={{ delay: i * 0.1 }}
    >
     <h4 className="text-lg sm:text-xl font-bold mb-2 text-cyan-300">{title}</h4>
<p className="text-sm sm:text-base text-gray-400 mb-2">{tech}</p>
<p className="text-sm sm:text-base text-gray-300 leading-relaxed">{desc}</p>

      {github && (
        <a
          href={github}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 inline-flex items-center px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold shadow hover:from-blue-700 hover:to-cyan-500 transition"
        >
          <FaGithub className="mr-2" /> View on GitHub
        </a>
      )}
    </motion.div>
  ))}
</motion.div>

  </div>
</div>

       

      </motion.section>

{/* Certifications Section */}
<motion.section
  id="certifications"
  className="py-24 px-6 max-w-5xl mx-auto relative z-30"
  initial="hidden"
  whileInView="visible"
  viewport={{ once: true, amount: 0.3 }}
  variants={containerVariants}
>
  <motion.h2
    className="text-4xl font-bold mb-4 text-center bg-gradient-to-r from-cyan-300 to-blue-600 bg-clip-text text-transparent"
    variants={itemVariants}
  >
    {texts[lang].certificationsTitle}
  </motion.h2>

  <motion.p
    className="text-center text-gray-300 dark:text-gray-400 text-lg mb-12 max-w-2xl mx-auto"
    variants={itemVariants}
  >
    {texts[lang].certificationsDesc}
  </motion.p>

  <motion.div
    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10"
    variants={containerVariants}
  >

    {/* Modern Microsoft Certificate Card */}
    <div className="rounded-2xl overflow-hidden border border-cyan-500/40 bg-gray-800/40 backdrop-blur-xl shadow-[0_0_25px_rgba(0,255,255,0.2)] hover:shadow-[0_0_35px_rgba(0,255,255,0.4)] transition-all duration-300 group cursor-pointer">

        <div className="relative w-full h-56 flex items-center justify-center">

          {/* Glow ring */}
          <div className="absolute inset-0 rounded-2xl bg-cyan-400/10 blur-2xl opacity-0 group-hover:opacity-40 transition duration-300"></div>

          
  {/* Certificate 1 */}
  <div
    onClick={() => openCert(0)}
    className="absolute top-6 left-1/2 -translate-x-1/2 w-44 h-28 rounded-lg overflow-hidden rotate-[-10deg] shadow-xl border border-white/20 cursor-pointer group-hover:scale-105 transition"
  >
    <Image src="/certificates/az1.jpeg" alt="Microsoft Certificate 1" fill className="object-cover" />
  </div>

  {/* Certificate 2 */}
  <div
    onClick={() => openCert(1)}
    className="absolute top-10 left-1/2 -translate-x-1/2 w-44 h-28 rounded-lg overflow-hidden rotate-[4deg] shadow-xl border border-white/20 cursor-pointer group-hover:scale-105 transition delay-100"
  >
    <Image src="/certificates/az2.jpeg" alt="Microsoft Certificate 2" fill className="object-cover" />
  </div>

  {/* Certificate 3 */}
  <div
    onClick={() => openCert(2)}
    className="absolute top-14 left-1/2 -translate-x-1/2 w-44 h-28 rounded-lg overflow-hidden rotate-[12deg] shadow-xl border border-white/20 cursor-pointer group-hover:scale-105 transition delay-200"
  >
    <Image src="/certificates/az3.jpeg" alt="Microsoft Certificate 3" fill className="object-cover" />
  </div>
</div>


        <div className="p-6">
          <h4 className="text-xl font-semibold text-cyan-300">
            Microsoft Certificates
          </h4>
          <p className="text-sm text-gray-400 mt-1">
            Azure Fundamentals · AI Essentials · Cloud Basics
          </p>

          <button
  onClick={() => openCert(0)} // start modal at first certificate
  className="mt-3 inline-block px-4 py-2 rounded-lg bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-400/30 text-cyan-300 text-xs font-semibold shadow hover:bg-cyan-500/30 transition"
>
  View Certificates →
</button>

        </div>
      
    </div>
  </motion.div>
</motion.section>

{certOpen && (
  <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
    <div className="relative max-w-3xl w-full p-6">
      <button
        onClick={closeCert}
        className="absolute top-4 right-4 text-white text-2xl font-bold"
      >
        ✕
      </button>

      <Image
        src={`/certificates/${certFiles[certIndex]}`}
        alt={`Certificate ${certIndex + 1}`}
        width={800}
        height={600}
        className="mx-auto rounded-lg shadow-lg"
      />

      <div className="flex justify-between mt-6">
        <button
          onClick={showPrev}
          className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
        >
          ← Prev
        </button>
        <button
          onClick={showNext}
          className="px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700"
        >
          Next →
        </button>
      </div>
    </div>
  </div>
)}



      {/* Contact Section */}
      <motion.section id="contact" className="py-20 max-w-xl mx-auto text-center px-6 relative z-30" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.4 }} variants={containerVariants}>
        <motion.h2 className="text-4xl font-bold mb-6 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent" variants={itemVariants}>
          {texts[lang].contact}
        </motion.h2>
        <motion.p className="text-gray-300 mb-6" variants={itemVariants}>
          {texts[lang].emailLabel}
        </motion.p>
        <motion.form action="mailto:Pavankumar.eng29@gmail.com" method="POST" encType="text/plain" className="max-w-md mx-auto flex flex-col gap-4" variants={containerVariants}>
          <motion.input type="text" name="Name" placeholder={lang === "jp" ? "お名前" : "Name"} required className={inputClasses} variants={itemVariants} />
          <motion.input type="email" name="Email" placeholder={lang === "jp" ? "メール" : "Email"} required className={inputClasses} variants={itemVariants} />
          <motion.textarea name="Message" rows={5} placeholder={lang === "jp" ? "メッセージ" : "Message"} required className={inputClasses} variants={itemVariants} />
          <motion.button type="submit" className="bg-gradient-to-r from-cyan-500 to-blue-700 hover:from-blue-700 hover:to-cyan-500 w-full sm:w-auto px-4 sm:px-6 py-3 rounded-lg font-semibold text-white shadow-lg transition transform hover:scale-105" variants={itemVariants}>
            {texts[lang].emailMe}
          </motion.button>
        </motion.form>
      </motion.section>

      <style jsx global>{`
        @keyframes gradientMove {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradientMove 3.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}