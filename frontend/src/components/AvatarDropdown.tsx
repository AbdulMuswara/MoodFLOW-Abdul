"use client"
import { User, Settings, LogOut, LayoutDashboard } from "lucide-react"
import Link from 'next/link';
import { useState, useEffect, useRef } from "react";
import { db } from '@/lib/firebase';
import { 
    doc, 
    getDoc 
  } from "firebase/firestore";
import { usePathname } from 'next/navigation'


export default function AvatarDropdown({ 
    user,
    open, 
    setOpen,
    onLogout }: { 
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        user: any,
        open: boolean, 
        setOpen: (prev: boolean) => void ,
        onLogout: () => void,
    }) {

    const pathname = usePathname();
    const page = pathname.split('/').filter(Boolean).pop();

    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [profilePicture, setProfilePicture] = useState<string | null>(null);

    useEffect(() => {
        const getCredentials = async () => {
            if (user) {
                const docRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(docRef);
            
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    setEmail(userData.email);
                    setUsername(userData.username);
                    setProfilePicture(userData.profilePicture ?? null);
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
    }, [setOpen]);

    const rows = [
        {
            "page": "dashboard",
            "href": "/dashboard",
            "name": "Dashboard",
            "icon": LayoutDashboard
        },
        {
            "page": "profile",
            "href": "/dashboard/profile",
            "name": "Profile",
            "icon": User
        },
        {
            "page": "settings",
            "href": "/settings",
            "name": "Settings",
            "icon": Settings
        },
    ];

    return (
        <div ref={dropdownRef} className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            {profilePicture ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profilePicture}
                alt="avatar"
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              String(username)[0]
            )}
          </button>

          { open && (
            <div className="absolute right-0 top-10 z-50 w-52 bg-white border border-gray-200 rounded-xl overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{username}</p>
                <p className="text-xs text-gray-500 mt-0.5">{email}</p>
            </div>

            {rows.filter((row) => row.page !== page)
            .map((row) => {
                const Icon = row.icon

                return (
                <Link key={row.page} href={row.href}>
                    <button className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 border-b border-gray-100">
                    <Icon className="w-4 h-4" />
                    {row.name}
                    </button>
                </Link>
                )
            })}

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