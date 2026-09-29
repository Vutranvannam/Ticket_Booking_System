import React, { useState, useMemo, useCallback } from "react";
import {
  Compass,
  Layers,
  MapPin,
  Users,
  Ticket,
  Sparkles,
  Info,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import type { MapRegion, SeatingType } from "../types/venue-map.types";
import { MOCK_VENUE_MAP_LAYOUT } from "../mock/mockVenueMapData";
import { SvgPanZoomViewer } from "../components/map/SvgPanZoomViewer";

export const VenueMapViewerPage: React.FC = () => {
  const [selectedRegion, setSelectedRegion] = useState<MapRegion | null>(
    MOCK_VENUE_MAP_LAYOUT.regions[0] ?? null
  );
  const [hoveredRegion, setHoveredRegion] = useState<MapRegion | null>(null);
  type FilterType = "ALL" | SeatingType;
  const [typeFilter, setTypeFilter] = useState<FilterType>("ALL");

  const filteredRegions = useMemo(() => {
    if (typeFilter === "ALL") return MOCK_VENUE_MAP_LAYOUT.regions;
    return MOCK_VENUE_MAP_LAYOUT.regions.filter((r) => r.seatingType === typeFilter);
  }, [typeFilter]);

  const totalCapacity = useMemo(() => {
    return MOCK_VENUE_MAP_LAYOUT.regions.reduce(
      (sum, r) => sum + (typeof r.capacity === "number" ? r.capacity : 0),
      0
    );
  }, []);

  const handleSelectRegion = useCallback((region: MapRegion) => {
    setSelectedRegion(region);
  }, []);

  const handleHoverRegion = useCallback((region: MapRegion | null) => {
    setHoveredRegion(region);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background text-text-primary font-sans">
      {/* Sub-header / Breadcrumb Bar aligned with V1 */}
      <section className="border-b border-border bg-surface/60 backdrop-blur-md px-4 sm:px-6 lg:px-8 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <nav className="flex items-center gap-2 text-xs font-medium text-text-muted">
              <span className="hover:text-primary-600 transition-colors cursor-pointer">Trang chủ</span>
              <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
              <span className="hover:text-primary-600 transition-colors cursor-pointer">Địa điểm</span>
              <ChevronRight className="w-3.5 h-3.5 text-text-muted" />
              <span className="text-text-primary font-semibold">{MOCK_VENUE_MAP_LAYOUT.venueName}</span>
            </nav>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-text-primary flex items-center gap-2.5">
                <Compass className="w-7 h-7 text-primary-600 animate-pulse" />
                {MOCK_VENUE_MAP_LAYOUT.name}
              </h1>
              <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                Đang hoạt động
              </span>
            </div>
          </div>

          {/* Quick Metrics Bar styled with V1 tokens */}
          <div className="flex items-center gap-2.5 self-start md:self-auto">
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-1 border border-border shadow-sm text-xs">
              <Users className="w-4 h-4 text-primary-600" />
              <span className="text-text-secondary">Sức chứa:</span>
              <span className="font-bold text-text-primary">{totalCapacity.toLocaleString()} chỗ</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-surface-1 border border-border shadow-sm text-xs">
              <Layers className="w-4 h-4 text-indigo-500" />
              <span className="text-text-secondary">Phân khu:</span>
              <span className="font-bold text-text-primary">{MOCK_VENUE_MAP_LAYOUT.regions.length} khu</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Workspace Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive SVG Viewer (8 cols) */}
        <section className="lg:col-span-8 flex flex-col gap-3 min-h-[580px] h-[72vh]">
          {/* Filter Pills styled identically to V1 HomePage category chips */}
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-text-secondary">Lọc hiển thị:</span>
              <div className="flex items-center gap-1.5 p-1 bg-surface-1 border border-border rounded-xl text-xs">
                <button
                  type="button"
                  onClick={() => setTypeFilter("ALL")}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    typeFilter === "ALL"
                      ? "bg-primary-600 text-white shadow-sm"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-2"
                  }`}
                >
                  Tất cả ({MOCK_VENUE_MAP_LAYOUT.regions.length})
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter("STANDING")}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    typeFilter === "STANDING"
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-2"
                  }`}
                >
                  Khu Đứng (Standing)
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter("NUMBERED")}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    typeFilter === "NUMBERED"
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-2"
                  }`}
                >
                  Ghế Số (Numbered)
                </button>
                <button
                  type="button"
                  onClick={() => setTypeFilter("OPEN_SEATING")}
                  className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                    typeFilter === "OPEN_SEATING"
                      ? "bg-purple-600 text-white shadow-sm"
                      : "text-text-secondary hover:text-text-primary hover:bg-surface-2"
                  }`}
                >
                  Ngồi Tự Do
                </button>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs text-text-muted font-medium">
              <span>Lăn chuột để Zoom • Kéo để Di chuyển</span>
            </div>
          </div>

          {/* SVG Canvas Card with V1 Border & Shadow */}
          <div className="relative flex-1 rounded-2xl overflow-hidden shadow-card border border-border bg-slate-950">
            <SvgPanZoomViewer
              svgContent={MOCK_VENUE_MAP_LAYOUT.svgContent}
              regions={filteredRegions}
              selectedRegionId={selectedRegion?.id ?? null}
              onSelectRegion={handleSelectRegion}
              onHoverRegion={handleHoverRegion}
            />

            {/* Quick Helper Floating Pill */}
            <div className="absolute bottom-4 left-4 z-10 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-surface/90 backdrop-blur-md border border-border shadow-md text-xs text-text-secondary pointer-events-none">
              <Sparkles className="w-3.5 h-3.5 text-primary-600" />
              <span>Click trực tiếp vào phân khu trên sơ đồ để chọn</span>
            </div>
          </div>
        </section>

        {/* Right Column: Active Region Inspector & Quick-List (4 cols) */}
        <aside className="lg:col-span-4 flex flex-col gap-5">
          {/* Selected Region Card with V1 Card Tokens */}
          <div className="p-5 rounded-2xl bg-surface border border-border shadow-card flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-600" />
                <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary">
                  Thông tin phân khu
                </h2>
              </div>
              {selectedRegion && (
                <span
                  className="w-3.5 h-3.5 rounded-full border border-border shadow-sm ring-2 ring-primary-500/20"
                  style={{ backgroundColor: selectedRegion.colorCode || "#6366f1" }}
                />
              )}
            </div>

            {selectedRegion ? (
              <div className="space-y-4">
                <div>
                  <div className="text-xs font-medium text-text-muted">Tên phân khu</div>
                  <div className="text-lg font-bold text-text-primary mt-0.5">
                    {selectedRegion.name}
                  </div>
                  <div className="text-[11px] font-mono text-text-muted mt-0.5">
                    SVG Element: #{selectedRegion.svgElementId}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 rounded-xl bg-surface-1 border border-border">
                    <div className="text-[11px] text-text-muted flex items-center gap-1.5 font-medium">
                      <Users className="w-3.5 h-3.5 text-primary-600" />
                      Sức chứa
                    </div>
                    <div className="text-base font-bold text-text-primary mt-1">
                      {typeof selectedRegion.capacity === "number" ? (
                        <>
                          {selectedRegion.capacity.toLocaleString()}{" "}
                          <span className="text-xs font-normal text-text-secondary">chỗ</span>
                        </>
                      ) : (
                        <span className="text-xs text-text-muted font-normal">Khu kỹ thuật</span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-surface-1 border border-border">
                    <div className="text-[11px] text-text-muted flex items-center gap-1.5 font-medium">
                      <Ticket className="w-3.5 h-3.5 text-emerald-600" />
                      Loại chỗ
                    </div>
                    <div className="text-sm font-semibold text-text-primary mt-1">
                      {selectedRegion.seatingType === "STANDING"
                        ? "Đứng tự do"
                        : selectedRegion.seatingType === "NUMBERED"
                        ? "Ghế chỉ định"
                        : selectedRegion.seatingType === "OPEN_SEATING"
                        ? "Ngồi tự do"
                        : "Sân khấu"}
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-surface-1 border border-border space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-text-secondary">Giá vé tham chiếu:</span>
                    <span className="font-bold text-primary-600 text-sm">
                      {typeof selectedRegion.basePrice === "number"
                        ? `${selectedRegion.basePrice.toLocaleString()} đ`
                        : "Chưa cấu hình"}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-text-secondary">Trạng thái đồng bộ:</span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Khớp toạ độ SVG
                    </span>
                  </div>
                </div>

                {/* Primary Action Button using V1 Brand Styling */}
                <button
                  type="button"
                  disabled={selectedRegion.seatingType === "NONE"}
                  className="w-full py-2.5 px-4 rounded-xl font-semibold text-xs flex items-center justify-center gap-2 transition-all bg-primary-600 hover:bg-primary-700 active:scale-[0.98] text-white shadow-md shadow-primary-600/20 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {selectedRegion.seatingType === "NUMBERED" ? (
                    <>
                      <span>Quản lý sơ đồ ghế chi tiết (Tầng 2)</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </>
                  ) : selectedRegion.seatingType === "STANDING" ? (
                    <>
                      <span>Cấu hình cổng vào & sức chứa</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </>
                  ) : (
                    <span>Khu vực sân khấu (Không bán vé)</span>
                  )}
                </button>
              </div>
            ) : (
              <div className="py-12 flex flex-col items-center justify-center text-center text-text-muted gap-2">
                <Info className="w-8 h-8 text-text-muted" />
                <p className="text-xs">Chưa chọn phân khu nào.</p>
                <p className="text-[11px] text-text-muted">Click vào một khu vực trên sơ đồ SVG để xem chi tiết.</p>
              </div>
            )}
          </div>

          {/* Quick Regions List Styled with V1 Tokens */}
          <div className="p-4 rounded-2xl bg-surface border border-border shadow-card flex-1 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs font-semibold text-text-secondary">
              <span>Danh sách phân khu ({filteredRegions.length})</span>
              <span className="text-[11px] text-text-muted">Click chọn nhanh</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1 max-h-[260px] custom-scrollbar">
              {filteredRegions.map((r) => {
                const isSelected = selectedRegion?.id === r.id;
                const isHovered = hoveredRegion?.id === r.id;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => handleSelectRegion(r)}
                    onMouseEnter={() => handleHoverRegion(r)}
                    onMouseLeave={() => handleHoverRegion(null)}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? "bg-primary-50 dark:bg-primary-950/40 border-primary-500 shadow-sm ring-1 ring-primary-500/30"
                        : isHovered
                        ? "bg-surface-2 border-border-hover"
                        : "bg-surface-1 border-border hover:bg-surface-2"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: r.colorCode || "#6366f1" }}
                      />
                      <div>
                        <div className="text-xs font-semibold text-text-primary">{r.name}</div>
                        <div className="text-[10px] text-text-muted font-mono">#{r.svgElementId}</div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs font-bold text-text-primary">
                        {typeof r.capacity === "number" ? (
                          <>
                            {r.capacity.toLocaleString()}{" "}
                            <span className="text-[10px] font-normal text-text-secondary">chỗ</span>
                          </>
                        ) : (
                          <span className="text-[10px] font-normal text-text-muted">Sân khấu</span>
                        )}
                      </div>
                      <div className="text-[10px] text-text-muted font-medium">
                        {r.seatingType === "STANDING"
                          ? "Đứng"
                          : r.seatingType === "NUMBERED"
                          ? "Ghế số"
                          : r.seatingType === "OPEN_SEATING"
                          ? "Ngồi tự do"
                          : "Kỹ thuật"}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </aside>
      </main>
    </div>
  );
};
