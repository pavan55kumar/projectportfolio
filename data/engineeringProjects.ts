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
  coverImage?: string;
  bannerImage?: string;
  screenshots?: ProjectScreenshot[];
  technologies?: string[];
  overview?: string;
  intendedFor?: string;
  role?: string;
  contributions?: string[];
  features?: string[];
  duration?: string;
  team?: ProjectTeamMember[];
  githubUrl?: string;
  liveDemoUrl?: string;
  demoVideoUrl?: string;
  relatedProjectIds?: string[];
  icon: "portfolio" | "atlas" | "relief";
};

export const engineeringProjects: EngineeringProject[] = [
  {
    id: "sankat-saathi",
    slug: "sankat-saathi",
    title: "Sankat Saathi",
    description: "AI-Powered Flood Relief & Humanitarian Supply Allocation Platform built for the IBM Z Datathon 2026.",
    icon: "relief",
    status: "IBM Z Datathon 2026 Finalist Project",
    coverImage: "/projects/sankat-saathi/banner.jpg",
    bannerImage: "/projects/sankat-saathi/cover.png",
    overview:
      "Sankat Saathi (संकट साथी) is an AI-powered disaster management and humanitarian logistics platform engineered for flood-prone regions. Backed by IBM Z and Supabase, it automates citizen SOS requests, detects duplicates, scores urgency using explainable AI models, calculates Haversine geospatial proximity to relief centers, and dynamically coordinates warehouse inventories to dispatch life-saving supplies.",
    intendedFor:
      "Disaster response teams, state relief commissioners, field NGOs, and flood-affected citizens.",
    role: "Full-Stack & Systems Architecture, React + Tailwind Frontend, AI Recommendation Engine, Supabase Schema & Workflows.",
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
    liveDemoUrl: "/engineering-lab/sankat-saathi#demo",
    relatedProjectIds: ["atlas", "portfolio-3d"],
  },
  {
    id: "atlas",
    slug: "atlas",
    title: "Atlas",
    description: "Personal Life Operating System & Intelligent Student Workspace.",
    icon: "atlas",
    status: "Active Production PWA",
    coverImage: "/projects/atlas/cover.png",
    bannerImage: "/projects/atlas/banner.png",
    overview:
      "Atlas is an all-in-one personal life operating system and cognitive student workspace. Unifying academic management, daily habits, deep work, and financial control with an AI assistant, attendance bunk calculator, CGPA grade planner, time-blocking calendar, and cashflow ledger, Atlas helps students and builders plan less and achieve more.",
    intendedFor:
      "University students, engineers, and ambitious knowledge workers.",
    role: "Creator & Lead Developer",
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
    liveDemoUrl: "/engineering-lab/atlas#demo",
    relatedProjectIds: ["sankat-saathi", "portfolio-3d"],
  },
  {
    id: "portfolio-3d",
    slug: "portfolio-3d",
    title: "Project Orbital",
    description: "Modern Weather Dashboard with Real-time Data, Interactive Maps and Beautiful Visualizations.",
    icon: "portfolio",
    status: "Live on Vercel",
    coverImage: "/projects/portfolio-3d/cover.png",
    overview:
      "Project Orbital is a modern weather dashboard and geospatial visualization platform delivering real-time atmospheric data, interactive maps, forecast telemetry, and beautiful dynamic UI transitions backed by Open-Meteo APIs.",
    intendedFor: "Developers, meteorology enthusiasts, and visitors exploring modern data dashboards.",
    role: "Full-Stack Engineer & UI Architect",
    technologies: [
      "React 18",
      "Tailwind CSS",
      "Open-Meteo API",
      "Express.js",
      "Node.js",
      "Vercel",
      "PWA",
    ],
    features: [
      "Live weather telemetry and multi-day micro-forecasts via Open-Meteo API",
      "Interactive 3D weather radar & geospatial map layers",
      "Dynamic weather condition themes with day and night responsiveness",
      "Progressive Web App support with offline caching and instantaneous load times",
    ],
    team: [
      {
        name: "Pavan Kumar",
        role: "Lead Frontend & Systems Developer",
        contribution: "Interactive dashboard UI, real-time API integrations, and PWA configuration.",
        github: "https://github.com/pavan55kumar",
        linkedin: "https://www.linkedin.com/in/pavan-kumar-6864b2320",
        photo: "/pavan.jpeg",
      },
    ],
    liveDemoUrl: "https://github.com/pavan55kumar/projectportfolio",
    relatedProjectIds: ["sankat-saathi", "atlas"],
  },
];

export function getEngineeringProject(slug: string) {
  return engineeringProjects.find(
    (project) =>
      project.slug === slug ||
      (slug === "project-orbital" && project.slug === "portfolio-3d")
  );
}
