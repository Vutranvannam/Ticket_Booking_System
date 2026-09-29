import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { MapRegion } from "../../types/venue-map.types";
import { Users, Armchair, AlertCircle, ArrowUpRight, Ticket } from "lucide-react";

interface RegionInfoPopoverProps {
  region: MapRegion | null;
  position: { x: number; y: number } | null;
  containerRect?: DOMRect | null;
}

export const RegionInfoPopover: React.FC<RegionInfoPopoverProps> = ({
  region,
  position,
}) => {
  if (!region || !position) return null;

  const getBadgeConfig = () => {
    switch (region.seatingType) {
      case "STANDING":
        return {
          label: "Khu Đứng (GA)",
          bgColor: "bg-pink-500/15 border-pink-500/30 text-pink-300",
          icon: Users,
        };
      case "NUMBERED":
        return {
          label: "Ghế Ngồi Số",
          bgColor: "bg-indigo-500/15 border-indigo-500/30 text-indigo-300",
          icon: Armchair,
        };
      case "OPEN_SEATING":
        return {
          label: "Ngồi Tự Do",
          bgColor: "bg-purple-500/15 border-purple-500/30 text-purple-300",
          icon: Ticket,
        };
      case "NONE":
      default:
        return {
          label: "Sân Khấu / Kỹ Thuật",
          bgColor: "bg-slate-500/15 border-slate-500/30 text-slate-400",
          icon: AlertCircle,
        };
    }
  };

  const badge = getBadgeConfig();
  const Icon = badge.icon;

  const offsetX = 16;
  const offsetY = -16;

  return (
    <AnimatePresence>
      <motion.div
        key={region.id}
        initial={{ opacity: 0, scale: 0.92, y: 6 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 6 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
        style={{
          left: `${position.x + offsetX}px`,
          top: `${position.y + offsetY}px`,
        }}
        className="pointer-events-none absolute z-30 min-w-[220px] max-w-[300px] p-3 rounded-2xl backdrop-blur-xl bg-slate-900/90 border border-slate-700/70 shadow-2xl text-slate-100 text-xs select-none"
      >
        <div className="flex items-center gap-2 mb-1.5">
          <span
            className="w-3 h-3 rounded-full flex-shrink-0 shadow-sm ring-1 ring-white/20"
            style={{ backgroundColor: region.colorCode || "#94a3b8" }}
          />
          <h4 className="font-bold text-sm text-slate-100 truncate flex-1">
            {region.name}
          </h4>
        </div>

        <div className="flex items-center gap-2 mb-2">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium ${badge.bgColor}`}
          >
            <Icon className="w-3 h-3" />
            {badge.label}
          </span>

          {region.hasSeatMap && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-[10px] font-semibold">
              Đã có sơ đồ ghế
            </span>
          )}
        </div>

        <div className="flex items-center justify-between text-slate-400 py-1 border-t border-slate-800">
          <span>Sức chứa dự kiến:</span>
          <span className="font-semibold text-slate-200 tabular-nums">
            {typeof region.capacity === "number"
              ? `${region.capacity.toLocaleString()} ${
                  region.seatingType === "NUMBERED" ? "ghế" : "vé"
                }`
              : "Không mở bán"}
          </span>
        </div>

        {region.seatingType === "NUMBERED" && (
          <div className="mt-1.5 pt-1 border-t border-slate-800/80 flex items-center justify-between text-sky-400 font-medium text-[11px]">
            <span>Click để chọn phân khu</span>
            <ArrowUpRight className="w-3 h-3" />
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};
