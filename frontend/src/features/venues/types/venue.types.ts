export type VenueVisibility = "PUBLIC" | "PRIVATE";

export interface Venue {
  id: string;
  createdBy?: string | null;
  name: string;
  address: string;
  city: string;
  state?: string | null;
  country: string;
  zipCode?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string | null;
  email?: string | null;
  description?: string | null;
  visibility: VenueVisibility;
  active: boolean;
  isActive?: boolean;
  version: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVenueRequest {
  name: string;
  address: string;
  city: string;
  state?: string;
  country: string;
  zipCode?: string;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string;
  email?: string;
  description?: string;
  visibility?: VenueVisibility;
}

export interface UpdateVenueRequest {
  name?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  latitude?: number | null;
  longitude?: number | null;
  phone?: string;
  email?: string;
  description?: string;
  visibility?: VenueVisibility;
}

export interface VenueSummary {
  id: string;
  name: string;
  city: string;
  state?: string | null;
  country: string;
  visibility: VenueVisibility;
  active: boolean;
  isActive?: boolean;
}

export interface VenueListParams {
  page?: number;
  size?: number;
  city?: string;
  visibility?: VenueVisibility;
}

/**
 * Pagination response matching backend PageResponse<T>
 * Source of truth: com.phuc.ticketbooking.common.dto.PageResponse
 */
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}
