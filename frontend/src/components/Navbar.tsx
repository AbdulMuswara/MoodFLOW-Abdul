"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { useRouter } from 'next/navigation';
import AvatarDropdown from './AvatarDropdown';

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between glass rounded-2xl px-6 py-3">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">
              M
            </div>
            <span className="font-display font-bold text-xl tracking-tight">MoodFLOW</span>
          </Link>
        </div>

        {user ? (
            <div className="flex items-center gap-3">
              <AvatarDropdown user={user} open={open} setOpen={setOpen} onLogout={handleSignOut} />
            </div>
        ) : (
          <>
            <div className="hidden md:flex items-center gap-8 text-slate-600 dark:text-slate-300 font-medium">
              <Link href="/#features" className="hover:text-brand-600 transition-colors">Features</Link>
              <Link href="/#how-it-works" className="hover:text-brand-600 transition-colors">How it works</Link>
            </div>

            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="px-5 py-2 text-sm font-semibold text-white bg-brand-600 hover:bg-brand-500 rounded-xl shadow-lg shadow-brand-600/20 transition-all active:scale-95"
              >
                Get Started
              </Link>
            </div>
          </>
        )}
      </div>
    </nav>
  );
}