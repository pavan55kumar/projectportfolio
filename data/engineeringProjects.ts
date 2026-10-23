export type ProjectScreenshot = {
  src: string;
  alt: string;
  caption?: string;
};

export type ProjectTeamMember = {
  name: string;
  role: string;
  contribution: string;
  photo?: string;
  linkedin?: string;
  github?: string;
};

export type EngineeringProject = {
  id: string;
  slug: string;
  title: string;
  description: string;
  status?: string;
  category?: string;
  coverImage?: string;
  bannerImage?: string;
  screenshots?: ProjectScreenshot[];
  technologies?: string[];
  overview?: string;
  problem?: string;
  solution?: string;
  intendedFor?: string;
  role?: string;
  contributions?: string[];
  features?: string[];
  duration?: string;
  team?: ProjectTeamMember[];
  githubUrl?: string;
  liveUrl?: string;
  liveDemoUrl?: string;
  demoVideoUrl?: string;
  architecture?: string;
  challenges?: string;
  additionalDetails?: string;
  relatedProjectIds?: string[];
  icon?: string;
};

export const engineeringProjects: EngineeringProject[] = [
  {
    id: "sankat-saathi",
    slug: "sankat-saathi",
    title: "Sankat Saathi",
    description: "AI-Powered Flood Relief & Humanitarian Supply Allocation Platform built for the IBM Z Datathon 2026.",
    icon: "relief",
    status: "IBM Z Datathon Project",
    category: "AI & Disaster Logistics",
    coverImage: "/projects/sankat-saathi/banner.jpg",
    bannerImage: "/projects/sankat-saathi/cover.png",
    overview:
      "Sankat Saathi (संकट साथी) is an AI-powered disaster management and humanitarian logistics platform engineered for flood-prone regions. Backed by IBM Z and Supabase, it automates citizen SOS requests, detects duplicates, scores urgency using explainable AI models, calculates Haversine geospatial proximity to relief centers, and dynamically coordinates warehouse inventories to dispatch life-saving supplies.",
    problem:
      "During catastrophic flood events, emergency helplines are overwhelmed with duplicate SOS calls, supply dispatches are delayed by guesswork, and relief depots struggle to prioritize life-threatening incidents without transparent triage scoring.",
    solution:
      "An end-to-end humanitarian platform combining automated GPS geocoding, explainable AI urgency scoring (+55 severity, logarithmic population scaling), and Haversine distance calculations to pair high-priority distress calls with the nearest stocked relief depot in real time.",
    intendedFor:
      "Disaster response teams, state relief commissioners, field NGOs, and flood-affected citizens.",
    role: "Lead Full-Stack & Systems Architecture, React + Tailwind Frontend, AI Recommendation Engine, Supabase Schema & Workflows.",
    duration: "October 2026 · IBM Z Datathon",
    technologies: [
      "React 18",
      "Vite",
      "Tailwind CSS",
      "Supabase (PostgreSQL & RLS)",
      "IBM Z / LinuxONE",
      "FastAPI",
      "Haversine Geospatial Algorithm",
      "Explainable AI Ranking",
      "Lucide Icons",
    ],
    features: [
      "Citizen Emergency SOS Portal with automated GPS geocoding and special needs categorization (Water, Food, Medical, Rescue).",
      "Explainable AI Urgency Scoring weighing incident severity (+55), logarithmic population impact, and wait times.",
      "Haversine Geospatial Allocation mapping requests to the closest relief depots in Mysuru.",
      "Multi-stage dispatch pipeline: Approved → Preparing → In transit → Delivered.",
      "Shelter & Relief Camp Directory with real-time capacity and occupancy metrics.",
      "Enterprise PostgreSQL RLS security isolating citizen, NGO, and command operational views.",
    ],
    contributions: [
      "Designed and developed the complete frontend command center and citizen portal in React & Tailwind CSS.",
      "Implemented the explainable AI scoring algorithm and priority categorization engine.",
      "Engineered Haversine distance calculations for transit optimization between relief camps and victims.",
      "Created modular Supabase database schemas and stored procedures for request-to-delivery lifecycle.",
    ],
    architecture:
      "Built on a high-throughput microservices architecture. Citizen SOS requests arrive through the client-side React portal and are validated via an edge proxy. Ingested payloads trigger asynchronous triage workers running on IBM Z LinuxONE. The scoring engine evaluates population density, medical severity, and wait time penalties, computing real-time geospatial distance matrix against active depot inventory records. Row-Level Security in Supabase ensures strict isolation between public SOS submission endpoints and operational dispatch registries.",
    challenges:
      "Mitigating duplicate SOS spam during peak influx while guaranteeing sub-second geospatial routing across distributed relief camps. Solved by implementing spatial hashing (clustering coordinates within a 150m radius) and logarithmic wait-time decay in the scoring algorithm to prevent starvation of older requests.",
    team: [
      {
        name: "Pavan Kumar",
        role: "Lead Full-Stack & Algorithm Engineer",
        contribution: "Frontend architecture, recommendation algorithms, and Supabase integration.",
        github: "https://github.com/pavan55kumar",
        linkedin: "https://www.linkedin.com/in/pavan-kumar-6864b2320",
        photo: "/pavan.jpeg",
      },
    ],
    githubUrl: "https://github.com/pavankumareng29/Sankat-Saathi-IBM-Z-Datathon-2026-Project",
    liveUrl: "", // Ready for live deployment URL
    liveDemoUrl: "",
    relatedProjectIds: ["atlas", "portfolio-3d"],
  },
  {
    id: "atlas",
    slug: "atlas",
    title: "Atlas Life OS",
    description: "Personal Life Operating System & Intelligent Student Workspace.",
    icon: "atlas",
    status: "Active Production PWA",
    category: "Productivity & Systems",
    coverImage: "/projects/atlas/cover.png",
    bannerImage: "/projects/atlas/banner.png",
    overview:
      "Atlas is an all-in-one personal life operating system and cognitive student workspace. Unifying academic management, daily habits, deep work, and financial control with an AI assistant, attendance bunk calculator, CGPA grade planner, time-blocking calendar, and cashflow ledger, Atlas helps students and builders plan less and achieve more.",
    problem:
      "Students juggle disjointed apps for attendance, timetables, grade calculation, habit tracking, and personal finance, leading to cognitive fatigue, missed attendance minimums, and fragmented daily productivity.",
    solution:
      "A unified, single-pane-of-glass PWA with an intelligent attendance bunk margin simulator ('Safe to miss 2 classes' or 'Must attend 3 to keep 75%'), weighted university CGPA predictor, and Pomodoro deep-work engine.",
    intendedFor:
      "University students, engineers, and ambitious knowledge workers.",
    role: "Solo Creator & Architect — Full-Stack Engineering, Algorithmic Logic, and UI/UX Design.",
    duration: "July 2026 – Present",
    technologies: [
      "React 18",
      "Vite",
      "Tailwind CSS",
      "Framer Motion",
      "Supabase",
      "PWA / Service Workers",
      "Web Speech API (Voice AI)",
      "Lucide Icons",
    ],
    features: [
      "College Attendance Tracker with Bunk Margin Simulator ('Safe to miss 2 classes' or 'Must attend 3 to keep 75%').",
      "Academic CGPA / SGPA Forecaster with university grade-weighting and target prediction.",
      "Pomodoro Deep-Work Focus Engine with ambient sound generator and interval tracking.",
      "Daily Habit Streaks & Eisenhower Priority Task Board with multi-week consistency graphs.",
      "AI Assistant with voice-enabled chat, smart daily morning briefings, and automated study scheduler.",
      "Student Cashflow & Expense Ledger with category-level burn rate analytics.",
    ],
    contributions: [
      "Designed and built the full application from ground up using React, Vite, Tailwind CSS, and Framer Motion.",
      "Engineered academic algorithms for university attendance percentages, bunk thresholds, and CGPA projections.",
      "Implemented Progressive Web App (PWA) capabilities with offline persistence and app shell.",
      "Integrated Supabase backend for real-time cloud data sync and user authentication.",
    ],
    architecture:
      "Engineered as an offline-first Progressive Web App. Client state is managed reactively with indexed storage fallbacks, syncing bi-directionally to Supabase PostgreSQL when network connectivity is established. Mathematical modules compute attendance bunk thresholds deterministically without server round-trips for instant responsiveness.",
    challenges:
      "Accurately projecting multi-semester CGPA across variable credit weights while ensuring instantaneous offline responsiveness on mobile devices with zero lag. Addressed via local IndexedDB caching, Web Workers for heavy recalculations, and optimistic UI updates.",
    team: [
      {
        name: "Pavan Kumar",
        role: "Solo Creator & Architect",
        contribution: "UI/UX design, frontend engineering, academic logic, and backend architecture.",
        github: "https://github.com/pavan55kumar",
        linkedin: "https://www.linkedin.com/in/pavan-kumar-6864b2320",
        photo: "/pavan.jpeg",
      },
    ],
    githubUrl: "https://github.com/pavan55kumar/atlas",
    liveUrl: "", // Ready for live deployment URL
    liveDemoUrl: "",
    relatedProjectIds: ["sankat-saathi", "portfolio-3d"],
  },
  {
    id: "portfolio-3d",
    slug: "portfolio-3d",
    title: "Project Orbital (3D Portfolio)",
    description: "Modern personal portfolio with interactive 3D WebGL hero sphere, LinkedIn OAuth testimonials, and dedicated Engineering Lab deep-dives.",
    icon: "portfolio",
    status: "Live on Vercel",
    category: "3D Graphics & WebGL",
    coverImage: "/projects/portfolio-3d/cover.png",
    overview:
      "A modern, high-performance personal portfolio engineered with Next.js, Three.js, React Three Fiber, and Framer Motion. Features an interactive 3D particle sphere responding to cursor and gyroscope motion, secure OAuth testimonials with LinkedIn/Google, and an integrated Engineering Lab.",
    problem:
      "Traditional portfolio sites are static, forgettable resumes that fail to demonstrate real frontend engineering capability, 3D graphics performance, and interactive system design.",
    solution:
      "An immersive, responsive 3D WebGL web experience achieving 60fps across mobile and desktop, coupled with secure NextAuth authentication, Supabase real-time database integration, and an admin management suite.",
    intendedFor: "Developers, recruiters, engineering managers, and tech collaborators.",
    role: "Creator, Frontend Architect, and 3D Visual Designer.",
    technologies: [
      "Next.js",
      "React 19",
      "Three.js",
      "React Three Fiber",
      "Drei",
      "Tailwind CSS",
      "Supabase",
      "NextAuth.js",
      "Framer Motion",
    ],
    features: [
      "Interactive 3D particle sphere with reactive mouse & gyroscope orientation controls.",
      "Dual theme engine supporting sleek dark mode and warm editorial day mode with zero flash.",
      "Authenticated social testimonials system using NextAuth with Google and LinkedIn OAuth.",
      "Comprehensive Admin Control Suite for live content, skills, education, and project telemetry management.",
      "Dedicated Engineering Lab architecture deep-dives and live deployment preview engine.",
    ],
    architecture:
      "Built on Next.js App Router with server-side rendering for critical SEO tags and client-side WebGL canvas mounts. A unified theme provider coordinates global CSS custom properties across 3D shaders, DOM elements, and admin overlays. API routes interface with Supabase PostgreSQL using service role tokens with local JSON fallbacks for resilience.",
    challenges:
      "Balancing rich WebGL vertex distortion and starfield parallax animations with mobile battery life and fast First Contentful Paint. Optimized through dynamic geometry LOD scaling and pointer-event throttles.",
    team: [
      {
        name: "Pavan Kumar",
        role: "Lead Frontend & Systems Developer",
        contribution: "Interactive 3D UI, real-time database architecture, and authentication flows.",
        github: "https://github.com/pavan55kumar",
        linkedin: "https://www.linkedin.com/in/pavan-kumar-6864b2320",
        photo: "/pavan.jpeg",
      },
    ],
    githubUrl: "https://github.com/pavan55kumar/projectportfolio",
    liveUrl: "https://projectportfolio-one.vercel.app",
    liveDemoUrl: "https://projectportfolio-one.vercel.app",
    relatedProjectIds: ["sankat-saathi", "atlas"],
  },
  {
    id: "spam-detection",
    slug: "spam-detection",
    title: "Spam Detection",
    description: "Python ML application that detects spam and phishing messages using NLP pipelines and HuggingFace Transformers.",
    icon: "portfolio",
    status: "Open Source ML",
    category: "Machine Learning & NLP",
    coverImage: "/projects/portfolio-3d/cover.png",
    overview:
      "An intelligent email and SMS spam detection platform using natural language processing pipelines, tokenization, and transformer models to accurately categorize text as legitimate or spam.",
    problem:
      "Users face constant phishing and spam incursions with subtle adversarial text manipulations that bypass simple keyword filters.",
    solution:
      "A trained NLP classifier utilizing scikit-learn and SpaCy tokenization pipelines with high precision and recall on real-world benchmark datasets.",
    technologies: ["Python", "scikit-learn", "NLTK", "SpaCy", "Streamlit", "Transformers"],
    features: [
      "Real-time message tokenization and stop-word filtering.",
      "Probabilistic spam confidence scoring with threshold adjustments.",
      "Interactive Streamlit web interface for testing custom message payloads.",
    ],
    githubUrl: "https://github.com/pavan55kumar/E-mail-Spam-Detection",
    liveUrl: "",
  },
  {
    id: "note-saver",
    slug: "note-saver",
    title: "Note Saver App",
    description: "A clean Flask web application with Python backend and dynamic HTML/CSS/JS frontend using Jinja2 templates.",
    icon: "portfolio",
    status: "Open Source Utility",
    category: "Web Applications",
    coverImage: "/projects/portfolio-3d/cover.png",
    overview:
      "A lightweight, distraction-free note management web application built with Python Flask and Jinja2 templating, allowing users to organize thoughts and technical snippets with ease.",
    problem:
      "Heavyweight note applications suffer from slow startup times and overwhelming feature bloat for everyday quick capture.",
    solution:
      "A fast, responsive micro-application focused on instant capture, categorization, and persistent storage with minimal resource overhead.",
    technologies: ["Python", "Flask", "Jinja2", "HTML5", "CSS3", "JavaScript"],
    features: [
      "Instant note creation with markdown formatting support.",
      "Categorization tags and instant text search.",
      "Minimalist, distraction-free interface.",
    ],
    githubUrl: "https://github.com/pavan55kumar/FLASK-note-saver",
    liveUrl: "",
  },
];

export function getEngineeringProject(slug: string): EngineeringProject | undefined {
  const normalized = slug?.toLowerCase().trim();

  if (typeof window === "undefined") {
    try {
      // Dynamic require so browser bundles never fail
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require("fs");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const path = require("path");
      const filePath = path.join(process.cwd(), "data", "engineeringProjects.json");
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, "utf-8");
        const list: EngineeringProject[] = JSON.parse(raw);
        if (Array.isArray(list) && list.length > 0) {
          const match = list.find(
            (project) =>
              project.slug.toLowerCase() === normalized ||
              project.id.toLowerCase() === normalized ||
              (normalized === "project-orbital" && project.slug === "portfolio-3d")
          );
          if (match) return match;
        }
      }
    } catch {
      // Fallback to static list
    }
  }

  const found = engineeringProjects.find(
    (project) =>
      project.slug.toLowerCase() === normalized ||
      project.id.toLowerCase() === normalized ||
      (normalized === "project-orbital" && project.slug === "portfolio-3d")
  );
  return found;
}

