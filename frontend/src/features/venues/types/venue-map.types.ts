/**
 * Types & Domain Models for Venue Overview Map & Regions
 * Aligned with v2_venue_implementation_plan.md and Backend V2 Schema
 */

export type Visibility = "PUBLIC" | "PRIVATE";

export type MapStatus = "DRAFT" | "PUBLISHED" | "ARCHIVED";

export type SeatingType = "STANDING" | "NUMBERED" | "OPEN_SEATING" | "NONE";

export type RegionTypeCode =
  | "STAND"
  | "STAGE"
  | "AISLE"
  | "BALCONY"
  | "VIP_LOUNGE"
  | "GA"
  | "OTHER";

export interface RegionType {
  id: string;
  code: RegionTypeCode;
  name: string;
  description?: string;
  defaultColor: string;
  hasSeats: boolean;
}

export interface VenueMap {
  id: string;
  venueId: string;
  name: string;
  version: number;
  status: MapStatus;
  visibility: Visibility;
  viewBox: string;
  svgContent?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface MapRegion {
  id: string;
  venueMapId: string;
  regionTypeId?: string;
  name: string;
  svgElementId: string;
  seatingType: SeatingType;
  capacity: number | null;
  basePrice?: number | null;
  colorCode: string;
  isBookable: boolean;
  hasSeatMap: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/** Composite DTO for Frontend Map Viewers */
export interface VenueMapDetail extends VenueMap {
  venueName?: string;
  regions: MapRegion[];
  svgContent: string;
  metadata?: Record<string, any>;
}

export interface VenueMapLayoutResponse {
  map: VenueMap;
  regions: MapRegion[];
  svgContent: string;
}

export interface VenueMapSummary {
  id: string;
  venueId: string;
  name: string;
  version: number;
  status: MapStatus;
  visibility: Visibility;
  totalRegions: number;
  totalCapacity: number;
  createdAt: string;
  updatedAt: string;
}

export interface ImportVenueMapRequest {
  name: string;
  file: File;
}

export interface UpdateRegionRequest {
  name?: string;
  colorCode?: string;
  capacity?: number;
  basePrice?: number;
  isBookable?: boolean;
}

/** Báo cáo kiểm tra trước bóc tách file SVG ở phía client */
export interface RegionPreParseItem {
  svgElementId: string;
  inferredName: string;
  seatingType: SeatingType;
  defaultColor: string;
  isValid: boolean;
  warning?: string;
}

export interface SvgPreParseReport {
  isValid: boolean;
  viewBox: string | null;
  totalDetected: number;
  regions: RegionPreParseItem[];
  warnings: string[];
}
