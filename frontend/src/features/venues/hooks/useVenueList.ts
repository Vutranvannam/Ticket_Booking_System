import { useEffect, useState, useCallback } from "react";
import { venueService } from "../services/venue.service";
import type { VenueSummary, VenueListParams } from "../types/venue.types";
import type { PageResponse } from "@/core/types/api";

export function useVenueList() {
  const [data, setData] = useState<PageResponse<VenueSummary> | null>(null);
  const [isLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [params, setParams] = useState<VenueListParams>({ page: 0, size: 10 });

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await venueService.getVenues(params);
      setData(response);
    } catch (e: unknown) {
      setError((e as { message?: string })?.message ?? "Không thể tải danh sách địa điểm");
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  const updateParams = (p: Partial<VenueListParams>) => {
    setParams((prev) => ({
      ...prev,
      ...p,
      page: p.page !== undefined ? p.page : 0,
    }));
  };

  return { data, isLoading, error, params, updateParams, refresh: fetch };
}
