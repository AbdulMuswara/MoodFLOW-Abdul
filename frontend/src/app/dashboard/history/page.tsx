"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  getDocs,
  orderBy,
  query,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";
import DashboardHeader from "@/components/DashboardHeader";

type MoodEntry = {
  id: string;
  emojiScore: number;
  moodScore?: number;
  note: string;
  date: any;
};

const PAGE_SIZE = 8;
const RANGES = ["7 Days", "30 Days", "90 Days", "All Time"];
const MOOD_FILTERS = [
  { label: "All", value: 0 },
  { label: "😄 Excellent", value: 5 },
  { label: "🙂 Good", value: 4 },
  { label: "😐 Neutral", value: 3 },
  { label: "🙁 Bad", value: 2 },
  { label: "😞 Very Bad", value: 1 },
];

const moodStyles: Record<number, { bg: string; text: string; ring: string; emoji: string; label: string }> = {
  1: {
    bg: "bg-amber-50 dark:bg-amber-950/40",
    text: "text-amber-700 dark:text-amber-300",
    ring: "border-amber-300 dark:border-amber-700",
    emoji: "😞",
    label: "Very Bad",
  },
  2: {
    bg: "bg-rose-50 dark:bg-rose-950/40",
    text: "text-rose-700 dark:text-rose-300",
    ring: "border-rose-300 dark:border-rose-700",
    emoji: "🙁",
    label: "Bad",
  },
  3: {
    bg: "bg-slate-100 dark:bg-slate-800/60",
    text: "text-slate-600 dark:text-slate-300",
    ring: "border-slate-300 dark:border-slate-600",
    emoji: "😐",
    label: "Neutral",
  },
  4: {
    bg: "bg-emerald-50 dark:bg-emerald-950/40",
    text: "text-emerald-700 dark:text-emerald-300",
    ring: "border-emerald-300 dark:border-emerald-700",
    emoji: "🙂",
    label: "Good",
  },
  5: {
    bg: "bg-indigo-50 dark:bg-indigo-950/40",
    text: "text-indigo-700 dark:text-indigo-300",
    ring: "border-indigo-300 dark:border-indigo-600",
    emoji: "😄",
    label: "Excellent",
  },
};

function toDate(d: MoodEntry["date"]): Date {
  if (!d) return new Date(0);
  if (d instanceof Date) return d;
  if (typeof d?.toDate === "function") return d.toDate();
  return new Date(0);
}

