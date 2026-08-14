import { Link, NavLink, useNavigate } from "react-router-dom";
import { Ticket, Bell, ShoppingCart } from "lucide-react";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Button } from "../atoms/Button";
import { ThemeToggle } from "../molecules/ThemeToggle";
import { UserMenu } from "../molecules/UserMenu";

export function Navbar() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-surface/95 backdrop-blur-md shadow-sm transition-all duration-300">
      <div className="w-full px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 text-xl font-bold text-indigo-600 hover:text-indigo-700 transition-colors">
            <Ticket className="h-6 w-6" />
            TicketHub
          </Link>
          <nav className="hidden md:flex gap-1 ml-4">
            <NavLink
              to="/events"
              className={({ isActive }) =>
                `px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${isActive
                  ? "text-primary-700 bg-primary-50 dark:text-primary-300 dark:bg-primary-900/30"
                  : "text-text-secondary hover:text-primary-600 hover:bg-surface-2"
                }`
              }
            >
              Sự kiện
            </NavLink>
            <NavLink
              to="/venues"
              className={({ isActive }) =>
                `px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${isActive
                  ? "text-primary-700 bg-primary-50 dark:text-primary-300 dark:bg-primary-900/30"
                  : "text-text-secondary hover:text-primary-600 hover:bg-surface-2"
                }`
              }
            >
              Địa điểm
            </NavLink>
          </nav>
        </div>

        <div className="flex items-center gap-4">
          {/* Future Icons Placeholder */}
          <div className="hidden sm:flex items-center gap-2 mr-2 text-text-muted">
            <button className="p-2 rounded-full hover:bg-surface-2 hover:text-primary-600 transition-colors">
              <ShoppingCart className="h-5 w-5" />
            </button>
            <button className="p-2 rounded-full hover:bg-surface-2 hover:text-primary-600 transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            <ThemeToggle />
          </div>
          {isAuthenticated ? (
            <UserMenu />
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-300 dark:hover:bg-primary-800/50 font-medium">Đăng nhập</Button>
              <Button variant="default" size="sm" onClick={() => navigate("/register")}>Đăng ký</Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
