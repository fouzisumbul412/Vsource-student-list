"use client";

import { useQuery } from "@tanstack/react-query";
import { AuthUser } from "@/types/auth";
import { authService } from "@/services/auth.service";

interface UseAuthResult {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  refresh: () => void;
}

export function useAuth(): UseAuthResult {
  const {
    data,
    error,
    isLoading,
    refetch: refresh,
  } = useQuery({
    queryKey: ["authUser"],
    queryFn: async () => {
      const res = await authService.me();
      return res.data.user;
    },
    retry: false,
  });

  return {
    user: data ?? null,
    loading: isLoading,
    error: error?.message ?? null,
    refresh,
  };
}
