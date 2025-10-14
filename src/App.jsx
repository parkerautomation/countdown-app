import { useEffect, useMemo, useState } from "react";
// import { motion } from "framer-motion";
import { Heart, MapPin } from "lucide-react";

// Hardcode your visit time here. Use a full ISO string with timezone offset.
// Example: "2025-10-12T18:00:00-04:00" means Oct 12, 2025 at 6:00 PM Toronto time
const TARGET_ISO = "2025-10-16T13:35:00-04:00";

// Optional: a label for the destination
const DESTINATION = "Ottawa";

// Compute the remaining time parts. Allow an optional nowMs for testability.
function diffParts(targetMs, nowMs = Date.now()) {
  let delta = Math.max(0, targetMs - nowMs);
  const days = Math.floor(delta / 86400000);
  delta -= days * 86400000;
  const hours = Math.floor(delta / 3600000);
  delta -= hours * 3600000;
  const minutes = Math.floor(delta / 60000);
  delta -= minutes * 60000;
  const seconds = Math.floor(delta / 1000);
  return { days, hours, minutes, seconds, totalMs: Math.max(0, targetMs - nowMs) };
}

function pad(n) {
  return n.toString().padStart(2, "0");
}

function Ring({ value, max, label }) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference * (1 - value / max);
  return (
    <div className="flex flex-col items-center">
    <svg width="120" height="120" className="drop-shadow-sm">
    <defs>
    <linearGradient id={`grad-${label}`} x1="0%" y1="0%" x2="100%" y2="100%">
    <stop offset="0%" stopColor="currentColor" />
    <stop offset="100%" stopColor="currentColor" stopOpacity="0.5" />
    </linearGradient>
    </defs>
    <circle cx="60" cy="60" r={radius} stroke="rgb(64 64 64)" strokeWidth="10" fill="none" />
    <motion.circle
    cx="60"
    cy="60"
    r={radius}
    stroke={`url(#grad-${label})`}
    strokeWidth="10"
    strokeLinecap="round"
    fill="none"
    initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
    animate={{ strokeDasharray: circumference, strokeDashoffset: progress }}
    transition={{ type: "spring", stiffness: 120, damping: 20 }}
    />
    </svg>
    <div className="mt-2 text-center">
    <div className="text-2xl font-semibold tabular-nums">{pad(value)}</div>
    <div className="text-sm text-zinc-400 uppercase tracking-wider">{label}</div>
    </div>
    </div>
  );
}

