"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCheck,
  FaCheckCircle,
  FaCompass,
  FaFire,
  FaGraduationCap,
  FaPause,
  FaPlay,
  FaRedo,
  FaRobot,
  FaStopwatch,
  FaTasks,
} from "react-icons/fa";

export default function AtlasLiveDemo() {
  const [activeTab, setActiveTab] = useState<"attendance" | "focus" | "habits" | "aibrief">("attendance");

  // Attendance Simulator state
  const [totalClasses, setTotalClasses] = useState(48);
  const [attendedClasses, setAttendedClasses] = useState(41);
  const [targetPct, setTargetPct] = useState(75);

  const currentPct = totalClasses > 0 ? (attendedClasses / totalClasses) * 100 : 0;
  const targetFraction = targetPct / 100;

  let bunkVerdict = "";
  let isSafe = false;

  if (currentPct >= targetPct) {
    isSafe = true;
    const safeBunks = Math.floor((attendedClasses - targetFraction * totalClasses) / targetFraction);
    bunkVerdict = safeBunks > 0
      ? `You can safely miss ${safeBunks} more ${safeBunks === 1 ? "class" : "classes"} while keeping above ${targetPct}%.`
      : `You are exactly on track at ${currentPct.toFixed(1)}%. Do not skip the next class.`;
  } else {
    isSafe = false;
    const needed = Math.ceil((targetFraction * totalClasses - attendedClasses) / (1 - targetFraction));
    bunkVerdict = `Attendance is ${currentPct.toFixed(1)}%. You must attend the next ${needed} consecutive ${needed === 1 ? "class" : "classes"} to hit ${targetPct}%.`;
  }

  // Focus Timer state
  const [timerSeconds, setTimerSeconds] = useState(25 * 60);
  const [timerRunning, setTimerRunning] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(2);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timerRunning && timerSeconds > 0) {
      interval = setInterval(() => setTimerSeconds((prev) => prev - 1), 1000);
    } else if (timerSeconds === 0) {
      setTimerRunning(false);
      setCompletedSessions((c) => c + 1);
    }
    return () => clearInterval(interval);
  }, [timerRunning, timerSeconds]);

  const formatTimer = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  // Habits state
  const [habits, setHabits] = useState([
    { id: 1, name: "Solve 2 LeetCode / DSA Problems", streak: 14, done: true },
    { id: 2, name: "Review Distributed Systems Notes", streak: 8, done: true },
    { id: 3, name: "Evening Gym & High-Protein Meal", streak: 21, done: false },
    { id: 4, name: "Read 20 pages (System Design / OS)", streak: 5, done: false },
  ]);

  const toggleHabit = (id: number) => {
    setHabits((prev) =>
      prev.map((h) =>
        h.id === id
          ? { ...h, done: !h.done, streak: !h.done ? h.streak + 1 : h.streak - 1 }
          : h
      )
    );
  };

  return (
    <div id="demo" className="scroll-mt-24 rounded-3xl border border-lab-fg/10 bg-lab-surface p-5 sm:p-8 text-lab-fg shadow-2xl relative overflow-hidden">
      {/* Glow elements */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-violet-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-fuchsia-500/10 blur-[100px]" />

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-lab-fg/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-3 py-1 text-xs font-semibold text-violet-400">
            <FaCompass className="text-xs" />
            ATLAS LIVE WORKSPACE SIMULATOR
          </div>
          <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight">
            Personal Life Operating System
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-lab-fg/60">
            Test the student attendance simulator, deep-work Pomodoro engine, and cognitive habit trackers.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap rounded-xl border border-lab-fg/15 bg-lab-fg/[0.04] p-1.5 self-start md:self-auto gap-1">
          <button
            onClick={() => setActiveTab("attendance")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
              activeTab === "attendance"
                ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
                : "text-lab-fg/70 hover:text-lab-fg"
            }`}
          >
            <FaGraduationCap /> Attendance Simulator
          </button>
          <button
            onClick={() => setActiveTab("focus")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
              activeTab === "focus"
                ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
                : "text-lab-fg/70 hover:text-lab-fg"
            }`}
          >
            <FaStopwatch /> Focus Engine
          </button>
          <button
            onClick={() => setActiveTab("habits")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
              activeTab === "habits"
                ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
                : "text-lab-fg/70 hover:text-lab-fg"
            }`}
          >
            <FaFire /> Habit Streaks
          </button>
          <button
            onClick={() => setActiveTab("aibrief")}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
              activeTab === "aibrief"
                ? "bg-violet-600 text-white shadow-lg shadow-violet-600/30"
                : "text-lab-fg/70 hover:text-lab-fg"
            }`}
          >
            <FaRobot /> AI Brief
          </button>
        </div>
      </div>

      <div className="mt-6">
        {activeTab === "attendance" && (
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div className="space-y-5">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-lab-fg/70">Total Lectures Held</span>
                  <span className="text-lab-fg font-mono">{totalClasses} classes</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="80"
                  value={totalClasses}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setTotalClasses(val);
                    if (attendedClasses > val) setAttendedClasses(val);
                  }}
                  className="w-full accent-violet-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-lab-fg/70">Lectures Attended</span>
                  <span className="text-lab-fg font-mono">{attendedClasses} classes</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={totalClasses}
                  value={attendedClasses}
                  onChange={(e) => setAttendedClasses(Number(e.target.value))}
                  className="w-full accent-violet-500"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-lab-fg/70">Target Attendance Requirement</span>
                  <span className="text-violet-400 font-mono font-bold">{targetPct}%</span>
                </div>
                <div className="flex gap-2">
                  {[75, 80, 85].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setTargetPct(pct)}
                      className={`flex-1 rounded-xl py-2 text-xs font-bold transition border ${
                        targetPct === pct
                          ? "border-violet-500 bg-violet-500/20 text-violet-300"
                          : "border-lab-fg/10 bg-lab-fg/[0.02] text-lab-fg/60 hover:border-lab-fg/20"
                      }`}
                    >
                      {pct}% Requirement
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Verdict Card */}
            <div className="rounded-2xl border border-lab-fg/15 bg-lab-fg/[0.03] p-6 text-center space-y-4">
              <div className="mx-auto w-24 h-24 rounded-full flex flex-col items-center justify-center border-4 border-violet-500/30 bg-violet-500/10">
                <span className="text-2xl font-black font-mono text-white">
                  {currentPct.toFixed(1)}%
                </span>
                <span className="text-[10px] text-lab-fg/60">Current</span>
              </div>

              <div className="space-y-1">
                <h4 className={`text-base font-bold ${isSafe ? "text-emerald-400" : "text-rose-400"}`}>
                  {isSafe ? "🟢 Attendance Safe" : "🔴 Shortage Alert"}
                </h4>
                <p className="text-xs text-lab-fg/70 max-w-sm mx-auto leading-relaxed">
                  {bunkVerdict}
                </p>
              </div>

              <div className="text-[11px] text-lab-fg/40 border-t border-lab-fg/10 pt-3">
                Calculated using Atlas Bunk Simulator algorithm
              </div>
            </div>
          </div>
        )}

        {activeTab === "focus" && (
          <div className="max-w-md mx-auto text-center space-y-6 py-4">
            <div className="mx-auto w-52 h-52 rounded-full border-4 border-violet-500/40 bg-violet-500/[0.06] flex flex-col items-center justify-center shadow-2xl relative">
              <span className="font-mono text-5xl font-extrabold tracking-tight text-lab-fg">
                {formatTimer(timerSeconds)}
              </span>
              <span className="text-xs uppercase font-medium tracking-wider text-violet-400 mt-2">
                {timerRunning ? "Deep Work Interval" : "Paused"}
              </span>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setTimerRunning(!timerRunning)}
                className="flex items-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 px-6 py-3 font-semibold text-xs text-white shadow-lg shadow-violet-600/30 transition"
              >
                {timerRunning ? <FaPause /> : <FaPlay />}
                {timerRunning ? "Pause Focus" : "Start Session"}
              </button>
              <button
                onClick={() => {
                  setTimerRunning(false);
                  setTimerSeconds(25 * 60);
                }}
                className="flex items-center gap-2 rounded-xl border border-lab-fg/15 bg-lab-fg/[0.04] px-4 py-3 font-semibold text-xs text-lab-fg/70 hover:text-lab-fg transition"
              >
                <FaRedo /> Reset
              </button>
            </div>

            <p className="text-xs text-lab-fg/50">
              Completed Pomodoro sessions today: <strong className="text-violet-400">{completedSessions}</strong>
            </p>
          </div>
        )}

        {activeTab === "habits" && (
          <div className="max-w-xl mx-auto space-y-3">
            <div className="flex items-center justify-between text-xs text-lab-fg/60 mb-2">
              <span>Daily Routine Multipliers</span>
              <span>Click to complete</span>
            </div>
            {habits.map((h) => (
              <div
                key={h.id}
                onClick={() => toggleHabit(h.id)}
                className={`cursor-pointer rounded-2xl border p-4 flex items-center justify-between transition-all ${
                  h.done
                    ? "border-emerald-500/40 bg-emerald-500/[0.06]"
                    : "border-lab-fg/10 bg-lab-fg/[0.02] hover:border-lab-fg/20"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-lg border flex items-center justify-center text-xs transition ${
                      h.done
                        ? "border-emerald-500 bg-emerald-500 text-white"
                        : "border-lab-fg/25 bg-transparent"
                    }`}
                  >
                    {h.done && <FaCheck className="text-[10px]" />}
                  </div>
                  <span className={`text-xs font-semibold ${h.done ? "line-through text-lab-fg/50" : "text-lab-fg"}`}>
                    {h.name}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-amber-400 bg-amber-400/10 px-2.5 py-1 rounded-full border border-amber-400/20">
                  <FaFire className="text-[10px]" />
                  <span>{h.streak} days</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === "aibrief" && (
          <div className="max-w-xl mx-auto rounded-2xl border border-lab-fg/15 bg-lab-fg/[0.03] p-6 space-y-4">
            <div className="flex items-center gap-3 border-b border-lab-fg/10 pb-4">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-violet-400 text-lg">
                <FaRobot />
              </div>
              <div>
                <h4 className="text-sm font-bold text-lab-fg">Atlas Cognitive Morning Brief</h4>
                <p className="text-[11px] text-lab-fg/50">Personal AI companion for university & deep work</p>
              </div>
            </div>

            <div className="text-xs leading-relaxed text-lab-fg/80 space-y-3">
              <p>
                <strong>Good morning, Pavan.</strong> Here is your snapshot for today:
              </p>
              <div className="rounded-xl border border-lab-fg/10 bg-lab-fg/[0.02] p-3 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="text-violet-400 font-bold">1.</span>
                  <span>Your Distributed Systems attendance is currently at <strong>85.4%</strong>. You are safely in the clear.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-violet-400 font-bold">2.</span>
                  <span>Priority Focus: 2 deep work blocks scheduled for <strong>Three.js Shader Optimization</strong>.</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-violet-400 font-bold">3.</span>
                  <span>You have maintained a <strong>14-day streak</strong> on DSA practice. Keep the momentum going!</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