export default function MoodHistoryPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [entries, setEntries] = useState<MoodEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [moodFilter, setMoodFilter] = useState(0);
  const [range, setRange] = useState("30 Days");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchEntries = async () => {
      setLoading(true);
      try {
        const ref = collection(db, "users", user.uid, "moodEntries");
        const q = query(ref, orderBy("date", "desc"));
        const snap = await getDocs(q);

        const data: MoodEntry[] = snap.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as Omit<MoodEntry, "id">),
        }));

        setEntries(data);
      } catch (err) {
        console.error("Failed to fetch mood history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEntries();
  }, [user]);

  const now = new Date();

  const filtered = entries.filter((entry) => {
    if (moodFilter !== 0 && entry.emojiScore !== moodFilter) return false;

    if (range !== "All Time") {
      const days = range === "7 Days" ? 7 : range === "30 Days" ? 30 : 90;
      const cutoff = new Date(now.getTime() - days * 86400000);
      if (toDate(entry.date) < cutoff) return false;
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      const dateStr = toDate(entry.date).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }).toLowerCase();

      if (
        !entry.note?.toLowerCase().includes(q) &&
        !dateStr.includes(q)
      ) {
        return false;
      }
    }

    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const pageSlice = filtered.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  );

  const scoredEntries = entries.filter(
  (e) => typeof e.moodScore === "number"
  );

  const avgMood = scoredEntries.length
  ? (
      scoredEntries.reduce((sum, e) => sum + (e.moodScore || 0), 0) /
      scoredEntries.length
    ).toFixed(1)
  : "—";

  const thisMonth = entries.filter((e) => {
    const d = toDate(e.date);
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }).length;

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50">
      <DashboardHeader />

      <div className="pt-20 pb-16 px-6">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
                <button
                  onClick={() => router.push("/dashboard")}
                  className="hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                >
                  Dashboard
                </button>
                {" "}· History
              </p>

              <h1 className="mt-2 text-3xl md:text-4xl font-display font-bold tracking-tight">
                Mood History
              </h1>

              <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm md:text-base">
                Browse and search all your past mood entries.
              </p>
            </div>

            <div className="self-start md:self-auto px-4 py-2 rounded-full bg-slate-900 text-slate-50 text-xs font-semibold tracking-wide uppercase">
              MoodFLOW · History
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total entries", value: entries.length },
              { label: "Avg mood", value: avgMood },
              { label: "This month", value: thisMonth },
              { label: "Showing", value: filtered.length },
            ].map(({ label, value }) => (
              <div
                key={label}
                className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/60 px-4 py-4"
              >
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 mb-1">
                  {label}
                </p>
                <p className="text-2xl font-bold tabular-nums">{value}</p>
              </div>
            ))}
          </div>

          <section className="rounded-3xl bg-white/80 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 shadow-lg shadow-slate-900/5">
            <div className="px-6 pt-5 pb-5 space-y-4">
              <div className="relative">
                <svg
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400"
                  fill="none"
                  viewBox="0 0 16 16"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <circle cx="6.5" cy="6.5" r="4" />
                  <line x1="10" y1="10" x2="14" y2="14" />
                </svg>

                <input
                  type="text"
                  placeholder="Search entries by note or date..."
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setPage(1);
                  }}
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/60 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/60"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                {MOOD_FILTERS.map((filter) => (
                  <button
                    key={filter.value}
                    onClick={() => {
                      setMoodFilter(filter.value);
                      setPage(1);
                    }}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                      moodFilter === filter.value
                        ? "bg-brand-600 text-white border-brand-600 shadow-sm shadow-brand-600/30"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-950/50 hover:border-slate-300"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex flex-wrap gap-2">
                  {RANGES.map((r) => (
                    <button
                      key={r}
                      onClick={() => {
                        setRange(r);
                        setPage(1);
                      }}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                        range === r
                          ? "bg-brand-600 text-white border-brand-600 shadow-sm shadow-brand-600/30"
                          : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 bg-slate-50/50 dark:bg-slate-950/50 hover:border-slate-300"
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>

                <p className="text-xs text-slate-400">
                  {filtered.length} entr{filtered.length === 1 ? "y" : "ies"}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl bg-white/80 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 shadow-lg shadow-slate-900/5">
            <div className="px-6 py-5 space-y-4">
              {loading ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Loading entries...
                </p>
              ) : pageSlice.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No mood entries found for the selected filters.
                </p>
              ) : (
                pageSlice.map((entry) => {
                  const mood = moodStyles[entry.emojiScore] ?? moodStyles[3];

                  return (
                    <article
                      key={entry.id}
                      className="rounded-2xl border border-slate-100 dark:border-slate-900 bg-slate-50/80 dark:bg-slate-950/60 p-4"
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`mt-1 flex h-12 w-12 items-center justify-center rounded-2xl border ${mood.ring} ${mood.bg} text-xl shadow-sm`}
                        >
                          {mood.emoji}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-900 text-slate-50">
                              {toDate(entry.date).toLocaleDateString("en-US", {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </span>

                            <span
                              className={`text-xs font-medium px-2.5 py-1 rounded-full border ${mood.ring} ${mood.text} ${mood.bg}`}
                            >
                              {mood.label}
                            </span>

                            {typeof entry.moodScore === "number" && (
                              <span className="text-xs text-slate-500 dark:text-slate-400">
                                Score: {entry.moodScore.toFixed(2)}
                              </span>
                            )}
                          </div>

                          <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
                            {entry.note}
                          </p>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>

            {totalPages > 1 && (
              <div className="px-6 pb-6 flex items-center justify-between">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-sm disabled:opacity-50"
                >
                  Previous
                </button>

                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Page {currentPage} of {totalPages}
                </p>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-800 text-sm disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}