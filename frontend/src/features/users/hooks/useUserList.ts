import { useEffect, useState, useCallback } from "react";
import { userService } from "../services/user.service";
import type { User } from "@/shared/types/user.type";
import type { PaginatedResponse } from "@/core/types/api";
import type { UserListParams } from "../types/user.types";

export function useUserList() {
  const [data, setData]       = useState<PaginatedResponse<User> | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [params, setParams]   = useState<UserListParams>({ page: 0, size: 10 });

  const fetch = useCallback(async () => {
    setLoading(true);
    try { setData(await userService.listUsers(params)); }
    catch (e: unknown) { setError((e as { message?: string })?.message ?? "L?i t?i danh s�ch"); }
    finally { setLoading(false); }
  }, [params]);

  useEffect(() => { fetch(); }, [fetch]);

  const updateParams = (p: Partial<UserListParams>) =>
    setParams((prev) => ({ ...prev, ...p, page: p.page ?? 0 }));

  return { data, isLoading, error, params, updateParams, refresh: fetch };
}
