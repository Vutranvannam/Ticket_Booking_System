import { SearchField } from "@/shared/components/molecules/SearchField";
import { Select } from "@/shared/components/atoms/Select";
import type { VenueVisibility } from "../types/venue.types";

interface VenueFilterBarProps {
  city: string;
  visibility?: VenueVisibility | "";
  onCityChange: (city: string) => void;
  onVisibilityChange: (visibility: VenueVisibility | "") => void;
}

export function VenueFilterBar({
  city,
  visibility,
  onCityChange,
  onVisibilityChange,
}: VenueFilterBarProps) {
  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-surface p-3 rounded-xl border border-border shadow-xs">
      <div className="flex-1">
        <SearchField
          value={city}
          onChange={onCityChange}
          placeholder="Lọc theo thành phố (Hà Nội, TP.HCM...)"
          className="w-full"
        />
      </div>
      <div className="w-full sm:w-56">
        <Select
          value={visibility ?? ""}
          onChange={(e) => onVisibilityChange(e.target.value as VenueVisibility | "")}
          options={[
            { value: "", label: "Tất cả phạm vi" },
            { value: "PUBLIC", label: "PUBLIC (Công khai)" },
            { value: "PRIVATE", label: "PRIVATE (Riêng tư)" },
          ]}
        />
      </div>
    </div>
  );
}
