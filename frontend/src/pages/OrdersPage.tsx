import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../store/AuthContext";
import { useAuthModalStore } from "../store/useAuthModalStore";
import { useToastStore } from "../store/useToastStore";
import { cancelMyOrder, getMyOrders, type ApiOrder, type ApiOrderStatus } from "../services/api";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Spinner } from "../components/ui/Spinner";
import { Lock, ShoppingBag, PackageSearch, ChevronRight, Clock, CheckCircle2, Truck, XCircle, RefreshCw } from "lucide-react";
import { formatPrice } from "../utils/formatPrice";

type OrderStatusUi = "pending" | "confirmed" | "shipping" | "delivered" | "cancelled" | "refunded";

const statusMap: Record<ApiOrderStatus, OrderStatusUi> = {
  PENDING: "pending",
  CONFIRMED: "confirmed",
  SHIPPING: "shipping",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
  REFUNDED: "refunded",
};

const statusConfig: Record<
  OrderStatusUi,
  { label: string; badgeVariant: "primary" | "success" | "accent" | "sale" | "neutral"; icon: ReactNode }
> = {
  pending: {
    label: "Chờ xác nhận",
    badgeVariant: "accent",
    icon: <Clock className="w-4 h-4" />,
  },
  confirmed: {
    label: "Đã xác nhận",
    badgeVariant: "primary",
    icon: <CheckCircle2 className="w-4 h-4" />,
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
  refunded: {
    label: "Đã hoàn tiền",
    badgeVariant: "neutral",
    icon: <RefreshCw className="w-4 h-4" />,
  },
};

const paymentMethodLabel: Record<ApiOrder["paymentMethod"], string> = {
  COD: "Thanh toán khi nhận hàng",
  BANK_TRANSFER: "Chuyển khoản ngân hàng",
};

function toNumber(value: string | number) {
  return typeof value === "number" ? value : Number(value);
}

export function OrdersPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const openAuth = useAuthModalStore((s) => s.open);
  const { show: showToast } = useToastStore();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  async function loadOrders() {
    if (!isAuthenticated) return;
    setLoadingOrders(true);
    try {
      const response = await getMyOrders();
      setOrders(response.data);
    } catch (err: any) {
      showToast(err.message || "Không thể tải danh sách đơn hàng", "error");
    } finally {
      setLoadingOrders(false);
    }
  }

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const orderStats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((order) => ["PENDING", "CONFIRMED"].includes(order.status)).length,
      delivered: orders.filter((order) => order.status === "DELIVERED").length,
    };
  }, [orders]);

  async function handleCancelOrder(orderId: string) {
    if (!window.confirm("Bạn chắc chắn muốn hủy đơn hàng này?")) return;

    setCancellingId(orderId);
    try {
      const response = await cancelMyOrder(orderId);
      setOrders((current) => current.map((order) => (order.id === orderId ? response.data : order)));
      showToast("Đã hủy đơn hàng thành công", "success");
    } catch (err: any) {
      showToast(err.message || "Không thể hủy đơn hàng", "error");
    } finally {
      setCancellingId(null);
    }
  }

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

  return (
    <div className="min-h-screen bg-background-warm py-12 px-4">
      <div className="max-w-[940px] mx-auto">
        <nav className="flex items-center gap-2 text-sm text-text-sub mb-6">
          <Link to="/" className="hover:text-primary transition-colors">Trang chủ</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-espresso font-semibold">Đơn hàng của tôi</span>
        </nav>

        <header className="relative overflow-hidden rounded-[2rem] bg-espresso text-surface-warm p-7 md:p-9 mb-8 shadow-md">
          <div className="absolute -right-16 -top-20 h-56 w-56 rounded-full bg-accent/20 blur-3xl" />
          <div className="absolute -left-16 bottom-0 h-44 w-44 rounded-full bg-primary/25 blur-3xl" />
          <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <p className="text-accent font-bold uppercase tracking-[0.22em] text-xs mb-3">BBooks Order Hub</p>
              <h1 className="font-serif text-4xl md:text-5xl font-bold mb-3">Đơn Hàng Của Tôi</h1>
              <p className="text-surface-warm/75 max-w-xl">
                Theo dõi trạng thái xử lý, thông tin giao hàng và hủy đơn khi đơn vẫn đang chờ xác nhận.
              </p>
            </div>
            <Button variant="secondary" size="md" onClick={loadOrders} loading={loadingOrders}>
              Làm mới
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-3 gap-3 mb-8">
          {[
            ["Tổng đơn", orderStats.total],
            ["Đang xử lý", orderStats.pending],
            ["Đã giao", orderStats.delivered],
          ].map(([label, value]) => (
            <div key={label} className="bg-surface border border-border-warm rounded-2xl p-4 text-center shadow-sm">
              <p className="text-2xl font-extrabold text-espresso">{value}</p>
              <p className="text-xs font-bold text-text-sub uppercase tracking-wide mt-1">{label}</p>
            </div>
          ))}
        </div>

        {loadingOrders ? (
          <div className="bg-surface border border-border-warm rounded-3xl p-12 text-center shadow-sm">
            <Spinner size="lg" label="Đang tải đơn hàng..." />
          </div>
        ) : orders.length === 0 ? (
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
              const status = statusConfig[statusMap[order.status]];
              const canCancel = ["PENDING", "CONFIRMED"].includes(order.status);

              return (
                <article
                  key={order.id}
                  className="bg-surface border border-border-warm rounded-3xl p-6 shadow-sm hover:-translate-y-0.5 hover:shadow-lg transition-all"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border-warm pb-4 mb-5">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-espresso text-sm">{order.orderCode}</span>
                        <Badge variant={status.badgeVariant} size="sm" className="flex items-center gap-1">
                          {status.icon}
                          {status.label}
                        </Badge>
                      </div>
                      <span className="text-xs text-text-sub">
                        {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <span className="text-lg font-extrabold text-sale">{formatPrice(toNumber(order.total))}</span>
                  </div>

                  <div className="flex flex-col gap-3 mb-5">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="w-12 h-16 rounded-xl overflow-hidden border border-border-warm shrink-0 bg-surface-warm">
                          {item.bookCover ? (
                            <img src={item.bookCover} alt={item.bookTitle} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full grid place-items-center text-espresso/30">
                              <ShoppingBag className="w-5 h-5" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-espresso line-clamp-1">{item.bookTitle}</p>
                          <p className="text-xs text-text-sub mt-0.5">
                            {formatPrice(toNumber(item.unitPrice))} × {item.quantity}
                          </p>
                        </div>
                        <span className="text-sm font-extrabold text-espresso shrink-0">
                          {formatPrice(toNumber(item.totalPrice))}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="bg-surface-warm rounded-2xl p-4 flex flex-col gap-1.5 text-sm">
                    <div className="flex gap-2">
                      <span className="text-text-sub font-medium w-36 shrink-0">Người nhận:</span>
                      <span className="text-text-main font-semibold">{order.shippingName} · {order.shippingPhone}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-text-sub font-medium w-36 shrink-0">Địa chỉ:</span>
                      <span className="text-text-main font-semibold">{order.shippingAddress}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="text-text-sub font-medium w-36 shrink-0">Thanh toán:</span>
                      <span className="text-text-main font-semibold">
                        {paymentMethodLabel[order.paymentMethod]} · {order.paymentStatus === "PAID" ? "Đã thanh toán" : "Chưa thanh toán"}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-3 mt-4 flex-wrap">
                    {canCancel && (
                      <Button
                        variant="danger"
                        size="sm"
                        loading={cancellingId === order.id}
                        onClick={() => handleCancelOrder(order.id)}
                      >
                        Huỷ đơn hàng
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
