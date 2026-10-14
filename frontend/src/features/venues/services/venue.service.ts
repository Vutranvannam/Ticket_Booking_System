import { privateGet, privatePost, privatePut, privateDelete } from "@/core/api/client/privateClient";
import { VENUE_ENDPOINTS } from "@/core/api/endpoints";
import type { PageResponse } from "@/core/types/api";
import type {
  Venue,
  VenueSummary,
  CreateVenueRequest,
  UpdateVenueRequest,
  VenueListParams,
} from "../types/venue.types";

export const venueService = {
  getVenues(params?: VenueListParams): Promise<PageResponse<VenueSummary>> {
    return privateGet<PageResponse<VenueSummary>>(VENUE_ENDPOINTS.LIST, { params });
  },

  getVenueById(id: string): Promise<Venue> {
    return privateGet<Venue>(VENUE_ENDPOINTS.DETAIL(id));
  },

  createVenue(data: CreateVenueRequest): Promise<Venue> {
    return privatePost<Venue>(VENUE_ENDPOINTS.CREATE, data);
  },

  updateVenue(id: string, data: UpdateVenueRequest): Promise<Venue> {
    return privatePut<Venue>(VENUE_ENDPOINTS.UPDATE(id), data);
  },

  deleteVenue(id: string): Promise<void> {
    return privateDelete<void>(VENUE_ENDPOINTS.DELETE(id));
  },
};
