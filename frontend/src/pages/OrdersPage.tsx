import { Link } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { useAuthModalStore } from "../store/useAuthModalStore";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Spinner } from "../components/ui/Spinner";
import { Lock, ShoppingBag, PackageSearch, ChevronRight, Clock, CheckCircle2, Truck, XCircle } from "lucide-react";
import { formatPrice } from "../utils/formatPrice";

// Dữ liệu mẫu — sẽ được thay bằng API thực khi có Order service
const demoOrders = [
  {
    id: "ORD-2026-001",
    date: "2026-06-20T10:30:00Z",
    status: "delivered" as const,
    items: [
      { title: "Đắc Nhân Tâm", cover: "https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&w=200&q=80", quantity: 1, price: 82000 },
      { title: "Nhà Giả Kim", cover: "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=200&q=80", quantity: 2, price: 72000 },
    ],
    total: 226000,
    address: "123 Nguyễn Huệ, Quận 1, TP. HCM",
    paymentMethod: "COD",
  },
  {
    id: "ORD-2026-002",
    date: "2026-06-25T14:00:00Z",
    status: "shipping" as const,
    items: [
      { title: "Sapiens: Lược Sử Loài Người", cover: "https://images.unsplash.com/photo-1495446815901-a7297e633e8d?auto=format&fit=crop&w=200&q=80", quantity: 1, price: 159000 },
    ],
    total: 159000,
    address: "456 Lê Lợi, Quận 3, TP. HCM",
    paymentMethod: "Chuyển khoản",
  },
  {
    id: "ORD-2026-003",
    date: "2026-06-26T09:15:00Z",
    status: "pending" as const,
    items: [
      { title: "Atomic Habits", cover: "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=200&q=80", quantity: 1, price: 132000 },
    ],
    total: 132000,
    address: "789 Trần Hưng Đạo, Quận 5, TP. HCM",
    paymentMethod: "COD",
  },
];

type OrderStatus = "pending" | "shipping" | "delivered" | "cancelled";

const statusConfig: Record<
  OrderStatus,
  { label: string; badgeVariant: "primary" | "success" | "accent" | "sale" | "neutral"; icon: React.ReactNode }
> = {
  pending: {
    label: "Chờ xác nhận",
    badgeVariant: "accent",
    icon: <Clock className="w-4 h-4" />,
  },
  shipping: {
    label: "Đang giao",
    badgeVariant: "primary",
    icon: <Truck className="w-4 h-4" />,
  },
  delivered: {
    label: "Đã giao",
    badgeVariant: "success",
    icon: <CheckCircle2 className="w-4 h-4" />,
  },
  cancelled: {
    label: "Đã huỷ",
    badgeVariant: "neutral",
    icon: <XCircle className="w-4 h-4" />,
  },
};

export function OrdersPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const openAuth = useAuthModalStore((s) => s.open);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background-warm flex items-center justify-center">
        <Spinner size="lg" label="Đang tải..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background-warm py-16 px-4 text-center flex flex-col justify-center items-center">
        <Lock className="w-16 h-16 text-espresso/40 mb-4" />
        <h1 className="font-serif text-3xl font-bold text-espresso mb-3">Yêu cầu đăng nhập</h1>
        <p className="text-text-sub max-w-md mb-8">Vui lòng đăng nhập để xem lịch sử đơn hàng của bạn.</p>
        <Button variant="primary" size="lg" onClick={openAuth}>
          Đăng nhập ngay
        </Button>
      </div>
    );
  }

  const orders = demoOrders;

  return (
    <div className="min-h-screen bg-background-warm py-12 px-4">
      <div className="max-w-[860px] mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-text-sub mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-espresso font-semibold">Đơn hàng của tôi</span>
        </nav>

        <h1 className="font-serif text-4xl font-bold text-espresso mb-8">Đơn Hàng Của Tôi</h1>

        {orders.length === 0 ? (
          <div className="bg-surface border border-border-warm rounded-3xl p-12 text-center shadow-sm">
            <PackageSearch className="w-16 h-16 text-espresso/30 mx-auto mb-4" />
            <h2 className="text-2xl font-serif font-bold text-espresso mb-2">Chưa có đơn hàng nào</h2>
            <p className="text-text-sub mb-8 max-w-md mx-auto">
              Bạn chưa đặt đơn hàng nào. Hãy khám phá sách và mua ngay nhé!
            </p>
            <Link to="/books">
              <Button variant="primary" size="lg">Mua sách ngay</Button>
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {orders.map((order) => {
              const status = statusConfig[order.status];
              return (
                <article
                  key={order.id}
                  className="bg-surface border border-border-warm rounded-3xl p-6 shadow-sm hover:shadow-md transition-shadow"
                >
                  {/* Header đơn hàng */}
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border-warm pb-4 mb-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-espresso text-sm">{order.id}</span>
                        <Badge variant={status.badgeVariant} size="sm" className="flex items-center gap-1">
                          {status.icon}
                          {status.label}
                        </Badge>
                      </div>
                      <span className="text-xs text-text-sub">
                        {new Date(order.date).toLocaleDateString("vi-VN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <span className="text-lg font-extrabold text-sale">{formatPrice(order.total)}</span>
                  </div>

                  {/* Danh sách sản phẩm */}
                  <div className="flex flex-col gap-3 mb-5">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-12 h-16 rounded-xl overflow-hidden border border-border-warm shrink-0">
                          <img src={item.cover} alt={item.title} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-espresso line-clamp-1">{item.title}</p>
                          <p className="text-xs text-text-sub mt-0.5">
                            {formatPrice(item.price)} × {item.quantity}
                          </p>
                        </div>
                        <span className="text-sm font-extrabold text-espresso shrink-0">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Chi tiết giao hàng */}
                  <div className="bg-surface-warm rounded-2xl p-4 flex flex-col gap-1.5 text-sm">
                    <div className="flex gap-2">
                      <span className="text-text-sub font-medium w-36 shrink-0">Địa chỉ:</span>
                      <span className="text-text-main font-semibold">{order.address}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-text-sub font-medium w-36 shrink-0">Thanh toán:</span>
                      <span className="text-text-main font-semibold">{order.paymentMethod}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 mt-4 flex-wrap">
                    {order.status === "pending" && (
                      <Button variant="danger" size="sm">
                        Huỷ đơn hàng
                      </Button>
                    )}
                    {order.status === "delivered" && (
                      <Button variant="outline" size="sm">
                        Mua lại
                      </Button>
                    )}
                    <Link to="/books">
                      <Button variant="ghost" size="sm">
                        <ShoppingBag className="w-4 h-4" />
                        Mua thêm sách
                      </Button>
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
