import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
