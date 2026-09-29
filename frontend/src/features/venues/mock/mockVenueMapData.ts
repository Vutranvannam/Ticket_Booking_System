import type { VenueMapDetail, MapRegion } from "../types/venue-map.types";

export const MOCK_RAW_SVG_STRING = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 700" width="100%" height="100%">
  <defs>
    <clipPath id="arenaClip">
      <rect x="10" y="10" width="980" height="680" rx="28" />
    </clipPath>
    <linearGradient id="vignette" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#020617" stop-opacity="0.94" />
      <stop offset="35%" stop-color="#0b132b" stop-opacity="0.75" />
      <stop offset="70%" stop-color="#0b132b" stop-opacity="0.75" />
      <stop offset="100%" stop-color="#020617" stop-opacity="0.95" />
    </linearGradient>
    <linearGradient id="stageGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#334155" />
      <stop offset="100%" stop-color="#1e293b" />
    </linearGradient>
  </defs>

  <!-- NỀN SÂN VẬN ĐỘNG (Stadium Photo & Architectural Arena Field) -->
  <g id="stadium-backdrop" clip-path="url(#arenaClip)" pointer-events="none">
    <rect x="10" y="10" width="980" height="680" rx="28" fill="#020617" stroke="#334155" stroke-width="2"/>
    <image href="https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?auto=format&fit=crop&w=1200&q=80"
           x="10" y="10" width="980" height="680" preserveAspectRatio="xMidYMid slice" opacity="0.45" />
    <rect x="10" y="10" width="980" height="680" fill="url(#vignette)" />

    <!-- Đường line sân vận động kiến trúc -->
    <ellipse cx="500" cy="400" rx="430" ry="250" fill="none" stroke="#475569" stroke-width="1.5" stroke-dasharray="10 8" opacity="0.5"/>
    <ellipse cx="500" cy="400" rx="280" ry="160" fill="none" stroke="#334155" stroke-width="1.5" opacity="0.6"/>
    <ellipse cx="500" cy="400" rx="60" ry="60" fill="none" stroke="#334155" stroke-width="1.5" opacity="0.5"/>
    <line x1="500" y1="180" x2="500" y2="620" stroke="#334155" stroke-width="1.5" stroke-dasharray="6 6" opacity="0.4"/>
  </g>

  <!-- 1. SÂN KHẤU CHÍNH (STAGE) -->
  <g id="region-none-stage" cursor="pointer">
    <path d="M 300 70 L 700 70 L 660 170 L 340 170 Z" fill="url(#stageGrad)" stroke="#64748b" stroke-width="2"/>
    <!-- Stage lighting line -->
    <line x1="330" y1="80" x2="670" y2="80" stroke="#38bdf8" stroke-width="3" opacity="0.8"/>
    <!-- Text Badge -->
    <rect x="360" y="102" width="280" height="38" rx="8" fill="#0f172a" fill-opacity="0.85" stroke="#475569" stroke-width="1" />
    <text x="500" y="127" fill="#ffffff" font-size="15" font-weight="700" text-anchor="middle" font-family="'Inter', system-ui, sans-serif" letter-spacing="2">SÂN KHẤU CHÍNH (STAGE)</text>
  </g>

  <!-- 2. KHU ĐỨNG FAN ZONE (STANDING - GA) -->
  <g id="region-standing-fanzone" cursor="pointer">
    <rect x="280" y="210" width="440" height="155" rx="16" fill="#ec4899" fill-opacity="0.45" stroke="#f472b6" stroke-width="2.5"/>
    <!-- Label Pill Badge: High Contrast Solid Background -->
    <rect x="340" y="245" width="320" height="44" rx="10" fill="#831843" fill-opacity="0.95" stroke="#f472b6" stroke-width="1.5" />
    <text x="500" y="273" fill="#ffffff" font-size="16" font-weight="800" text-anchor="middle" font-family="'Inter', system-ui, sans-serif" letter-spacing="0.5">FAN ZONE (ĐỨNG GA)</text>
    <text x="500" y="325" fill="#fce7f3" font-size="13" font-weight="600" text-anchor="middle" font-family="'Inter', system-ui, sans-serif">Sức chứa: 2.500 chỗ • Giá từ 1.800.000 đ</text>
  </g>

  <!-- 3. KHÁN ĐÀI A - VIP SEATED (CÓ GHẾ NGỒI SỐ) -->
  <g id="region-seated-stand-a" cursor="pointer">
    <path d="M 240 405 L 760 405 L 720 535 L 280 535 Z" fill="#eab308" fill-opacity="0.4" stroke="#facc15" stroke-width="2.5"/>
    <!-- Label Pill Badge: High Contrast Solid Background -->
    <rect x="320" y="435" width="360" height="46" rx="10" fill="#713f12" fill-opacity="0.95" stroke="#facc15" stroke-width="1.5" />
    <text x="500" y="464" fill="#ffffff" font-size="16" font-weight="800" text-anchor="middle" font-family="'Inter', system-ui, sans-serif" letter-spacing="0.5">KHÁN ĐÀI A (VIP SEATED)</text>
    <text x="500" y="508" fill="#fef9c3" font-size="13" font-weight="600" text-anchor="middle" font-family="'Inter', system-ui, sans-serif">850 ghế số • Giá từ 2.500.000 đ</text>
  </g>

  <!-- 4. KHÁN ĐÀI B - CÁNH TÂY (CÓ GHẾ NGỒI SỐ) -->
  <g id="region-seated-stand-b" cursor="pointer">
    <path d="M 80 215 L 245 195 L 225 470 L 80 500 Z" fill="#3b82f6" fill-opacity="0.4" stroke="#60a5fa" stroke-width="2.5"/>
    <!-- Label Pill Badge: High Contrast Solid Background -->
    <rect x="95" y="325" width="135" height="54" rx="10" fill="#1e3a8a" fill-opacity="0.95" stroke="#60a5fa" stroke-width="1.5" />
    <text x="162" y="350" fill="#ffffff" font-size="14" font-weight="800" text-anchor="middle" font-family="'Inter', system-ui, sans-serif">KHÁN ĐÀI B</text>
    <text x="162" y="369" fill="#dbeafe" font-size="12" font-weight="600" text-anchor="middle" font-family="'Inter', system-ui, sans-serif">620 ghế số</text>
  </g>

  <!-- 5. KHÁN ĐÀI C - CÁNH ĐÔNG (CÓ GHẾ NGỒI SỐ) -->
  <g id="region-seated-stand-c" cursor="pointer">
    <path d="M 755 195 L 920 215 L 920 500 L 775 470 Z" fill="#10b981" fill-opacity="0.4" stroke="#34d399" stroke-width="2.5"/>
    <!-- Label Pill Badge: High Contrast Solid Background -->
    <rect x="770" y="325" width="135" height="54" rx="10" fill="#064e3b" fill-opacity="0.95" stroke="#34d399" stroke-width="1.5" />
    <text x="838" y="350" fill="#ffffff" font-size="14" font-weight="800" text-anchor="middle" font-family="'Inter', system-ui, sans-serif">KHÁN ĐÀI C</text>
    <text x="838" y="369" fill="#d1fae5" font-size="12" font-weight="600" text-anchor="middle" font-family="'Inter', system-ui, sans-serif">620 ghế số</text>
  </g>

  <!-- 6. KHÁN ĐÀI TẦNG 2 - BALCONY (NGỒI TỰ DO) -->
  <g id="region-arena-balcony" cursor="pointer">
    <path d="M 210 565 L 790 565 L 760 635 L 240 635 Z" fill="#8b5cf6" fill-opacity="0.4" stroke="#a78bfa" stroke-width="2.5"/>
    <!-- Label Pill Badge: High Contrast Solid Background -->
    <rect x="330" y="578" width="340" height="42" rx="10" fill="#4c1d95" fill-opacity="0.95" stroke="#a78bfa" stroke-width="1.5" />
    <text x="500" y="604" fill="#ffffff" font-size="15" font-weight="800" text-anchor="middle" font-family="'Inter', system-ui, sans-serif" letter-spacing="0.5">KHÁN ĐÀI TẦNG 2 (BALCONY)</text>
  </g>

  <!-- Lối đi kỹ thuật -->
  <line id="aisle-left" x1="260" y1="205" x2="260" y2="535" stroke="#64748b" stroke-width="2" stroke-dasharray="6 6" opacity="0.6"/>
  <line id="aisle-right" x1="740" y1="205" x2="740" y2="535" stroke="#64748b" stroke-width="2" stroke-dasharray="6 6" opacity="0.6"/>
