"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaAmbulance,
  FaCheckCircle,
  FaExclamationTriangle,
  FaHandsHelping,
  FaHourglassHalf,
  FaMapMarkerAlt,
  FaPaperPlane,
  FaRobot,
  FaRoute,
  FaShieldAlt,
  FaTint,
  FaTruck,
  FaUsers,
  FaUtensils,
  FaWarehouse,
} from "react-icons/fa";

type SOSRequest = {
  id: string;
  area: string;
  category: "Water" | "Food" | "Medical" | "Rescue";
  people: number;
  priority: "Critical" | "High" | "Medium";
  urgencyScore: number;
  explanation: string[];
  status: "Pending" | "Allocated" | "Dispatched" | "Delivered";
  assignedCentre?: string;
  distanceKm?: number;
  etaMin?: number;
  timeAgo: string;
};

const initialReliefCentres = [
  { id: 1, name: "Govt. High School Relief Camp", area: "Ward 12", occupied: 320, capacity: 400, lat: 12.3205, lng: 76.6290, water: 4200, food: 850, medical: 120 },
  { id: 2, name: "Community Hall, Lakshmipuram", area: "Ward 7", occupied: 210, capacity: 250, lat: 12.3105, lng: 76.6455, water: 2800, food: 640, medical: 90 },
  { id: 3, name: "District Stadium Shelter", area: "Central Zone", occupied: 490, capacity: 500, lat: 12.3047, lng: 76.6557, water: 6500, food: 1400, medical: 310 },
  { id: 4, name: "Town Hall Relief Point", area: "Ward 3", occupied: 90, capacity: 300, lat: 12.3070, lng: 76.6540, water: 1900, food: 320, medical: 45 },
];

const initialRequests: SOSRequest[] = [
  {
    id: "REQ-7104",
    area: "Lakshmipuram Lowlands",
    category: "Medical",
    people: 48,
    priority: "Critical",
    urgencyScore: 94,
    explanation: ["Critical medical priority (+55)", "48 citizens affected (+16.8)", "Floodwater surge in Ward 7 (+15)"],
    status: "Pending",
    timeAgo: "8 min ago",
  },
  {
    id: "REQ-7102",
    area: "Ward 12 Riverside",
    category: "Water",
    people: 120,
    priority: "High",
    urgencyScore: 82,
    explanation: ["High potable water urgency (+40)", "120 citizens affected (+20.7)", "Waiting 45m (+8.5)"],
    status: "Allocated",
    assignedCentre: "Govt. High School Relief Camp",
    distanceKm: 1.4,
    etaMin: 14,
    timeAgo: "45 min ago",
  },
  {
    id: "REQ-7098",
    area: "Old Agrahara Sector",
    category: "Food",
    people: 65,
    priority: "High",
    urgencyScore: 78,
    explanation: ["Dry ration food packs (+40)", "Elderly & infant needs (+18)", "Moderate distance (+12)"],
    status: "Dispatched",
    assignedCentre: "Town Hall Relief Point",
    distanceKm: 2.1,
    etaMin: 7,
    timeAgo: "1 hr ago",
  },
];

