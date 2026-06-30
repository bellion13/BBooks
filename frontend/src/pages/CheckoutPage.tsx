import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCartStore } from "../store/useCartStore";
import { useAuth } from "../store/AuthContext";
import { useAuthModalStore } from "../store/useAuthModalStore";
import { useToastStore } from "../store/useToastStore";
import { createOrder, type ApiPaymentMethod } from "../services/api";
import { Input } from "../components/ui/Input";
import { Button } from "../components/ui/Button";
import { formatPrice } from "../utils/formatPrice";
import {
  MapPin,
  CreditCard,
  Truck,
  ShoppingBag,
  ChevronRight,
  Lock,
  CheckCircle2,
} from "lucide-react";

type PaymentMethod = "cod" | "bank" | "card";

const paymentMethods: { id: PaymentMethod; label: string; desc: string; icon: React.ReactNode }[] = [
  {
    id: "cod",
    label: "Thanh toán khi nhận hàng (COD)",
    desc: "Trả tiền mặt khi nhận hàng",
    icon: <Truck className="w-5 h-5 text-primary" />,
  },
  {
    id: "bank",
    label: "Chuyển khoản ngân hàng",
    desc: "MB Bank · 0123456789 · BBooks Store",
    icon: <CreditCard className="w-5 h-5 text-primary" />,
  },
  {
    id: "card",
    label: "Thẻ tín dụng / Thẻ ghi nợ",
    desc: "Visa, Mastercard (demo — chưa kích hoạt)",
    icon: <CreditCard className="w-5 h-5 text-text-sub" />,
  },
];

