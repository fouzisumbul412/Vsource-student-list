"use client";

import { useEffect, useState } from "react";
import { AuthUser } from "@/types/auth";
import { authService } from "@/services/auth.service";

interface UseAuthResult {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    authService
      .me()
      .then((res) => {
        setUser(res.data.user);
        setError(null);
      })
      .catch((err) => {
        setUser(null);
        setError(err?.message ?? "Failed to load user");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  return { user, loading, error, refresh: load };
}