</svg>`;

export const MOCK_MAP_REGIONS: MapRegion[] = [
  {
    id: "reg-001",
    venueMapId: "map-demo-01",
    name: "Sân khấu biểu diễn chính",
    svgElementId: "region-none-stage",
    seatingType: "NONE",
    capacity: null,
    colorCode: "#64748b",
    isBookable: false,
    hasSeatMap: false,
  },
  {
    id: "reg-002",
    venueMapId: "map-demo-01",
    name: "Fan Zone (Khu đứng GA)",
    svgElementId: "region-standing-fanzone",
    seatingType: "STANDING",
    capacity: 2500,
    basePrice: 1800000,
    colorCode: "#ec4899",
    isBookable: true,
    hasSeatMap: false,
  },
  {
    id: "reg-003",
    venueMapId: "map-demo-01",
    name: "Khán đài A (VIP Seated)",
    svgElementId: "region-seated-stand-a",
    seatingType: "NUMBERED",
    capacity: 850,
    basePrice: 2500000,
    colorCode: "#eab308",
    isBookable: true,
    hasSeatMap: true,
  },
  {
    id: "reg-004",
    venueMapId: "map-demo-01",
    name: "Khán đài B (Cánh Tây)",
    svgElementId: "region-seated-stand-b",
    seatingType: "NUMBERED",
    capacity: 620,
    basePrice: 1200000,
    colorCode: "#3b82f6",
    isBookable: true,
    hasSeatMap: true,
  },
  {
    id: "reg-005",
    venueMapId: "map-demo-01",
    name: "Khán đài C (Cánh Đông)",
    svgElementId: "region-seated-stand-c",
    seatingType: "NUMBERED",
    capacity: 620,
    basePrice: 1200000,
    colorCode: "#10b981",
    isBookable: true,
    hasSeatMap: true,
  },
  {
    id: "reg-006",
    venueMapId: "map-demo-01",
    name: "Khán đài Tầng 2 (Balcony)",
    svgElementId: "region-arena-balcony",
    seatingType: "OPEN_SEATING",
    capacity: 1200,
    basePrice: 800000,
    colorCode: "#8b5cf6",
    isBookable: true,
    hasSeatMap: false,
  },
];

export const MOCK_VENUE_MAP_LAYOUT: VenueMapDetail = {
  id: "map-demo-01",
  venueId: "venue-hn-mydinh",
  venueName: "Sân Vận Động Quốc Gia Mỹ Đình",
  name: "Sơ Đồ Tour Diễn Quốc Tế 2026",
  version: 1,
  status: "PUBLISHED",
  visibility: "PUBLIC",
  viewBox: "0 0 1000 700",
  createdAt: "2026-09-29T10:00:00Z",
  updatedAt: "2026-09-29T10:00:00Z",
  svgContent: MOCK_RAW_SVG_STRING,
  regions: MOCK_MAP_REGIONS,
  metadata: {
    venueType: "STADIUM",
    address: "Đường Lê Đức Thọ, Mỹ Đình, Nam Từ Liêm, Hà Nội",
    designer: "TicketHub Technical Team",
  },
};
