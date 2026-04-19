"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  EmailAuthProvider,
  GoogleAuthProvider,
  linkWithCredential,
  onAuthStateChanged,
  reauthenticateWithCredential,
  reauthenticateWithPopup,
  updatePassword,
  type User,
} from "firebase/auth";
import { CheckCircle2, Lock, Mail } from "lucide-react";
import { auth } from "@/lib/firebase";
import { getLinkedProviders } from "@/lib/authProviders";
import { authErrorMessage } from "@/lib/settingsAuthErrors";
import Navbar from "@/components/Navbar";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [authReady, setAuthReady] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [addNewPassword, setAddNewPassword] = useState("");
  const [addConfirmPassword, setAddConfirmPassword] = useState("");

  const [changeError, setChangeError] = useState<string | null>(null);
  const [changeSuccess, setChangeSuccess] = useState(false);
  const [changeLoading, setChangeLoading] = useState(false);

  const [addError, setAddError] = useState<string | null>(null);
  const [addSuccess, setAddSuccess] = useState(false);
  const [addLoading, setAddLoading] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthReady(true);
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    if (authReady && !user) {
      router.replace("/login");
    }
  }, [authReady, user, router]);

  const linked = user ? getLinkedProviders(user) : { hasPassword: false, hasGoogle: false };
  const showPasswordSection = linked.hasPassword;
  const showGoogleBadge = linked.hasGoogle;
  const showAddPasswordOnly = linked.hasGoogle && !linked.hasPassword;

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.email) return;

    setChangeError(null);
    setChangeSuccess(false);

    if (newPassword !== confirmNewPassword) {
      setChangeError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setChangeError("Password must be at least 6 characters.");
      return;
    }

    setChangeLoading(true);
    try {
      const cred = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, cred);
      await updatePassword(user, newPassword);
      await user.reload();
      setUser(auth.currentUser);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setChangeSuccess(true);
    } catch (err: unknown) {
      const code = err && typeof err === "object" && "code" in err ? String((err as { code: string }).code) : "";
      setChangeError(authErrorMessage(code));
    } finally {
      setChangeLoading(false);
    }
  }

  async function handleAddPassword(e: React.FormEvent) {
    e.preventDefault();
    if (!user?.email) return;

    setAddError(null);
    setAddSuccess(false);

    if (addNewPassword !== addConfirmPassword) {
      setAddError("Passwords do not match.");
      return;
    }
    if (addNewPassword.length < 6) {
      setAddError("Password must be at least 6 characters.");
      return;
    }

    setAddLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      await reauthenticateWithPopup(user, provider);
      const emailCred = EmailAuthProvider.credential(user.email, addNewPassword);
      await linkWithCredential(user, emailCred);
      await user.reload();
      setUser(auth.currentUser);
      setAddNewPassword("");
      setAddConfirmPassword("");
      setAddSuccess(true);
    } catch (err: unknown) {
      const code = err && typeof err === "object" && "code" in err ? String((err as { code: string }).code) : "";
      setAddError(authErrorMessage(code));
    } finally {
      setAddLoading(false);
    }
  }

  useEffect(() => {
    if (changeSuccess) {
      const t = setTimeout(() => setChangeSuccess(false), 4000);
      return () => clearTimeout(t);
    }
  }, [changeSuccess]);

  useEffect(() => {
    if (addSuccess) {
      const t = setTimeout(() => setAddSuccess(false), 6000);
      return () => clearTimeout(t);
    }
  }, [addSuccess]);

  if (!authReady || !user) {
    return (
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <p className="text-slate-500 dark:text-slate-400 text-sm">Loading…</p>
      </main>
    );
  }

  const emailDisplay = user.email ?? "";

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-50">
      <Navbar />

      <div className="pt-20 pb-16 px-6">
        <div className="max-w-xl mx-auto space-y-8">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400 uppercase tracking-[0.2em]">
              Account
            </p>
            <h1 className="mt-2 text-3xl font-display font-bold tracking-tight">Settings</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-400 text-sm">
              Manage how you sign in to MoodFLOW.
            </p>
            <Link
              href="/dashboard"
              className="inline-block mt-4 text-sm font-medium text-brand-600 dark:text-brand-400 hover:underline"
            >
              ← Back to dashboard
            </Link>
          </div>

          {addSuccess && (
            <div
              className="flex items-start gap-3 rounded-2xl border border-emerald-200 dark:border-emerald-800/60 bg-emerald-50/90 dark:bg-emerald-950/40 px-4 py-3 text-sm text-emerald-900 dark:text-emerald-100"
              role="status"
              aria-live="polite"
            >
              <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" aria-hidden />
              <div>
                <p className="font-semibold">Password added</p>
                <p className="mt-0.5 text-emerald-800/90 dark:text-emerald-200/90">
                  You can sign in with email and password as well as Google. Use &quot;Change password&quot; below if you
                  need to update it later.
                </p>
              </div>
            </div>
          )}

          <section className="glass rounded-3xl bg-white/80 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 shadow-lg shadow-slate-900/5 p-6 md:p-8 space-y-6">
            <div>
              <h2 className="text-lg font-display font-semibold flex items-center gap-2">
                <Mail className="w-5 h-5 text-brand-500" aria-hidden />
                Email
              </h2>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                Your sign-in email cannot be changed here.
              </p>
              <div className="mt-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
                <input
                  type="email"
                  readOnly
                  value={emailDisplay}
                  className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-900/80 px-4 py-3 text-sm text-slate-700 dark:text-slate-200 cursor-default"
                  aria-label="Your email address"
                />
                {showGoogleBadge && (
                  <span className="inline-flex items-center justify-center rounded-full bg-slate-900 text-slate-50 dark:bg-slate-100 dark:text-slate-900 px-3 py-1.5 text-xs font-semibold whitespace-nowrap">
                    via Google
                  </span>
                )}
              </div>
            </div>
          </section>

          {showPasswordSection && (
            <section className="glass rounded-3xl bg-white/80 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 shadow-lg shadow-slate-900/5 p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-lg font-display font-semibold flex items-center gap-2">
                  <Lock className="w-5 h-5 text-brand-500" aria-hidden />
                  Change password
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Enter your current password, then choose a new one.
                </p>
              </div>

              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label htmlFor="current-password" className="text-sm font-medium">
                    Current password
                  </label>
                  <input
                    id="current-password"
                    type="password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/60"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="new-password" className="text-sm font-medium">
                    New password
                  </label>
                  <input
                    id="new-password"
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/60"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label htmlFor="confirm-new-password" className="text-sm font-medium">
                    Confirm new password
                  </label>
                  <input
                    id="confirm-new-password"
                    type="password"
                    autoComplete="new-password"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/60"
                    required
                    minLength={6}
                  />
                </div>

                {changeError && (
                  <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                    {changeError}
                  </p>
                )}
                {changeSuccess && (
                  <p className="text-sm text-emerald-600 dark:text-emerald-400" role="status">
                    Password updated successfully.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={changeLoading}
                  className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 text-white px-6 py-3 text-sm font-semibold shadow-lg shadow-brand-500/25 hover:opacity-95 disabled:opacity-60 transition-opacity"
                >
                  {changeLoading ? "Updating…" : "Update password"}
                </button>
              </form>
            </section>
          )}

          {showAddPasswordOnly && (
            <section className="glass rounded-3xl bg-white/80 dark:bg-slate-950/80 border border-slate-200/80 dark:border-slate-800/80 shadow-lg shadow-slate-900/5 p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-lg font-display font-semibold flex items-center gap-2">
                  <Lock className="w-5 h-5 text-brand-500" aria-hidden />
                  Add a password
                </h2>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Sign in with Google will still work. You&apos;ll confirm with Google, then set a password so you can
                  also sign in with email and password.
                </p>
              </div>

              <form onSubmit={handleAddPassword} className="space-y-4">
                <div>
                  <label htmlFor="add-new-password" className="text-sm font-medium">
                    New password
                  </label>
                  <input
                    id="add-new-password"
                    type="password"
                    autoComplete="new-password"
                    value={addNewPassword}
                    onChange={(e) => setAddNewPassword(e.target.value)}
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/60"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label htmlFor="add-confirm-password" className="text-sm font-medium">
                    Confirm new password
                  </label>
                  <input
                    id="add-confirm-password"
                    type="password"
                    autoComplete="new-password"
                    value={addConfirmPassword}
                    onChange={(e) => setAddConfirmPassword(e.target.value)}
                    className="mt-1.5 w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/60"
                    required
                    minLength={6}
                  />
                </div>

                {addError && (
                  <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                    {addError}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={addLoading}
                  className="w-full sm:w-auto rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 text-white px-6 py-3 text-sm font-semibold shadow-lg shadow-brand-500/25 hover:opacity-95 disabled:opacity-60 transition-opacity"
                >
                  {addLoading ? "Confirming…" : "Confirm with Google and add password"}
                </button>
              </form>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
