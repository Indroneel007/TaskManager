"use client";

import { useEffect, useState } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { usePathname, useRouter } from "next/navigation";

async function getRole(user) {
  if (!user) return null;
  const res = await user.getIdTokenResult(true);
  return res.claims?.role || null;
}

export default function AuthGate({ children, requireRole }) {
  const router = useRouter();
  const pathname = usePathname();
  const [state, setState] = useState({ loading: true, user: null, role: null });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setState({ loading: false, user: null, role: null });
        const next = encodeURIComponent(pathname || "/");
        router.replace(`/signin?next=${next}`);
        return;
      }
      const role = await getRole(u);
      setState({ loading: false, user: u, role });
    });
    return () => unsub();
  }, [router, pathname]);

  if (state.loading) {
    return <div className="p-6 text-sm text-gray-500">Checking authentication...</div>;
  }

  if (!state.user) {
    return null; // redirected to /signin
  }

  if (requireRole && state.role !== requireRole) {
    return (
      <div className="p-6">
        <h2 className="text-lg font-semibold mb-2">Forbidden</h2>
        <p className="text-sm text-gray-600">You do not have access to this page.</p>
      </div>
    );
  }

  return <>{children}</>;
}
