import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, LogOut, Key, ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function UserMenu() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 pr-3 rounded-full border border-transparent hover:bg-surface-2 transition-colors focus:outline-none"
      >
        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 overflow-hidden">
          {user?.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
          ) : (
            <User className="h-5 w-5" />
          )}
        </div>
        <span className="hidden sm:block text-sm font-semibold text-text-primary">
          {user?.fullName || "Tài khoản"}
        </span>
        <ChevronDown className={`w-4 h-4 text-text-muted transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-64 bg-surface rounded-xl shadow-card border border-border overflow-hidden z-50 origin-top-right"
          >
            {/* Header info */}
            <div className="p-4 flex items-center gap-3 bg-surface-1/50 border-b border-border">
              <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 flex-shrink-0 overflow-hidden">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover" />
                ) : (
                  <User className="h-7 w-7" />
                )}
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-[15px] font-bold text-text-primary truncate">
                  {user?.fullName || "Tài khoản"}
                </span>
                <span className="text-xs font-medium text-text-muted truncate">
                  {user?.email || ""}
                </span>
              </div>
            </div>

            {/* Menu Items */}
            <div className="p-2 flex flex-col gap-1">
              <Link
                to="/profile/change-password"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-secondary hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
              >
                <Key className="w-4 h-4" />
                Thay đổi mật khẩu
              </Link>
              
              <div className="h-px bg-border my-1 mx-2" />
              
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-danger hover:bg-danger/10 transition-colors w-full text-left"
              >
                <LogOut className="w-4 h-4" />
                Đăng xuất
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
