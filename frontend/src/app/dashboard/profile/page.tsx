"use client";

import Link from "next/link";
import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged, type User } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import type { Timestamp } from "firebase/firestore";

import Navbar from "@/components/Navbar";
import { auth, db } from "@/lib/firebase";

type UserDoc = {
  username?: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  createdAt?: Timestamp;
};

function formatMemberSince(createdAt?: Timestamp): string {
  if (!createdAt?.toDate) return "—";
  try {
    return createdAt.toDate().toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function initials(first: string, last: string, fallback: string): string {
  const a = first.trim().charAt(0);
  const b = last.trim().charAt(0);
  if (a && b) return (a + b).toUpperCase();
  if (a) return a.toUpperCase();
  const f = fallback.trim();
  if (f.length >= 2) return f.slice(0, 2).toUpperCase();
  return f.charAt(0).toUpperCase() || "?";
}

export default function ProfilePage() {
  const router = useRouter();
  const [authUser, setAuthUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [email, setEmail] = useState("");

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const baselineRef = useRef({
    firstName: "",
    lastName: "",
    displayName: "",
    bio: "",
  });

  const applyBaseline = useCallback(() => {
    const b = baselineRef.current;
    setFirstName(b.firstName);
    setLastName(b.lastName);
    setDisplayName(b.displayName);
    setBio(b.bio);
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setAuthUser(u);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (!authReady) return;
    if (!authUser) {
      router.replace("/login");
      return;
    }

    setEmail(authUser.email ?? "");

    let cancelled = false;
    (async () => {
      setLoadingProfile(true);
      setLoadError(null);
      try {
        const snap = await getDoc(doc(db, "users", authUser.uid));
        const data = (snap.exists() ? snap.data() : {}) as UserDoc;

        const fn = data.firstName ?? "";
        const ln = data.lastName ?? "";
        const dn = data.username ?? authUser.displayName ?? "";
        const bi = data.bio ?? "";

        if (cancelled) return;

        setFirstName(fn);
        setLastName(ln);
        setDisplayName(dn);
        setBio(bi);
        baselineRef.current = {
          firstName: fn,
          lastName: ln,
          displayName: dn,
          bio: bi,
        };
        setMemberSinceTs(data.createdAt);
      } catch {
        if (!cancelled) setLoadError("Could not load your profile.");
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [authReady, authUser, router]);

  useEffect(() => {
    if (!saved) return;
    const t = setTimeout(() => setSaved(false), 3000);
    return () => clearTimeout(t);
  }, [saved]);

  async function handleSave() {
    if (!authUser) return;
    setSaveError(null);
    setSaving(true);
    try {
      const username = displayName.trim() || "Anonymous";
      await setDoc(
        doc(db, "users", authUser.uid),
        {
          uid: authUser.uid,
          email: authUser.email,
          username,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          bio: bio.trim(),
        },
        { merge: true }
      );
      baselineRef.current = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        displayName: username,
        bio: bio.trim(),
      };
      setDisplayName(username);
      setSaved(true);
    } catch {
      setSaveError("Could not save changes. Try again.");
    } finally {
      setSaving(false);
    }
  }

  function handleDiscard() {
    setSaveError(null);
    applyBaseline();
  }

  const navItems = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Mood log", href: "/dashboard/history" },
    { label: "Trends", href: "#" },
    { label: "Insights", href: "#" },
    { label: "Profile", href: "/dashboard/profile", active: true },
    { label: "Settings", href: "/settings" },
  ];

  const displayFullName =
    `${firstName} ${lastName}`.trim() || displayName.trim() || "Your name";

  const [memberSinceTs, setMemberSinceTs] = useState<Timestamp | undefined>(undefined);

  const memberSince = formatMemberSince(memberSinceTs);

  if (!authReady || !authUser) {
    return (
      <div className="min-h-screen bg-white dark:bg-slate-950 flex items-center justify-center">
        <p className="text-slate-500 text-sm">Loading…</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-50 font-sans flex flex-col transition-colors duration-300">
      <Navbar />

      <div className="flex flex-1 max-w-7xl mx-auto w-full pt-24">
        <aside className="w-64 border-r border-slate-200 dark:border-slate-800 py-8 flex-col hidden md:flex shrink-0">
          <nav className="flex flex-col space-y-1 px-4">
            {navItems.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${item.active
                  ? "bg-brand-600/10 text-brand-600 dark:text-brand-400"
                  : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                  }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full ${item.active ? "bg-brand-600 dark:bg-brand-400" : "bg-slate-300 dark:bg-slate-600"}`}
                />
                {item.label}
              </Link>
            ))}
          </nav>
        </aside>

        <main className="flex-1 px-6 py-8 md:px-12 md:py-10">
          <div className="max-w-[700px]">
            <div
              className={`overflow-hidden transition-all duration-300 ${saved ? "max-h-16 opacity-100 mb-8" : "max-h-0 opacity-0 mb-0"}`}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-600/10 border border-brand-600/20 rounded-full text-sm text-brand-700 dark:text-brand-400 font-medium">
                <div className="w-1.5 h-1.5 rounded-full bg-brand-600 dark:bg-brand-400" />
                Changes saved successfully
              </div>
            </div>

            <div className="mb-8 pl-1">
              <h1 className="text-2xl md:text-3xl font-display font-semibold mb-2">Your profile</h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm">Manage how you appear in MoodFLOW</p>
            </div>

            {loadError && (
              <p className="mb-6 text-sm text-red-600 dark:text-red-400" role="alert">
                {loadError}
              </p>
            )}

            {loadingProfile ? (
              <p className="text-slate-500 text-sm">Loading profile…</p>
            ) : (
              <>
                <section className="mb-8 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 bg-slate-50/50 dark:bg-slate-900/30">
                  <h2 className="text-[11px] font-bold tracking-widest text-slate-500 uppercase mb-6">
                    Profile Picture
                  </h2>
                  <div className="flex items-center gap-6">
                    <div className="relative shrink-0">
                      {authUser.photoURL ? (
                        // eslint-disable-next-line @next/next/no-img-element -- OAuth avatar URLs are external
                        <img
                          src={authUser.photoURL}
                          alt=""
                          className="w-20 h-20 rounded-full object-cover shadow-inner"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 flex items-center justify-center text-2xl font-display font-bold shadow-inner">
                          {initials(firstName, lastName, displayName)}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-base font-semibold mb-1 text-slate-900 dark:text-slate-100">
                        {displayFullName}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
                        Member since {memberSince}
                      </p>
                      <div className="flex flex-wrap gap-3">
                        <button
                          type="button"
                          disabled
                          title="Photo upload is not available yet"
                          className="px-4 py-1.5 bg-brand-600/50 text-white text-sm font-medium rounded-lg cursor-not-allowed opacity-70"
                        >
                          Upload photo
                        </button>
                        <button
                          type="button"
                          disabled
                          className="px-4 py-1.5 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-400 text-sm font-medium rounded-lg cursor-not-allowed"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                </section>

                <section className="mb-8 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 md:p-8 bg-slate-50/50 dark:bg-slate-900/30">
                  <h2 className="text-[11px] font-bold tracking-widest text-slate-500 uppercase mb-6">
                    Display Name
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400" htmlFor="profile-first">
                        First name
                      </label>
                      <input
                        id="profile-first"
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400" htmlFor="profile-last">
                        Last name
                      </label>
                      <input
                        id="profile-last"
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 mb-6">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400" htmlFor="profile-display">
                      Display name
                    </label>
                    <input
                      id="profile-display"
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      maxLength={30}
                      className="w-full bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                    />
                    <p className="text-right text-[10px] text-slate-500 mt-1 font-medium">
                      {displayName.length} / 30
                    </p>
                  </div>

                  <div className="space-y-2 mb-6">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400" htmlFor="profile-bio">
                      Bio <span className="text-slate-400 font-normal ml-1">optional</span>
                    </label>
                    <textarea
                      id="profile-bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us a little about yourself..."
                      rows={3}
                      maxLength={160}
                      className="w-full bg-white dark:bg-slate-950/50 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-slate-200 outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 resize-none transition-all placeholder:text-slate-400 dark:placeholder:text-slate-600"
                    />
                    <p className="text-right text-[10px] text-slate-500 mt-1 font-medium">{bio.length} / 160</p>
                  </div>

                  <div className="space-y-2 mb-8 border-b border-slate-200 dark:border-slate-800 pb-8">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400" htmlFor="profile-email">
                      Email address
                    </label>
                    <input
                      id="profile-email"
                      type="email"
                      value={email}
                      disabled
                      readOnly
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-500 dark:text-slate-500 cursor-not-allowed outline-none"
                    />
                    <p className="text-[10px] text-slate-400 mt-1">
                      To change password or sign-in methods, use{" "}
                      <Link href="/settings" className="text-brand-600 dark:text-brand-400 font-medium hover:underline">
                        Settings
                      </Link>
                      .
                    </p>
                  </div>

                  {saveError && (
                    <p className="mb-4 text-sm text-red-600 dark:text-red-400" role="alert">
                      {saveError}
                    </p>
                  )}

                  <div className="flex justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleDiscard}
                      className="px-5 py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors"
                    >
                      Discard
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={saving}
                      className="px-5 py-2.5 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-xl transition-all shadow-lg shadow-brand-600/20 active:scale-95 disabled:opacity-60"
                    >
                      {saving ? "Saving…" : "Save changes"}
                    </button>
                  </div>
                </section>
              </>
            )}

            <section className="mb-20 border border-rose-200 dark:border-rose-900/30 rounded-2xl p-6 md:p-8 bg-rose-50/30 dark:bg-rose-950/10">
              <h2 className="text-[11px] font-bold tracking-widest text-rose-600 dark:text-rose-500 uppercase mb-4">
                Danger Zone
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 max-w-lg">
                Deleting your account is permanent. All your mood history, trends, and insights will be erased and cannot
                be recovered.
              </p>
              <button
                type="button"
                className="px-5 py-2.5 text-sm font-semibold text-rose-600 dark:text-rose-400 bg-white dark:bg-slate-950 border border-rose-200 dark:border-rose-900/50 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors"
              >
                Delete account
              </button>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
