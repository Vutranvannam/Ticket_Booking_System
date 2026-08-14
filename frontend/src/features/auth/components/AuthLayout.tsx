import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { Ticket, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "@/shared/components/molecules/ThemeToggle";

interface AuthLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Left Panel - Image Banner (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 relative bg-surface-1 overflow-hidden">
        {/* Absolute Logo on top left */}
        <Link to="/" className="absolute top-8 left-8 z-20 flex items-center gap-2 text-xl font-bold text-white hover:text-indigo-200 transition-colors drop-shadow-md">
          <Ticket className="h-6 w-6" />
          TicketHub
        </Link>

        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1080&auto=format&fit=crop')" }}
        />
        {/* Overlay gradient: lighter at the top to reveal concert lights */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/50 to-transparent" />
        <div className="absolute inset-0 bg-indigo-900/10 mix-blend-overlay" />

        {/* Content top-aligned with fixed padding */}
        <div className="relative z-10 pt-40 pb-12 px-12 lg:px-16 flex flex-col w-full h-full">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-xl bg-indigo-600/90 backdrop-blur-md mb-8 shadow-2xl shadow-indigo-600/40 border border-indigo-400/50 transition-transform hover:-translate-y-1 hover:shadow-indigo-600/60 duration-300">
            <Ticket className="text-white h-8 w-8 drop-shadow-md" />
          </div>

          <h2 className="text-4xl lg:text-5xl font-extrabold text-white mb-6 drop-shadow-lg leading-[1.15] tracking-tight max-w-lg text-left">
            Sống trọn <br className="hidden xl:block" />khoảnh khắc cùng
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-300 via-purple-300 to-indigo-100">
              TicketHub
            </span>
          </h2>

          <p className="text-lg text-indigo-100/90 font-medium leading-relaxed max-w-md text-left">
            <span className="text-white font-semibold">Săn vé dễ dàng</span>, tham gia những <span className="text-indigo-300 font-semibold">sự kiện đỉnh cao</span> và lưu giữ những trải nghiệm <span className="text-white font-semibold">không thể nào quên</span>.
          </p>

          {/* Stats Section */}
          <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-3 gap-6 max-w-lg">
            <div>
              <p className="text-3xl font-extrabold text-white">500K+</p>
              <p className="text-sm font-medium text-indigo-200/80 mt-1">Vé đã bán</p>
            </div>
            <div className="border-l border-white/10 pl-6">
              <p className="text-3xl font-extrabold text-white">10K+</p>
              <p className="text-sm font-medium text-indigo-200/80 mt-1">Sự kiện</p>
            </div>
            <div className="border-l border-white/10 pl-6">
              <p className="text-3xl font-extrabold text-white">4.8★</p>
              <p className="text-sm font-medium text-indigo-200/80 mt-1">Đánh giá</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Form Container */}
      <div className="flex-1 flex flex-col relative px-4 sm:px-12 lg:px-24 pt-40 pb-8 bg-surface">
        <div className="absolute top-6 right-6 lg:top-8 lg:right-8 z-50">
          <ThemeToggle />
        </div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="w-full max-w-md mx-auto flex-1 flex flex-col"
        >
          {/* Mobile Logo */}
          <div className="mb-8 flex flex-col items-center lg:hidden">
            <Ticket className="text-primary-600 h-10 w-10" />
            <h1 className="mt-2 text-2xl font-bold text-text-primary">TicketHub</h1>
          </div>

          <div className="mb-10">
            {title && (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-1 border border-border text-primary-600 dark:text-primary-400 text-[13px] font-semibold mb-4 shadow-sm">
                <Sparkles className="w-4 h-4" />
                <span>{title === 'Đăng nhập' ? 'Chào mừng trở lại' : 'Bắt đầu hành trình mới'}</span>
              </div>
            )}
            {title && (
              <h2 className="text-3xl lg:text-[34px] font-extrabold text-text-primary tracking-tight">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-3.5 text-[15px] text-text-secondary font-medium leading-relaxed max-w-sm">
                {subtitle}
              </p>
            )}
          </div>

          {children}

          {/* Footer */}
          <div className="mt-auto pt-16 text-center">
            <div className="flex items-center justify-center gap-3 text-[13px] text-text-muted font-medium">
              <Link to="#" className="hover:text-text-primary transition-colors">Trợ giúp</Link>
              <span>&middot;</span>
              <Link to="#" className="hover:text-text-primary transition-colors">Điều khoản</Link>
              <span>&middot;</span>
              <Link to="#" className="hover:text-text-primary transition-colors">Bảo mật</Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
