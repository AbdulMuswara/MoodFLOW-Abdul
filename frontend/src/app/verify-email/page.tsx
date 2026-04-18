"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import { auth } from "../../lib/firebase";
import { sendEmailVerification } from "firebase/auth";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  async function handleResend() {
    setMessage(null);
    setError(null);
    setSending(true);

    try {
      if (!auth.currentUser) {
        setError("Please sign in again before requesting another verification email.");
        return;
      }

      await sendEmailVerification(auth.currentUser);
      setMessage("Verification email sent again. Please check your inbox.");
    } catch (err: any) {
      setError(err.message || "Failed to resend verification email.");
    } finally {
      setSending(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f8fb] text-slate-900 flex items-center justify-center px-6 py-16">
      <div className="w-full max-w-xl rounded-[32px] bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] border border-slate-100 px-8 py-10">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 text-center">
          Verify your email
        </h1>

        <p className="mt-4 text-center text-slate-600">
          We sent a verification email
          {email ? (
            <>
              {" "}to <span className="font-semibold">{email}</span>
            </>
          ) : null}
          . Please click the link in that email before signing in.
        </p>

        <div className="mt-8 space-y-4">
          <button
            type="button"
            onClick={handleResend}
            disabled={sending}
            className="w-full rounded-2xl bg-gradient-to-r from-violet-600 to-fuchsia-500 py-4 text-white font-semibold text-lg"
          >
            {sending ? "Sending..." : "Resend verification email"}
          </button>

          <Link
            href="/login"
            className="block w-full text-center rounded-2xl border border-slate-200 bg-white py-4 text-slate-700 font-medium hover:bg-slate-50 transition"
          >
            Back to sign in
          </Link>
        </div>

        {message && (
          <p className="mt-5 text-sm text-emerald-600 font-medium text-center">
            {message}
          </p>
        )}

        {error && (
          <p className="mt-5 text-sm text-red-500 font-medium text-center">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen bg-[#f8f8fb] flex items-center justify-center">
        <p className="text-slate-500 text-lg">Loading...</p>
      </main>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}