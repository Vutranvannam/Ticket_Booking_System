import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";

export default function MainLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background font-sans">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <footer className="bg-background border-t border-border text-text-secondary py-8 text-center text-sm">
        <p>&copy; {new Date().getFullYear()} Ticket Booking System. All rights reserved.</p>
      </footer>
    </div>
  );
}