export function CheckoutPage() {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const openAuth = useAuthModalStore((s) => s.open);
  const { items, getTotalPrice, fetchCart } = useCartStore();
  const { show: showToast } = useToastStore();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cod");
  const [loading, setLoading] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);

  // Địa chỉ giao hàng
  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const subtotal = getTotalPrice();
  const isFreeShip = subtotal >= 199000;
  const shippingFee = subtotal === 0 ? 0 : isFreeShip ? 0 : 30000;
  const total = subtotal + shippingFee;

  // Chưa đăng nhập
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background-warm py-16 px-4 text-center flex flex-col justify-center items-center">
        <Lock className="w-16 h-16 text-espresso/40 mb-4" />
        <h1 className="font-serif text-3xl font-bold text-espresso mb-3">Yêu cầu đăng nhập</h1>
        <p className="text-text-sub max-w-md mb-8">Vui lòng đăng nhập để tiến hành thanh toán đơn hàng của bạn.</p>
        <Button variant="primary" size="lg" onClick={openAuth}>
          Đăng nhập để thanh toán
        </Button>
      </div>
    );
  }

  // Giỏ hàng trống
  if (items.length === 0 && !orderPlaced) {
    return (
      <div className="min-h-screen bg-background-warm py-16 px-4 text-center flex flex-col justify-center items-center">
        <ShoppingBag className="w-16 h-16 text-espresso/30 mb-4" />
        <h1 className="font-serif text-3xl font-bold text-espresso mb-3">Giỏ hàng trống</h1>
        <p className="text-text-sub max-w-md mb-8">Thêm sách vào giỏ hàng trước khi thanh toán nhé!</p>
        <Link to="/books">
          <Button variant="primary" size="lg">Khám phá sách</Button>
        </Link>
      </div>
    );
  }

  // Đặt hàng thành công
  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background-warm py-16 px-4 flex flex-col justify-center items-center text-center">
        <div className="bg-surface rounded-3xl border border-border-warm p-12 shadow-sm max-w-md w-full">
          <CheckCircle2 className="w-20 h-20 text-emerald-500 mx-auto mb-6" />
          <h1 className="font-serif text-3xl font-bold text-espresso mb-3">Đặt hàng thành công!</h1>
          <p className="text-text-sub mb-2">
            Cảm ơn bạn đã mua sắm tại <strong>BBooks</strong>.
          </p>
          <p className="text-text-sub text-sm mb-8">
            Chúng tôi sẽ xác nhận đơn hàng và liên hệ với bạn sớm nhất có thể.
          </p>
          <div className="flex flex-col gap-3">
            <Button variant="primary" size="lg" className="w-full" onClick={() => navigate("/orders")}>
              Xem đơn hàng của tôi
            </Button>
            <Button variant="ghost" size="md" className="w-full" onClick={() => navigate("/books")}>
              Tiếp tục mua sắm
            </Button>
          </div>
        </div>
      </div>
    );
  }

  function validate() {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim()) newErrors.fullName = "Vui lòng nhập họ và tên";
    if (!phone.trim()) newErrors.phone = "Vui lòng nhập số điện thoại";
    else if (!/^0\d{9}$/.test(phone.trim())) newErrors.phone = "Số điện thoại không hợp lệ (VD: 0912345678)";
    if (!address.trim()) newErrors.address = "Vui lòng nhập địa chỉ giao hàng";
    if (!city.trim()) newErrors.city = "Vui lòng chọn tỉnh/thành phố";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handlePlaceOrder() {
    if (!validate()) return;

    setLoading(true);
    try {
      const normalizedPaymentMethod: ApiPaymentMethod = paymentMethod === "bank" ? "BANK_TRANSFER" : "COD";
      const shippingAddress = [address.trim(), city.trim()].filter(Boolean).join(", ");

      await createOrder({
        paymentMethod: normalizedPaymentMethod,
        shippingName: fullName.trim(),
        shippingPhone: phone.trim(),
        shippingAddress,
        note: note.trim() || undefined,
      });

      await fetchCart();
      setOrderPlaced(true);
      showToast("Đặt hàng thành công! Chúng tôi sẽ liên hệ sớm nhất.", "success");
    } catch (err: any) {
      showToast(err.message || "Không thể đặt hàng, vui lòng thử lại", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background-warm py-12 px-4">
      <div className="max-w-[1100px] mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-text-sub mb-6 flex-wrap">
          <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/cart" className="hover:text-primary transition-colors">Giỏ hàng</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-espresso font-semibold">Thanh toán</span>
        </nav>

        <h1 className="font-serif text-4xl font-bold text-espresso mb-8">Thanh Toán</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
          {/* Cột trái: Form */}
          <div className="flex flex-col gap-6">
            {/* Địa chỉ giao hàng */}
            <section className="bg-surface border border-border-warm rounded-3xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-full bg-accent-soft flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-primary" />
                </div>
                <h2 className="font-serif text-xl font-bold text-espresso">Địa chỉ giao hàng</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Họ và tên người nhận"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Nhập họ và tên"
                  error={errors.fullName}
                  prefixIcon={<MapPin className="w-4 h-4" />}
                  required
                />
                <Input
                  label="Số điện thoại"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0912345678"
                  error={errors.phone}
                  required
                />
                <div className="sm:col-span-2">
                  <Input
                    label="Địa chỉ (số nhà, đường, phường/xã)"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="VD: 123 Nguyễn Huệ, Phường Bến Nghé"
                    error={errors.address}
                    required
                  />
                </div>
                <Input
                  label="Tỉnh / Thành phố"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="VD: TP. Hồ Chí Minh"
                  error={errors.city}
                  required
                />
                <Input
                  label="Ghi chú đơn hàng (tùy chọn)"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="VD: Giao giờ hành chính"
                />
              </div>
            </section>

            {/* Phương thức thanh toán */}
            <section className="bg-surface border border-border-warm rounded-3xl p-6 md:p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-full bg-accent-soft flex items-center justify-center shrink-0">
                  <CreditCard className="w-4 h-4 text-primary" />
                </div>
                <h2 className="font-serif text-xl font-bold text-espresso">Phương thức thanh toán</h2>
              </div>

              <div className="flex flex-col gap-3">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                      paymentMethod === method.id
                        ? "border-primary bg-accent-soft/30"
                        : "border-border-warm hover:border-primary/40"
                    } ${method.id === "card" ? "opacity-50 cursor-not-allowed" : ""}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={method.id}
                      checked={paymentMethod === method.id}
                      onChange={() => method.id !== "card" && setPaymentMethod(method.id)}
                      disabled={method.id === "card"}
                      className="accent-primary w-4 h-4 shrink-0"
                    />
                    {method.icon}
                    <div className="flex-1">
                      <span className="font-bold text-sm text-espresso block">{method.label}</span>
                      <span className="text-xs text-text-sub">{method.desc}</span>
                    </div>
                  </label>
                ))}
              </div>
            </section>
          </div>

          {/* Cột phải: Tóm tắt đơn hàng */}
          <div className="flex flex-col gap-4">
            {/* Danh sách sản phẩm */}
            <div className="bg-surface border border-border-warm rounded-3xl p-6 shadow-sm">
              <h2 className="font-serif text-lg font-bold text-espresso mb-4">
                Sản phẩm ({items.length})
              </h2>
              <div className="flex flex-col gap-4 max-h-72 overflow-y-auto pr-1 no-scrollbar">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 items-start">
                    <Link to={`/books/${item.slug}`} className="w-14 shrink-0 rounded-xl overflow-hidden border border-border-warm">
                      <img src={item.cover} alt={item.title} className="w-full aspect-[3/4] object-cover" />
                    </Link>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-espresso line-clamp-2 leading-snug">{item.title}</p>
                      <p className="text-xs text-text-sub mt-0.5">x{item.quantity}</p>
                    </div>
                    <span className="text-sm font-extrabold text-espresso shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Chi tiết tổng tiền */}
            <div className="bg-espresso text-surface-warm rounded-3xl p-6 shadow-md">
              <h2 className="font-serif text-xl font-bold border-b border-surface-warm/20 pb-4 mb-5">
                Tóm tắt đơn hàng
              </h2>
              <div className="flex flex-col gap-3 text-sm font-medium mb-5 border-b border-surface-warm/20 pb-5">
                <div className="flex justify-between">
                  <span className="opacity-80">Tạm tính</span>
                  <span className="font-bold">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="opacity-80">Phí vận chuyển</span>
                  <span className="font-bold">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-400">Miễn phí</span>
                    ) : (
                      formatPrice(shippingFee)
                    )}
                  </span>
                </div>
              </div>
              <div className="flex justify-between items-baseline mb-6">
                <span className="font-serif text-lg font-bold">Tổng cộng</span>
                <span className="text-2xl font-extrabold text-accent">{formatPrice(total)}</span>
              </div>

              <Button
                variant="primary"
                size="lg"
                loading={loading}
                className="w-full"
                onClick={handlePlaceOrder}
              >
                {loading ? "Đang đặt hàng..." : "Xác nhận đặt hàng"}
              </Button>

              <Link to="/cart" className="block text-center text-xs opacity-70 hover:opacity-100 mt-4 transition-opacity font-semibold">
                ← Quay lại giỏ hàng
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
