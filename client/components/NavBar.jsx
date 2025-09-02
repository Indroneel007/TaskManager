"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

export default function NavBar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  return (
    <nav className="w-full border-b bg-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="font-semibold">ClientDriven</Link>
          <Link href="/blogs" className="text-sm text-gray-600 hover:underline">Blogs</Link>
          <Link href="/admin" className="text-sm text-gray-600 hover:underline">Admin</Link>
        </div>
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-gray-500 hidden sm:inline">{user.email}</span>
              <button
                onClick={() => signOut(auth)}
                className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 text-sm"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link href="/signin" className="px-3 py-1 rounded bg-black text-white text-sm">Sign in</Link>
          )}
        </div>
      </div>
    </nav>
  );
}
