import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";
import { ThemeProvider } from "./theme-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Pavan Kumar | Full-Stack Developer & AI Enthusiast",
  description:
    "Portfolio of Pavan Kumar — B.Tech ISE student at NMAMIT, building web apps, 3D experiences, and AI-powered tools.",
  openGraph: {
    title: "Pavan Kumar | Portfolio",
    description:
      "Full-Stack Developer & AI Enthusiast — React, Next.js, Three.js, Python.",
    url: "https://pavankumar.dev",
    siteName: "Pavan Kumar Portfolio",
    images: [{ url: "/pavan.jpeg", width: 400, height: 400, alt: "Pavan Kumar" }],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Pavan Kumar | Portfolio",
    description: "Full-Stack Developer & AI Enthusiast.",
    images: ["/pavan.jpeg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#030712",
};

// Runs before first paint so the saved theme never flashes.
const themeScript = `try{var t=localStorage.getItem("pavan_theme");document.documentElement.dataset.theme=t==="light"?"light":"dark"}catch(e){document.documentElement.dataset.theme="dark"}`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>
          <Providers>{children}</Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}