import { Link } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import { useState } from "react";
import { useCartStore } from "../../store/useCartStore";
import { useWishlistStore } from "../../store/useWishlistStore";
import { useAuthModalStore } from "../../store/useAuthModalStore";
import { Search, Heart, ShoppingCart, User, Settings } from "lucide-react";

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const openAuth = useAuthModalStore((state) => state.open);
  
  const totalItems = useCartStore((state) => state.getTotalItems());
  const wishlistItemsCount = useWishlistStore((state) => state.items.length);

  return (
    <header className="sticky top-0 z-20 bg-background-warm/90 backdrop-blur-md border-b border-border-warm/80">
      <div className="bg-espresso text-surface-warm text-center py-2 px-4 text-xs md:text-sm font-medium">
        Freeship từ 199K · Đổi trả dễ dàng · Sách mới mỗi ngày
      </div>
      <div className="max-w-[1280px] w-[calc(100%-48px)] mx-auto min-h-[76px] flex flex-col md:flex-row items-center gap-4 md:gap-6 py-4 md:py-0">
        <Link className="font-serif text-3xl font-bold text-espresso tracking-tight shrink-0" to="/" aria-label="BBooks home">
          BBooks
        </Link>
        <label className="w-full md:flex-1 flex items-center gap-2 bg-surface border border-border-warm rounded-full px-4 h-12 shadow-sm focus-within:border-accent" htmlFor="global-search">
          <Search className="w-4 h-4 text-text-sub shrink-0" />
          <input id="global-search" className="border-0 outline-none w-full text-text-main placeholder-text-sub text-sm bg-transparent" placeholder="Tìm kiếm sách, tác giả, ISBN..." />
        </label>
        <nav className="flex items-center gap-4 md:gap-6 font-semibold text-espresso shrink-0 flex-wrap justify-center" aria-label="Main navigation">
          <Link to="/books" className="hover:text-primary transition-colors text-sm">Danh mục</Link>
          <Link to="/wishlist" className="hover:text-primary transition-colors text-sm flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-espresso hover:text-primary" /> Yêu thích
            {isAuthenticated && wishlistItemsCount > 0 && (
              <span className="bg-primary text-white text-[10px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center animate-pulse">
                {wishlistItemsCount}
              </span>
            )}
          </Link>
          <Link to="/cart" className="hover:text-primary transition-colors text-sm flex items-center gap-1.5">
            <ShoppingCart className="w-4 h-4 text-espresso hover:text-primary" /> Giỏ hàng
            {totalItems > 0 && (
              <span className="bg-primary text-white text-[10px] font-bold rounded-full min-w-4 h-4 px-1 flex items-center justify-center animate-pulse">
                {totalItems}
              </span>
            )}
          </Link>
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                className="bg-accent hover:bg-primary-hover text-white font-bold rounded-full py-2 px-4 transition-all duration-200 text-sm shadow-sm flex items-center gap-2"
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <User className="w-4 h-4 text-white" /> {user.fullName.split(" ").pop()}
              </button>
              {dropdownOpen && (
                <div className="absolute right-0 mt-3 bg-surface border border-border-warm rounded-2xl shadow-espresso w-60 p-3 flex flex-col z-50 animate-fade-in" onMouseLeave={() => setDropdownOpen(false)}>
                  <div className="p-2 flex flex-col">
                    <strong className="text-espresso text-sm font-bold">{user.fullName}</strong>
                    <span className="text-text-sub text-xs mt-0.5">{user.email}</span>
                  </div>
                  <hr className="border-t border-border-warm my-2" />
                  <Link to="/orders" className="p-2 rounded-xl text-sm font-semibold hover:bg-surface-warm transition-colors" onClick={() => setDropdownOpen(false)}>Đơn hàng</Link>
                  {user.role === "ADMIN" && (
                    <Link to="/admin" className="p-2 rounded-xl text-sm font-bold text-primary hover:bg-surface-warm transition-colors flex items-center gap-2" onClick={() => setDropdownOpen(false)}>
                      <Settings className="w-4 h-4 text-primary shrink-0" /> Quản trị viên
                    </Link>
                  )}
                  <hr className="border-t border-border-warm my-2" />
                  <button
                    className="border-0 bg-transparent p-2 text-left rounded-xl text-sm font-semibold text-sale hover:bg-red-50 w-full transition-colors cursor-pointer"
                    type="button"
                    onClick={() => {
                      logout();
                      setDropdownOpen(false);
                    }}
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              id="open-auth-modal"
              className="bg-accent hover:bg-primary-hover text-white font-bold rounded-full py-2 px-4 transition-all duration-200 text-sm shadow-sm cursor-pointer"
              type="button"
              onClick={openAuth}
            >
              Tài khoản
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
