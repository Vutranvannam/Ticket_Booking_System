import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, Music, Music2, Theater, Presentation, Trophy } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/shared/components/atoms/Button";
import { EventCard, type EventData } from "../components/EventCard";
import { useTheme } from "@/core/theme/ThemeProvider";


// Mock Data for UI presentation
const MOCK_CATEGORIES = [
  { id: "music", name: "Âm nhạc", icon: Music, count: 128, lightBg: "#2563eb", darkBg: "#1e3a8a", text: "text-white" },
  { id: "theater", name: "Sân khấu", icon: Theater, count: 45, lightBg: "#e11d48", darkBg: "#9f1239", text: "text-white" },
  { id: "seminar", name: "Hội thảo", icon: Presentation, count: 32, lightBg: "#d97706", darkBg: "#92400e", text: "text-white" },
  { id: "sports", name: "Thể thao", icon: Trophy, count: 24, lightBg: "#059669", darkBg: "#064e3b", text: "text-white" },
  { id: "other", name: "Khác", icon: Music2, count: 15, lightBg: "#475569", darkBg: "#334155", text: "text-white" },
];


const MOCK_EVENTS: EventData[] = [
  {
    id: "1",
    title: "THE ERAS TOUR - HO CHI MINH CITY",
    date: "15 Th12, 2026",
    time: "19:00",
    venue: "Sân vận động Quân khu 7, TP.HCM",
    price: "Từ 1.200.000đ",
    image: "https://picsum.photos/seed/event1/800/400",
    category: "Âm nhạc",
    interested: "2.5k",
    badge: "Sắp hết vé",
    badgeVariant: "danger" as const
  },
  {
    id: "2",
    title: "Vở Diễn Đêm Ngàn Sao",
    date: "20 Th12, 2026",
    time: "20:00",
    venue: "Nhà hát Thành phố, TP.HCM",
    price: "Từ 500.000đ",
    image: "https://picsum.photos/seed/event2/800/400",
    category: "Sân khấu",
    interested: "800",
    badge: "Bán chạy",
    badgeVariant: "warning" as const
  },
  {
    id: "3",
    title: "Giải Bóng Đá Tứ Hùng",
    date: "01 Th01, 2027",
    time: "17:00",
    venue: "Sân vận động Mỹ Đình, Hà Nội",
    price: "Từ 300.000đ",
    image: "https://picsum.photos/seed/event3/800/400",
    category: "Thể thao",
    interested: "1.2k"
  },
  {
    id: "4",
    title: "Tech Summit Vietnam 2026",
    date: "10 Th01, 2027",
    time: "08:00",
    venue: "Trung tâm Hội nghị Quốc gia, Hà Nội",
    price: "Từ 2.000.000đ",
    image: "https://picsum.photos/seed/event4/800/400",
    category: "Hội thảo",
    interested: "3k"
  }
];

const QUICK_FILTERS = [
  "Hôm nay", "Cuối tuần này", "Tuần tới", "Tại TP.HCM", "Tại Hà Nội"
];



export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const { theme } = useTheme();
  const isDark =
    theme === "dark" ||
    (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative w-full h-[460px] flex items-center justify-center overflow-hidden">
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat bg-slate-900"
          style={{ backgroundImage: "url('https://picsum.photos/seed/hero-concert/1920/1080')" }}
        >
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/60 to-surface backdrop-blur-[1px]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 w-full max-w-5xl mx-auto px-4 flex flex-col items-center text-center -mt-10">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight drop-shadow-md"
          >
            Sống trọn khoảnh khắc cùng <span className="text-primary-400">TicketHub</span>
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-lg md:text-xl text-slate-200 mb-8 max-w-2xl drop-shadow-sm"
          >
            Khám phá hàng ngàn sự kiện hấp dẫn, từ các buổi hòa nhạc đỉnh cao đến những trận đấu thể thao kịch tính.
          </motion.p>

          {/* Search Bar */}
          <motion.form
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onSubmit={handleSearch}
            className="w-full max-w-3xl flex flex-col sm:flex-row gap-2 bg-white/10 p-2 rounded-2xl backdrop-blur-md border border-white/20 shadow-lg mb-4"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted h-5 w-5" />
              <input
                type="text"
                placeholder="Tìm kiếm tên sự kiện, nghệ sĩ, địa điểm..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-12 pr-4 bg-surface rounded-xl outline-none focus:ring-2 focus:ring-primary-500 text-text-primary placeholder:text-text-muted shadow-inner"
              />
            </div>
            <Button type="submit" size="lg" className="h-12 px-8 rounded-xl shrink-0">
              Tìm vé ngay
            </Button>
          </motion.form>

          {/* Quick Filters */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-2"
          >
            {QUICK_FILTERS.map((filter) => (
              <button
                key={filter}
                className="px-4 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium border border-white/20 backdrop-blur-sm transition-colors"
              >
                {filter}
              </button>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-12 bg-surface">
        <div className="container mx-auto px-4 max-w-7xl">
          <h2 className="text-xl font-bold text-text-primary mb-6 text-center sm:text-left">Khám phá theo danh mục</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3 md:gap-4">
            {MOCK_CATEGORIES.map((cat, index) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                style={{ backgroundColor: isDark ? cat.darkBg : cat.lightBg }}
                className="p-5 rounded-xl cursor-pointer hover:scale-[1.02] transition-transform flex flex-col"
              >
                <cat.icon className="w-6 h-6 mb-3 text-white" />
                <span className="font-medium text-sm text-white">
                  {cat.name}
                </span>
                <span className="text-xs opacity-80 mt-0.5 text-white">
                  {cat.count} sự kiện
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events Section */}
      <section className="py-12 bg-background flex-1">
        <div className="container mx-auto px-4 max-w-7xl">
          <div className="flex items-end justify-between mb-8 border-b border-border pb-4">
            <div>
              <h2 className="text-2xl font-bold text-text-primary mb-1">Sự kiện nổi bật</h2>
              <p className="text-sm text-text-secondary hidden sm:block">Các sự kiện được quan tâm nhất hiện nay</p>
            </div>
            <Link to="/events" className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center gap-1 shrink-0 pb-1">
              Xem tất cả <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {MOCK_EVENTS.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
