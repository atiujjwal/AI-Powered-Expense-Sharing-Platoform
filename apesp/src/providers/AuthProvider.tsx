"use client";
import { ReactNode, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { meApi } from "../services/apiClient";
import { useStore } from "../store";

export default function AuthProvider({ children }: { children: ReactNode }) {
  const currentUser = useStore((s) => s.user);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Only attempt to fetch session if there is no user yet
    if (currentUser) {
      setLoading(false);
      return;
    }

    let mounted = true;
    (async () => {
      try {
        const user = await meApi();
        if (!mounted) return;
        if (user) {
          // set user in Zustand store
          useStore.setState({ user });
        }
      } catch (err) {
        // no-op: no session or unable to resume
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [currentUser]);

  return (
    <>
      {children}
      <Toaster position="top-right" />
    </>
  );
}