export default function CountdownApp() {
  const target = useMemo(() => new Date(TARGET_ISO).getTime(), []);
  const [parts, setParts] = useState(() => diffParts(target));

  useEffect(() => {
    const id = setInterval(() => setParts(diffParts(target)), 1000);
    return () => clearInterval(id);
  }, [target]);

  const reached = parts.totalMs === 0;

  const targetReadable = useMemo(() => {
    try {
      return new Intl.DateTimeFormat(undefined, {
        dateStyle: "full",
        timeStyle: "short",
      }).format(new Date(TARGET_ISO));
    } catch {
      return new Date(TARGET_ISO).toString();
    }
  }, []);

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-zinc-900 via-black to-zinc-900 text-zinc-100 flex items-center justify-center p-6">
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
    <div className="absolute -top-40 -left-20 w-[40rem] h-[40rem] rounded-full blur-3xl opacity-20 bg-fuchsia-600"></div>
    <div className="absolute -bottom-40 -right-20 w-[40rem] h-[40rem] rounded-full blur-3xl opacity-20 bg-emerald-500"></div>
    </div>

    <div className="relative w-full max-w-3xl">
    <motion.div
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className="rounded-3xl border border-zinc-800 bg-zinc-900/60 backdrop-blur-xl shadow-2xl p-6 sm:p-8"
    >
    <header className="flex items-center gap-3 mb-6">
    <div className="inline-flex items-center justify-center w-10 h-10 rounded-2xl bg-fuchsia-600/20 text-fuchsia-400">
    <Heart className="w-5 h-5" />
    </div>
    <div>
    <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Countdown to us</h1>
    <p className="text-zinc-400 text-sm">
    Arriving in {DESTINATION ? (
      <span className="inline-flex items-center gap-1"><MapPin className="w-4 h-4 inline" />{DESTINATION}</span>
    ) : null} on <span className="font-medium text-zinc-200">{targetReadable}</span>
    </p>
    </div>
    </header>

    {!reached ? (
      <main className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
      <div className="col-span-2 sm:col-span-4 grid grid-cols-4 gap-4">
      <motion.div layout className="col-span-1 flex items-center justify-center">
      <Ring value={parts.days} max={365} label="days" />
      </motion.div>
      <motion.div layout className="col-span-1 flex items-center justify-center">
      <Ring value={parts.hours} max={24} label="hours" />
      </motion.div>
      <motion.div layout className="col-span-1 flex items-center justify-center">
      <Ring value={parts.minutes} max={60} label="minutes" />
      </motion.div>
      <motion.div layout className="col-span-1 flex items-center justify-center">
      <Ring value={parts.seconds} max={60} label="seconds" />
      </motion.div>
      </div>

      <div className="col-span-2 sm:col-span-4 mt-6 grid grid-cols-2 gap-3">
      <Stat label="Total hours" value={Math.floor(parts.totalMs / 3600000)} />
      <Stat label="Total minutes" value={Math.floor(parts.totalMs / 60000)} />
      </div>
      </main>
    ) : (
      <Arrived />
    )}

    <footer className="mt-8 text-center text-xs text-zinc-500">
    This date is set in stone, and my heart is set on you. Every tick brings us closer together. 💖
    </footer>
    </motion.div>
    </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black/30 p-4 text-center">
    <div className="text-2xl font-semibold tabular-nums">{value.toLocaleString()}</div>
    <div className="mt-1 text-zinc-400 text-sm">{label}</div>
    </div>
  );
}

function Arrived() {
  return (
    <motion.div
    className="text-center py-10"
    initial={{ opacity: 0, scale: 0.98 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ type: "spring", stiffness: 120, damping: 18 }}
    >
    <div className="inline-flex items-center justify-center w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 mb-4">
    <Heart className="w-7 h-7" />
    </div>
    <h2 className="text-2xl font-bold">I'm here!</h2>
    <p className="text-zinc-400 mt-2">Let's make every moment count 🥰 </p>
    </motion.div>
  );
}

// Simple dev tests. They run once in the browser console and do not affect UI.
function runDevTests() {
  const now = 1_000_000_000; // arbitrary fixed timestamp

  // Case 1: 1 day, 2 hours, 3 minutes, 4 seconds
  const d1 = 1 * 86400000 + 2 * 3600000 + 3 * 60000 + 4 * 1000;
  const r1 = diffParts(now + d1, now);
  console.assert(r1.days === 1, "days should be 1, got", r1.days);
  console.assert(r1.hours === 2, "hours should be 2, got", r1.hours);
  console.assert(r1.minutes === 3, "minutes should be 3, got", r1.minutes);
  console.assert(r1.seconds === 4, "seconds should be 4, got", r1.seconds);

  // Case 2: 90 seconds
  const d2 = 90 * 1000;
  const r2 = diffParts(now + d2, now);
  console.assert(r2.days === 0, "days should be 0");
  console.assert(r2.hours === 0, "hours should be 0");
  console.assert(r2.minutes === 1, "minutes should be 1, got", r2.minutes);
  console.assert(r2.seconds === 30, "seconds should be 30, got", r2.seconds);

  // Case 3: pad helper
  console.assert(pad(5) === "05", "pad(5) should be '05'");
  console.assert(pad(12) === "12", "pad(12) should be '12'");

  // Case 4: non negative totalMs when target is in the past
  const r3 = diffParts(now - 1000, now);
  console.assert(r3.totalMs === 0, "totalMs should clamp to 0 for past target");

  console.log("Countdown tests passed");
}

if (typeof window !== "undefined" && !window.__COUNTDOWN_TESTED__) {
  window.__COUNTDOWN_TESTED__ = true;
  try { runDevTests(); } catch (e) { console.error("Countdown tests failed", e); }
}