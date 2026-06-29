import { useState } from "react";
import { Link, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import {
  LayoutDashboard,
  BookOpen,
  Tags,
  Users,
  ShoppingCart,
  ChevronLeft,
  LogOut,
  Menu,
  X,
  Settings,
  TicketPercent,
  Images,
  MessageSquareText,
} from "lucide-react";

const navItems = [
  { to: "/admin", label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" />, exact: true },
  { to: "/admin/books", label: "Quản lý Sách", icon: <BookOpen className="w-5 h-5" /> },
  { to: "/admin/categories", label: "Danh mục", icon: <Tags className="w-5 h-5" /> },
  { to: "/admin/users", label: "Người dùng", icon: <Users className="w-5 h-5" /> },
  { to: "/admin/orders", label: "Đơn hàng", icon: <ShoppingCart className="w-5 h-5" /> },
  { to: "/admin/coupons", label: "Mã giảm giá", icon: <TicketPercent className="w-5 h-5" /> },
  { to: "/admin/banners", label: "Banner", icon: <Images className="w-5 h-5" /> },
  { to: "/admin/reviews", label: "Đánh giá", icon: <MessageSquareText className="w-5 h-5" /> },
];

export function AdminLayout() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isActive = (to: string, exact = false) =>
    exact ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <div className="min-h-screen bg-[#f8f5f1] flex">
      {/* Overlay mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-espresso/40 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-espresso text-surface-warm z-40 flex flex-col transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-surface-warm/10">
          <Link to="/" className="font-serif text-2xl font-bold text-surface-warm">
            BBooks
          </Link>
          <button
            className="lg:hidden text-surface-warm/70 hover:text-surface-warm cursor-pointer"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Admin badge */}
        <div className="px-6 py-3 border-b border-surface-warm/10">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-accent">
            Admin Panel
          </span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 px-3 py-4 flex flex-col gap-1" aria-label="Admin navigation">
          {navItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                isActive(item.to, item.exact)
                  ? "bg-accent text-white shadow-sm"
                  : "text-surface-warm/70 hover:bg-surface-warm/10 hover:text-surface-warm"
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User info + logout */}
        <div className="border-t border-surface-warm/10 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-accent/30 flex items-center justify-center">
              <Settings className="w-4 h-4 text-accent" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold truncate">{user?.fullName}</p>
              <p className="text-[11px] text-surface-warm/60 truncate">{user?.email}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link
              to="/"
              className="flex-1 flex items-center justify-center gap-1.5 text-xs text-surface-warm/60 hover:text-surface-warm py-2 rounded-lg hover:bg-surface-warm/10 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Trang web
            </Link>
            <button
              onClick={logout}
              className="flex-1 flex items-center justify-center gap-1.5 text-xs text-sale/80 hover:text-sale py-2 rounded-lg hover:bg-red-900/20 transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Đăng xuất
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar (mobile) */}
        <header className="lg:hidden sticky top-0 z-20 flex items-center gap-3 px-4 py-3.5 bg-espresso text-surface-warm border-b border-surface-warm/10">
          <button
            className="cursor-pointer hover:text-accent transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="font-serif text-lg font-bold">BBooks Admin</span>
        </header>

        <main className="flex-1 p-6 md:p-8 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
