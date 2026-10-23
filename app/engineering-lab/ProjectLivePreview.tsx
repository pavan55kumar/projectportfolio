"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  FiExternalLink,
  FiRotateCw,
  FiMaximize2,
  FiMinimize2,
  FiMonitor,
  FiTablet,
  FiSmartphone,
  FiLock,
  FiCheck,
  FiCopy,
  FiGlobe,
  FiAlertCircle,
} from "react-icons/fi";
import { FaGithub } from "react-icons/fa";

interface ProjectLivePreviewProps {
  url?: string;
  title: string;
  coverImage?: string;
  githubUrl?: string;
  dark?: boolean;
}

export default function ProjectLivePreview({
  url,
  title,
  coverImage,
  githubUrl,
  dark = true,
}: ProjectLivePreviewProps) {
  const [deviceMode, setDeviceMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [iframeKey, setIframeKey] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showFallbackBanner, setShowFallbackBanner] = useState(false);

  // Normalize URL
  const trimmedUrl = url?.trim();
  const isValidUrl = Boolean(
    trimmedUrl &&
      (trimmedUrl.startsWith("http://") || trimmedUrl.startsWith("https://")) &&
      !trimmedUrl.includes("#demo")
  );

  useEffect(() => {
    setIsLoading(true);
    setShowFallbackBanner(false);

    if (isValidUrl) {
      // If the iframe takes more than 7 seconds, show helpful notice about potential X-Frame-Options
      const timer = setTimeout(() => {
        setShowFallbackBanner(true);
      }, 7000);
      return () => clearTimeout(timer);
    }
  }, [trimmedUrl, iframeKey, isValidUrl]);

  const handleRefresh = () => {
    setIsLoading(true);
    setIframeKey((prev) => prev + 1);
  };

  const handleCopy = () => {
    if (!trimmedUrl) return;
    navigator.clipboard.writeText(trimmedUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Device width constraints for the iframe container
  const getDeviceWidthClass = () => {
    if (deviceMode === "mobile") return "max-w-[400px]";
    if (deviceMode === "tablet") return "max-w-[768px]";
    return "w-full";
  };

  const displayUrl = isValidUrl
    ? trimmedUrl!.replace(/^https?:\/\//, "")
    : `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.app (preview pending)`;

  return (
    <div className="w-full">
      {/* ── Outer Browser Window Frame ── */}
      <div
        className={`relative overflow-hidden rounded-2xl sm:rounded-3xl border transition-all duration-300 ${
          dark
            ? "border-white/10 bg-[#070e1b] shadow-[0_20px_50px_rgba(0,0,0,0.6)]"
            : "border-[#8b1a1a]/15 bg-[#fffaf2] shadow-xl"
        }`}
      >
        {/* ── Browser Chrome Header Bar ── */}
        <div
          className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6 sm:py-3.5 border-b select-none ${
            dark
              ? "border-white/10 bg-[#050b16]"
              : "border-[#8b1a1a]/10 bg-[#faeedd]"
          }`}
        >
          {/* Left: Window Dots & Navigation Controls */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="h-3 w-3 rounded-full bg-rose-500/80 shadow-xs inline-block" />
              <span className="h-3 w-3 rounded-full bg-amber-500/80 shadow-xs inline-block" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80 shadow-xs inline-block" />
            </div>

            {isValidUrl && (
              <button
                type="button"
                onClick={handleRefresh}
                title="Refresh preview"
                className={`ml-2 p-1.5 rounded-lg text-xs transition-colors ${
                  dark
                    ? "text-white/60 hover:text-white hover:bg-white/10"
                    : "text-[#7a4a35] hover:text-[#2a1008] hover:bg-[#8b1a1a]/10"
                }`}
              >
                <FiRotateCw className={isLoading ? "animate-spin" : ""} />
              </button>
            )}
          </div>

          {/* Center: Clean URL Address Bar */}
          <div className="order-last sm:order-none w-full sm:w-auto sm:flex-1 max-w-lg mx-auto">
            <div
              className={`flex items-center justify-between gap-2 px-3 py-1.5 rounded-xl border text-xs transition-all ${
                dark
                  ? "bg-[#030712]/70 border-white/10 text-white/70"
                  : "bg-white border-[#8b1a1a]/15 text-[#2a1008]/80 shadow-xs"
              }`}
            >
              <div className="flex items-center gap-2 min-w-0">
                <FiLock
                  className={`text-[11px] shrink-0 ${
                    isValidUrl ? (dark ? "text-cyan-400" : "text-emerald-600") : "text-slate-400"
                  }`}
                />
                <span className="truncate font-mono text-[11px] select-all">
                  {displayUrl}
                </span>
              </div>

              {isValidUrl && (
                <button
                  type="button"
                  onClick={handleCopy}
                  title="Copy URL"
                  className="p-1 rounded text-[11px] opacity-70 hover:opacity-100 transition-opacity shrink-0"
                >
                  {copied ? <FiCheck className="text-emerald-400" /> : <FiCopy />}
                </button>
              )}
            </div>
          </div>

          {/* Right: Viewport Mode Switcher & Actions */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {isValidUrl && (
              <>
                {/* Desktop / Tablet / Mobile Switcher (visible on md+) */}
                <div
                  className={`hidden md:flex items-center rounded-xl p-0.5 border ${
                    dark
                      ? "border-white/10 bg-[#030712]/50 text-white/60"
                      : "border-[#8b1a1a]/15 bg-white text-[#7a4a35]"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setDeviceMode("desktop")}
                    title="Desktop view"
                    className={`p-1.5 rounded-lg text-xs transition-all ${
                      deviceMode === "desktop"
                        ? dark
                          ? "bg-white/15 text-white"
                          : "bg-[#8b1a1a]/10 text-[#8b1a1a] font-bold"
                        : "hover:text-white"
                    }`}
                  >
                    <FiMonitor />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeviceMode("tablet")}
                    title="Tablet view"
                    className={`p-1.5 rounded-lg text-xs transition-all ${
                      deviceMode === "tablet"
                        ? dark
                          ? "bg-white/15 text-white"
                          : "bg-[#8b1a1a]/10 text-[#8b1a1a] font-bold"
                        : "hover:text-white"
                    }`}
                  >
                    <FiTablet />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeviceMode("mobile")}
                    title="Mobile view"
                    className={`p-1.5 rounded-lg text-xs transition-all ${
                      deviceMode === "mobile"
                        ? dark
                          ? "bg-white/15 text-white"
                          : "bg-[#8b1a1a]/10 text-[#8b1a1a] font-bold"
                        : "hover:text-white"
                    }`}
                  >
                    <FiSmartphone />
                  </button>
                </div>

                {/* Expand / Minimize Height */}
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  title={isExpanded ? "Collapse height" : "Expand preview"}
                  className={`hidden sm:inline-flex p-2 rounded-xl border text-xs transition-colors ${
                    dark
                      ? "border-white/10 text-white/70 hover:bg-white/10 hover:text-white"
                      : "border-[#8b1a1a]/15 text-[#7a4a35] hover:bg-[#faeedd] hover:text-[#2a1008]"
                  }`}
                >
                  {isExpanded ? <FiMinimize2 /> : <FiMaximize2 />}
                </button>

                {/* Open in New Tab Button */}
                <a
                  href={trimmedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                    dark
                      ? "bg-cyan-500/15 border border-cyan-400/30 text-cyan-300 hover:bg-cyan-500/25 shadow-xs"
                      : "bg-[#8b1a1a] text-white hover:bg-[#721515] shadow-xs"
                  }`}
                >
                  <span>Open Live</span>
                  <FiExternalLink className="text-[11px]" />
                </a>
              </>
            )}
          </div>
        </div>

        {/* ── Main Preview Viewport Area ── */}
        <div
          className={`relative w-full flex items-center justify-center transition-all duration-300 ${
            dark ? "bg-[#020610]" : "bg-[#f5ede0]"
          } ${
            isExpanded
              ? "h-[700px] sm:h-[820px]"
              : "h-[440px] sm:h-[560px]"
          }`}
        >
          {isValidUrl ? (
            /* ── Valid Live URL: Interactive Iframe ── */
            <div
              className={`relative h-full transition-all duration-300 mx-auto overflow-hidden shadow-2xl ${getDeviceWidthClass()}`}
            >
              {isLoading && (
                <div
                  className={`absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 backdrop-blur-xs ${
                    dark ? "bg-[#030712]/90 text-white" : "bg-[#fffaf2]/90 text-[#2a1008]"
                  }`}
                >
                  <div
                    className={`h-8 w-8 animate-spin rounded-full border-2 border-t-transparent ${
                      dark ? "border-cyan-400" : "border-[#8b1a1a]"
                    }`}
                  />
                  <p className="text-xs font-medium tracking-wide opacity-80">
                    Connecting to live website...
                  </p>
                </div>
              )}

              <iframe
                key={iframeKey}
                src={trimmedUrl}
                title={`${title} Live Website Preview`}
                onLoad={() => setIsLoading(false)}
                className="w-full h-full border-0 bg-white"
                sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-downloads allow-modals"
                loading="lazy"
              />
            </div>
          ) : (
            /* ── No Live URL Configured Yet: Tasteful Coming Soon State ── */
            <div className="relative w-full h-full overflow-hidden flex items-center justify-center p-6 text-center">
              {coverImage && (
                <div className="absolute inset-0 -z-0 opacity-25 filter blur-sm scale-105 pointer-events-none">
                  <Image
                    src={coverImage}
                    alt={title}
                    fill
                    className="object-cover"
                    unoptimized={typeof coverImage === "string" && coverImage.startsWith("data:")}
                  />
                  <div
                    className={`absolute inset-0 ${
                      dark
                        ? "bg-gradient-to-b from-[#030712]/80 via-[#030712]/90 to-[#030712]"
                        : "bg-gradient-to-b from-[#f5ede0]/80 via-[#f5ede0]/90 to-[#f5ede0]"
                    }`}
                  />
                </div>
              )}

              <div
                className={`relative z-10 max-w-md p-6 sm:p-8 rounded-2xl border backdrop-blur-md shadow-xl ${
                  dark
                    ? "bg-[#040e1c]/85 border-white/10 text-white"
                    : "bg-[#fffaf2]/90 border-[#8b1a1a]/15 text-[#2a1008]"
                }`}
              >
                <div
                  className={`mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border shadow-inner ${
                    dark
                      ? "border-cyan-500/30 bg-cyan-950/40 text-cyan-300"
                      : "border-[#8b1a1a]/20 bg-[#faeedd] text-[#8b1a1a]"
                  }`}
                >
                  <FiGlobe className="text-xl" />
                </div>

                <h3 className="text-base sm:text-lg font-bold tracking-tight mb-2">
                  Live Deployment Preview
                </h3>
                <p
                  className={`text-xs sm:text-sm leading-relaxed mb-6 ${
                    dark ? "text-white/60" : "text-[#7a4a35]"
                  }`}
                >
                  The interactive live deployment for this project is being linked. You can configure and update its live URL anytime in the Admin dashboard.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-3">
                  {githubUrl && (
                    <a
                      href={githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                        dark
                          ? "bg-white/10 border-white/15 text-white hover:bg-white/20"
                          : "bg-white border-[#8b1a1a]/20 text-[#2a1008] hover:bg-[#faeedd]"
                      }`}
                    >
                      <FaGithub className="text-sm" />
                      <span>Explore Repository</span>
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ── Optional Bottom Helper Notification (if site restricts iframes) ── */}
        {isValidUrl && (
          <div
            className={`flex flex-col sm:flex-row items-center justify-between gap-2 px-4 py-2.5 sm:px-6 text-[11px] border-t ${
              dark
                ? "border-white/10 bg-[#040914] text-white/50"
                : "border-[#8b1a1a]/10 bg-[#faeedd]/60 text-[#7a4a35]"
            }`}
          >
            <div className="flex items-center gap-1.5 text-center sm:text-left">
              <FiAlertCircle className="shrink-0 text-cyan-400" />
              <span>
                If the external host restricts embedding in your browser, open it directly.
              </span>
            </div>
            <a
              href={trimmedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={`font-semibold underline transition-colors shrink-0 ${
                dark ? "text-cyan-300 hover:text-cyan-200" : "text-[#8b1a1a] hover:text-[#721515]"
              }`}
            >
              Open website in full tab ↗
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
