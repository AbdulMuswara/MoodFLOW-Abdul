import { User, Settings, LogOut } from "lucide-react"
import Link from 'next/link';
import { useState, useEffect, useRef } from "react";
import { auth, db } from '@/lib/firebase';
import { 
    collection, 
    addDoc, 
    serverTimestamp, 
    doc, 
    getDoc 
  } from "firebase/firestore";

export default function AvatarDropdown({ 
    user,
    open, 
    setOpen,
    onLogout }: { 
        user: any,
        open: boolean, 
        setOpen: (prev: boolean) => void ,
        onLogout: () => void;
    }) {

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");

    useEffect(() => {
        const getCredentials = async () => {
            if (user) {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
            
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    setEmail(userData.email);
                    setUsername(userData.username);
                }
                }
        };

        getCredentials();
    }, [user]);

    const dropdownRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
          if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
          }
        }
      
        document.addEventListener("mousedown", handleClickOutside);
      
        return () => {
          document.removeEventListener("mousedown", handleClickOutside);
        };
    }, []);

    return (
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            {String(username)[0]}
          </button>

          { open && (
            <div className="absolute right-0 top-10 z-50 w-52 bg-white border border-gray-200 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{username}</p>
                <p className="text-xs text-gray-500 mt-0.5">{email}</p>
            </div>
      
            <Link href='/dashboard/profile'>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100">
                    <User className="w-4 h-4" />
                    Profile
                </button>
            </Link>

            <Link href="/settings">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100">
                <Settings className="w-4 h-4" />
                Settings
                </button>
            </Link>

            <button 
                onClick={onLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-gray-50"
            >
                <LogOut className="w-4 h-4" />
                Sign out
            </button>
          </div>
          )}

        </div>
    );
}