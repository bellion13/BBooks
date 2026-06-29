import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../store/useCartStore";
import { useState } from "react";
import { AlertTriangle, ShoppingCart, Trash2, Truck, Gift } from "lucide-react";

export function CartPage() {
  const { items, updateQuantity, removeFromCart, clearCart, getTotalPrice } = useCartStore();
  const navigate = useNavigate();
  const [giftWrap, setGiftWrap] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const subtotal = getTotalPrice();
  const isFreeShip = subtotal >= 199000;
  const shippingFee = subtotal === 0 ? 0 : isFreeShip ? 0 : 30000;
  const giftWrapFee = giftWrap ? 20000 : 0;
  const total = subtotal + shippingFee + giftWrapFee;

  const handleQuantityChange = async (itemId: string, newQty: number, stock: number) => {
    setErrorMsg(null);
    if (newQty < 1) return;
    if (newQty > stock) {
      setErrorMsg(`Sản phẩm này chỉ còn ${stock} cuốn trong kho.`);
      return;
    }
    try {
      await updateQuantity(itemId, newQty);
    } catch (e: any) {
      setErrorMsg(e.message || "Không thể cập nhật số lượng.");
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(price);
  };

  return (
    <div className="min-h-screen bg-background-warm py-12 px-4">
      <div className="max-w-[1200px] mx-auto">
        {/* Breadcrumbs */}
        <div className="text-sm font-semibold text-text-sub mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <span className="mx-2">/</span>
          <span className="text-espresso">Giỏ hàng của bạn</span>
        </div>

        <h1 className="font-serif text-4xl font-bold text-espresso mb-8">Giỏ Hàng</h1>

        {errorMsg && (
          <div className="bg-red-50 border-l-4 border-sale text-sale p-4 rounded-r-xl mb-6 text-sm font-medium animate-fade-in flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-sale shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {items.length === 0 ? (
          <div className="bg-surface border border-border-warm rounded-3xl p-12 text-center shadow-sm">
            <ShoppingCart className="w-16 h-16 text-espresso/30 mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-bold text-espresso mb-2">Giỏ hàng của bạn đang trống</h2>
            <p className="text-text-sub mb-8 max-w-md mx-auto">Hãy lấp đầy giỏ hàng của bạn bằng những cuốn sách hay và đầy cảm hứng từ BBooks nhé!</p>
            <Link 
              to="/books" 
              className="inline-block bg-primary hover:bg-primary-hover text-white font-bold rounded-full px-8 py-3.5 transition-all shadow-md hover:shadow-lg text-sm"
            >
              Khám phá sách ngay
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-8 items-start">
            {/* Left: Cart Items List */}
            <div className="bg-surface border border-border-warm rounded-3xl p-6 md:p-8 shadow-sm flex flex-col gap-6">
              <div className="flex justify-between items-center border-b border-border-warm pb-4">
                <span className="text-espresso font-bold text-lg">Sản phẩm ({items.length})</span>
                <button 
                  onClick={() => clearCart()}
                  className="text-text-sub hover:text-sale text-sm font-bold transition-colors cursor-pointer"
                >
                  Xóa tất cả
                </button>
              </div>

              <div className="flex flex-col gap-6 divide-y divide-border-warm/60">
                {items.map((item, idx) => (
                  <div key={item.id} className={`flex gap-4 md:gap-6 pt-6 ${idx === 0 ? "pt-0" : ""}`}>
                    {/* Cover image */}
                    <Link to={`/books/${item.slug}`} className="w-20 md:w-24 shrink-0 rounded-xl overflow-hidden border border-border-warm shadow-sm hover:scale-[1.02] transition-transform">
                      <img src={item.cover} alt={item.title} className="w-full h-full object-cover aspect-[3/4]" />
                    </Link>

                    {/* Content details */}
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <Link to={`/books/${item.slug}`} className="font-serif text-base md:text-lg font-bold text-espresso hover:text-primary transition-colors line-clamp-2">
                          {item.title}
                        </Link>
                        <span className="text-text-sub text-xs font-semibold block mt-0.5">Tác giả: {item.author}</span>
                      </div>

                      <div className="flex justify-between items-end mt-4">
                        {/* Quantity Controls */}
                        <div className="flex items-center border border-border-warm rounded-full bg-surface-warm p-1 shadow-inner">
                          <button 
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1, item.stock)}
                            disabled={item.quantity <= 1}
                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-espresso hover:bg-surface disabled:opacity-30 transition-all cursor-pointer"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-espresso">{item.quantity}</span>
                          <button 
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.stock)}
                            className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-espresso hover:bg-surface transition-all cursor-pointer"
                          >
                            +
                          </button>
                        </div>

                        {/* Price Column */}
                        <div className="text-right">
                          <span className="text-espresso font-extrabold text-base md:text-lg block">
                            {formatPrice(item.price * item.quantity)}
                          </span>
                          {item.originalPrice && (
                            <span className="text-text-sub line-through text-xs block">
                              {formatPrice(item.originalPrice * item.quantity)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Delete button */}
                    <button 
                      onClick={() => removeFromCart(item.id)}
                      className="text-text-sub hover:text-sale p-1.5 self-start transition-colors cursor-pointer rounded-lg hover:bg-surface-warm"
                      title="Xóa sản phẩm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Summary Box */}
            <div className="flex flex-col gap-6">
              {/* Freeship Indicator */}
              <div className="bg-surface border border-border-warm rounded-3xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <Truck className="w-6 h-6 text-primary shrink-0" />
                  <div>
                    <h3 className="font-bold text-espresso text-sm">
                      {isFreeShip ? "Đủ điều kiện Miễn phí vận chuyển!" : "Chương trình Miễn phí vận chuyển"}
                    </h3>
                    <p className="text-xs text-text-sub mt-0.5">Freeship toàn quốc cho đơn hàng từ 199.000 đ</p>
                  </div>
                </div>
                {!isFreeShip && (
                  <div>
                    <div className="w-full h-2 bg-background-warm rounded-full overflow-hidden mb-2">
                      <div 
                        className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-300"
                        style={{ width: `${Math.min((subtotal / 199000) * 100, 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-xs font-semibold text-text-main">
                      Mua thêm <span className="text-primary font-bold">{formatPrice(199000 - subtotal)}</span> để được miễn phí vận chuyển.
                    </p>
                  </div>
                )}
              </div>

              {/* Order Summary details */}
              <div className="bg-espresso text-surface-warm rounded-3xl p-6 md:p-8 shadow-md">
                <h2 className="font-serif text-2xl font-bold border-b border-surface-warm/20 pb-4 mb-6">Tóm tắt đơn hàng</h2>
                
                <div className="flex flex-col gap-4 text-sm font-medium border-b border-surface-warm/20 pb-6 mb-6">
                  <div className="flex justify-between">
                    <span className="opacity-80">Tạm tính</span>
                    <span className="font-bold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="opacity-80">Phí vận chuyển</span>
                    <span className="font-bold">
                      {shippingFee === 0 ? "Miễn phí" : formatPrice(shippingFee)}
                    </span>
                  </div>
                  
                  {/* Gift Wrap Option */}
                  <label className="flex items-center justify-between cursor-pointer py-1">
                    <span className="flex items-center gap-2 opacity-80">
                      <input 
                        type="checkbox" 
                        checked={giftWrap} 
                        onChange={(e) => setGiftWrap(e.target.checked)} 
                        className="rounded border-surface-warm/30 text-accent focus:ring-accent bg-transparent w-4 h-4 cursor-pointer"
                      />
                      <Gift className="w-4 h-4 text-accent shrink-0" />
                      <span>Đóng gói làm quà tặng</span>
                    </span>
                    <span className="font-bold">+20.000 đ</span>
                  </label>
                </div>

                <div className="flex justify-between items-baseline mb-8">
                  <span className="font-serif text-lg font-bold">Tổng cộng</span>
                  <span className="text-2xl md:text-3xl font-extrabold text-accent">
                    {formatPrice(total)}
                  </span>
                </div>

                <button 
                  onClick={() => navigate("/checkout")}
                  className="w-full bg-accent hover:bg-accent/90 text-white font-bold py-4 px-6 rounded-full text-center text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 cursor-pointer"
                >
                  Tiến hành thanh toán
                </button>

                <Link 
                  to="/books" 
                  className="block text-center text-xs opacity-70 hover:opacity-100 mt-4 transition-opacity font-semibold"
                >
                  ← Tiếp tục mua sắm
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
