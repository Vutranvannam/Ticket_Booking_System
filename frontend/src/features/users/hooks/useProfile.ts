import { useEffect, useState, useCallback } from "react";
import { userService } from "../services/user.service";
import type { User } from "@/shared/types/user.type";

export function useProfile() {
  const [user, setUser]       = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      setUser(await userService.getMe());
    } catch (e: unknown) {
      setError((e as { message?: string })?.message ?? "L?i t?i h? so");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetch(); }, [fetch]);

  return { user, isLoading, error, refresh: fetch };
}