export default function SankatSaathiLiveDemo() {
  const [activeTab, setActiveTab] = useState<"command" | "citizen">("command");
  const [requests, setRequests] = useState<SOSRequest[]>(initialRequests);
  const [centres, setCentres] = useState(initialReliefCentres);
  const [selectedReq, setSelectedReq] = useState<SOSRequest | null>(null);

  // Citizen Form state
  const [citizenForm, setCitizenForm] = useState({
    area: "Ward 12 Riverside",
    category: "Water" as "Water" | "Food" | "Medical" | "Rescue",
    people: 25,
    details: "Drinking water supply cut off, elderly community members stranded on 1st floor.",
  });
  const [sosSent, setSosSent] = useState(false);

  // Haversine distance simulation
  const calculateHaversine = (area: string) => {
    const distances: Record<string, number> = {
      "Ward 12 Riverside": 1.2,
      "Lakshmipuram Lowlands": 0.9,
      "Old Agrahara Sector": 2.4,
      "Chamundi Foothills": 3.8,
      "KRS Basin Road": 4.5,
    };
    return distances[area] || 2.0;
  };

  const handleBroadcastSOS = (e: React.FormEvent) => {
    e.preventDefault();
    const isCritical = citizenForm.category === "Medical" || citizenForm.category === "Rescue" || citizenForm.people > 50;
    const priority = isCritical ? "Critical" : citizenForm.people > 20 ? "High" : "Medium";
    const urgencyPoints = isCritical ? 55 : 40;
    const peoplePoints = Math.min(25, Math.round(Math.log2(citizenForm.people + 1) * 4));
    const score = Math.min(100, urgencyPoints + peoplePoints + 15);

    const newReq: SOSRequest = {
      id: `REQ-${Math.floor(1000 + Math.random() * 9000)}`,
      area: citizenForm.area,
      category: citizenForm.category,
      people: citizenForm.people,
      priority,
      urgencyScore: score,
      explanation: [
        `${priority} priority classification (+${urgencyPoints})`,
        `${citizenForm.people} people affected (+${peoplePoints})`,
        `Realtime citizen broadcast verified (+15)`,
      ],
      status: "Pending",
      timeAgo: "Just now",
    };

    setRequests([newReq, ...requests]);
    setSosSent(true);
    setTimeout(() => {
      setSosSent(false);
      setActiveTab("command");
      setSelectedReq(newReq);
    }, 1500);
  };

  const handleRunAllocation = (reqId: string) => {
    const target = requests.find((r) => r.id === reqId);
    if (!target) return;

    const chosenCentre = centres[Math.floor(Math.random() * centres.length)];
    const dist = calculateHaversine(target.area);
    const eta = Math.round(dist * 7 + 4);

    // Deduct stock
    setCentres((prev) =>
      prev.map((c) =>
        c.id === chosenCentre.id
          ? {
            ...c,
            water: Math.max(0, c.water - (target.category === "Water" ? target.people * 5 : 0)),
            food: Math.max(0, c.food - (target.category === "Food" ? target.people * 2 : 0)),
            medical: Math.max(0, c.medical - (target.category === "Medical" ? 5 : 0)),
          }
          : c
      )
    );

    setRequests((prev) =>
      prev.map((r) =>
        r.id === reqId
          ? {
            ...r,
            status: "Allocated",
            assignedCentre: chosenCentre.name,
            distanceKm: dist,
            etaMin: eta,
          }
          : r
      )
    );

    if (selectedReq?.id === reqId) {
      setSelectedReq((prev) =>
        prev
          ? {
            ...prev,
            status: "Allocated",
            assignedCentre: chosenCentre.name,
            distanceKm: dist,
            etaMin: eta,
          }
          : null
      );
    }
  };

  const handleDispatch = (reqId: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === reqId
          ? {
            ...r,
            status: "Dispatched",
          }
          : r
      )
    );
    if (selectedReq?.id === reqId) {
      setSelectedReq((prev) => (prev ? { ...prev, status: "Dispatched" } : null));
    }
  };

  const handleComplete = (reqId: string) => {
    setRequests((prev) =>
      prev.map((r) =>
        r.id === reqId
          ? {
            ...r,
            status: "Delivered",
          }
          : r
      )
    );
    if (selectedReq?.id === reqId) {
      setSelectedReq((prev) => (prev ? { ...prev, status: "Delivered" } : null));
    }
  };

  const totals = useMemo(() => {
    const peopleAssisted = requests.reduce((acc, r) => acc + (r.status === "Delivered" ? r.people : 0), 430);
    const pendingCount = requests.filter((r) => r.status === "Pending").length;
    const criticalCount = requests.filter((r) => r.priority === "Critical" && r.status !== "Delivered").length;
    return { peopleAssisted, pendingCount, criticalCount };
  }, [requests]);

  return (
    <div id="demo" className="scroll-mt-24 rounded-3xl border border-lab-fg/10 bg-lab-surface p-5 sm:p-8 text-lab-fg shadow-2xl relative overflow-hidden">
      {/* Glow elements */}
      <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-cyan-500/10 blur-[100px]" />
      <div className="pointer-events-none absolute -left-20 -bottom-20 h-72 w-72 rounded-full bg-rose-500/10 blur-[100px]" />

      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-lab-fg/10 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-400">
            <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
            LIVE SIMULATION ENVIRONMENT
          </div>
          <h2 className="mt-3 text-2xl sm:text-3xl font-bold tracking-tight">
            Sankat Saathi Emergency Dispatch Engine
          </h2>
          <p className="mt-1 text-xs sm:text-sm text-lab-fg/60">
            Interact with the explainable AI ranking, Haversine geospatial allocator, and citizen SOS pipelines.
          </p>
        </div>

        {/* Tab switcher */}
        <div className="flex rounded-xl border border-lab-fg/15 bg-lab-fg/[0.04] p-1.5 self-start md:self-auto">
          <button
            onClick={() => setActiveTab("command")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${activeTab === "command"
              ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/30"
              : "text-lab-fg/70 hover:text-lab-fg"
              }`}
          >
            <FaShieldAlt /> Command Operations
          </button>
          <button
            onClick={() => setActiveTab("citizen")}
            className={`flex items-center gap-2 rounded-lg px-4 py-2 text-xs font-semibold transition ${activeTab === "citizen"
              ? "bg-rose-500 text-white shadow-lg shadow-rose-500/30"
              : "text-lab-fg/70 hover:text-lab-fg"
              }`}
          >
            <FaExclamationTriangle /> Citizen SOS Portal
          </button>
        </div>
      </div>

      {activeTab === "command" ? (
        <div className="mt-6 space-y-6">
          {/* KPI Stat Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="rounded-2xl border border-lab-fg/10 bg-lab-fg/[0.025] p-4">
              <span className="text-[10px] uppercase font-mono tracking-wider text-lab-fg/50 flex items-center justify-between">
                People Assisted <FaUsers className="text-cyan-400" />
              </span>
              <p className="mt-2 text-2xl sm:text-3xl font-bold text-lab-fg">
                {totals.peopleAssisted.toLocaleString()}
              </p>
              <span className="text-[11px] text-emerald-400 font-medium">+48 in last 2 hrs</span>
            </div>

            <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.04] p-4">
              <span className="text-[10px] uppercase font-mono tracking-wider text-rose-400/80 flex items-center justify-between">
                Critical SOS <FaExclamationTriangle className="text-rose-400" />
              </span>
              <p className="mt-2 text-2xl sm:text-3xl font-bold text-rose-400">
                {totals.criticalCount}
              </p>
              <span className="text-[11px] text-rose-400/70 font-medium">Prioritized by AI model</span>
            </div>

            <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-4">
              <span className="text-[10px] uppercase font-mono tracking-wider text-amber-400/80 flex items-center justify-between">
                Pending Allocations <FaHourglassHalf className="text-amber-400" />
              </span>
              <p className="mt-2 text-2xl sm:text-3xl font-bold text-amber-300">
                {totals.pendingCount}
              </p>
              <span className="text-[11px] text-amber-400/70 font-medium">Ready for dispatch</span>
            </div>

            <div className="rounded-2xl border border-lab-fg/10 bg-lab-fg/[0.025] p-4">
              <span className="text-[10px] uppercase font-mono tracking-wider text-lab-fg/50 flex items-center justify-between">
                Relief Centres <FaWarehouse className="text-violet-400" />
              </span>
              <p className="mt-2 text-2xl sm:text-3xl font-bold text-lab-fg">
                4 Camps
              </p>
              <span className="text-[11px] text-lab-fg/60 font-medium">1,120 / 1,450 capacity</span>
            </div>
          </div>

          {/* Main Grid: Queue on left, Inspector on right */}
          <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6">
            {/* Live Queue */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold uppercase tracking-wider text-lab-fg/80">
                  Priority Dispatch Queue ({requests.length})
                </h3>
                <span className="text-[11px] text-lab-fg/50">Sorted by Explainable Urgency Score</span>
              </div>

              <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                {requests.map((req) => {
                  const isCritical = req.priority === "Critical";
                  const isHigh = req.priority === "High";
                  return (
                    <div
                      key={req.id}
                      onClick={() => setSelectedReq(req)}
                      className={`cursor-pointer rounded-2xl border p-4 transition-all ${selectedReq?.id === req.id
                        ? "border-cyan-400 bg-cyan-500/[0.08] shadow-md"
                        : "border-lab-fg/10 bg-lab-fg/[0.02] hover:border-lab-fg/25 hover:bg-lab-fg/[0.04]"
                        }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-lab-accent">
                            {req.id}
                          </span>
                          <span
                            className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${isCritical
                              ? "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                              : isHigh
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : "bg-sky-500/20 text-sky-400 border border-sky-500/30"
                              }`}
                          >
                            {req.priority} ({req.urgencyScore}/100)
                          </span>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${req.status === "Delivered"
                          ? "bg-emerald-500/20 text-emerald-400"
                          : req.status === "Dispatched"
                            ? "bg-violet-500/20 text-violet-400 animate-pulse"
                            : req.status === "Allocated"
                              ? "bg-cyan-500/20 text-cyan-400"
                              : "bg-amber-500/20 text-amber-400"
                          }`}>
                          {req.status}
                        </span>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-xs text-lab-fg/70">
                        <span className="flex items-center gap-1.5 font-medium">
                          <FaMapMarkerAlt className="text-rose-400 text-[10px]" />
                          {req.area}
                        </span>
                        <span className="flex items-center gap-1">
                          <FaUsers className="text-[10px]" /> {req.people} affected
                        </span>
                      </div>

                      <div className="mt-2.5 flex items-center justify-between border-t border-lab-fg/10 pt-2 text-[11px]">
                        <span className="inline-flex items-center gap-1 text-lab-fg/50">
                          {req.category === "Water" && <FaTint className="text-cyan-400" />}
                          {req.category === "Food" && <FaUtensils className="text-amber-400" />}
                          {req.category === "Medical" && <FaAmbulance className="text-rose-400" />}
                          {req.category === "Rescue" && <FaHandsHelping className="text-emerald-400" />}
                          Need: {req.category}
                        </span>
                        <span className="text-lab-fg/40">{req.timeAgo}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Decision Inspector Panel */}
            <div className="rounded-2xl border border-lab-fg/15 bg-lab-fg/[0.03] p-5 flex flex-col justify-between">
              {selectedReq ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-lab-fg/10 pb-3">
                    <div>
                      <h4 className="text-sm font-bold text-lab-fg flex items-center gap-2">
                        <FaRobot className="text-cyan-400" /> AI Allocation Engine
                      </h4>
                      <p className="text-[11px] text-lab-fg/50">Evaluating {selectedReq.id}</p>
                    </div>
                    <span className="text-xs font-mono font-bold text-cyan-300">
                      Score: {selectedReq.urgencyScore}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-lab-fg/50">
                      Scoring Factors (Explainable AI)
                    </p>
                    <div className="space-y-1.5">
                      {selectedReq.explanation.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-2 rounded-lg bg-lab-fg/[0.03] px-3 py-1.5 text-xs text-lab-fg/80 border border-lab-fg/5"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400" />
                          {item}
                        </div>
                      ))}
                    </div>
                  </div>

                  {selectedReq.assignedCentre && (
                    <div className="rounded-xl border border-cyan-500/20 bg-cyan-500/[0.05] p-3 text-xs space-y-1">
                      <p className="font-semibold text-cyan-300 flex items-center gap-1.5">
                        <FaRoute /> Haversine Distance Calculated
                      </p>
                      <p className="text-lab-fg/70">
                        Nearest Depot: <strong>{selectedReq.assignedCentre}</strong>
                      </p>
                      <p className="text-lab-fg/70">
                        Proximity: <strong>{selectedReq.distanceKm} km</strong> (Est. transit: {selectedReq.etaMin} mins)
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-3 border-t border-lab-fg/10 space-y-2">
                    {selectedReq.status === "Pending" && (
                      <button
                        onClick={() => handleRunAllocation(selectedReq.id)}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-cyan-500 hover:bg-cyan-600 px-4 py-2.5 font-semibold text-xs text-white shadow-lg shadow-cyan-500/20 transition"
                      >
                        <FaRobot /> Match Nearest Relief Warehouse
                      </button>
                    )}

                    {selectedReq.status === "Allocated" && (
                      <button
                        onClick={() => handleDispatch(selectedReq.id)}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-violet-600 hover:bg-violet-700 px-4 py-2.5 font-semibold text-xs text-white shadow-lg shadow-violet-600/20 transition"
                      >
                        <FaTruck /> Authorize Vehicle & Dispatch Now
                      </button>
                    )}

                    {selectedReq.status === "Dispatched" && (
                      <button
                        onClick={() => handleComplete(selectedReq.id)}
                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 font-semibold text-xs text-white shadow-lg shadow-emerald-600/20 transition"
                      >
                        <FaCheckCircle /> Confirm Delivery Receipt
                      </button>
                    )}

                    {selectedReq.status === "Delivered" && (
                      <div className="flex items-center justify-center gap-2 py-2 text-xs font-semibold text-emerald-400">
                        <FaCheckCircle /> Emergency aid successfully delivered!
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center py-12 text-lab-fg/50 space-y-2">
                  <FaRoute className="text-3xl text-lab-fg/30" />
                  <p className="text-xs">Select any request from the queue to inspect AI scoring and initiate allocation.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        /* Citizen SOS Portal Simulator */
        <div className="mt-6 max-w-xl mx-auto">
          <form onSubmit={handleBroadcastSOS} className="rounded-2xl border border-lab-fg/15 bg-lab-fg/[0.03] p-6 space-y-5">
            <div className="border-b border-lab-fg/10 pb-4">
              <h3 className="text-lg font-bold text-lab-fg flex items-center gap-2">
                <FaExclamationTriangle className="text-rose-500" />
                Citizen SOS Emergency Request
              </h3>
              <p className="text-xs text-lab-fg/60 mt-1">
                Simulates real-time flood emergency assistance dispatch backed by Supabase & IBM Z.
              </p>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-lab-fg/60">
                Emergency Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(["Water", "Food", "Medical", "Rescue"] as const).map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setCitizenForm({ ...citizenForm, category: cat })}
                    className={`flex items-center justify-center gap-1.5 rounded-xl border p-2.5 text-xs font-semibold transition ${citizenForm.category === cat
                      ? "border-rose-500 bg-rose-500/15 text-rose-400"
                      : "border-lab-fg/10 bg-lab-fg/[0.02] text-lab-fg/70 hover:border-lab-fg/20"
                      }`}
                  >
                    {cat === "Water" && <FaTint />}
                    {cat === "Food" && <FaUtensils />}
                    {cat === "Medical" && <FaAmbulance />}
                    {cat === "Rescue" && <FaHandsHelping />}
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-lab-fg/60">
                Affected Zone (Mysuru District)
              </label>
              <select
                value={citizenForm.area}
                onChange={(e) => setCitizenForm({ ...citizenForm, area: e.target.value })}
                className="w-full rounded-xl border border-lab-fg/15 bg-lab-fg/[0.05] px-4 py-2.5 text-xs font-semibold text-lab-fg focus:outline-none focus:border-rose-500"
              >
                <option value="Ward 12 Riverside" className="bg-[#0b1324] text-white">Ward 12 Riverside (High Risk)</option>
                <option value="Lakshmipuram Lowlands" className="bg-[#0b1324] text-white">Lakshmipuram Lowlands</option>
                <option value="Old Agrahara Sector" className="bg-[#0b1324] text-white">Old Agrahara Sector</option>
                <option value="Chamundi Foothills" className="bg-[#0b1324] text-white">Chamundi Foothills</option>
                <option value="KRS Basin Road" className="bg-[#0b1324] text-white">KRS Basin Road</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-lab-fg/60 flex justify-between">
                <span>Number of People Affected</span>
                <span className="font-bold text-rose-400">{citizenForm.people} citizens</span>
              </label>
              <input
                type="range"
                min="1"
                max="150"
                value={citizenForm.people}
                onChange={(e) => setCitizenForm({ ...citizenForm, people: Number(e.target.value) })}
                className="w-full accent-rose-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold uppercase tracking-wider text-lab-fg/60">
                Urgent Situation Details
              </label>
              <textarea
                rows={3}
                value={citizenForm.details}
                onChange={(e) => setCitizenForm({ ...citizenForm, details: e.target.value })}
                className="w-full rounded-xl border border-lab-fg/15 bg-lab-fg/[0.05] p-3 text-xs text-lab-fg focus:outline-none focus:border-rose-500"
              />
            </div>

            <button
              type="submit"
              disabled={sosSent}
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 px-6 py-3.5 font-bold text-sm text-white shadow-xl shadow-rose-600/30 transition disabled:opacity-50"
            >
              {sosSent ? (
                <>
                  <FaCheckCircle className="text-base" /> Broadcasting to Emergency Command...
                </>
              ) : (
                <>
                  <FaPaperPlane /> Broadcast Emergency SOS
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
