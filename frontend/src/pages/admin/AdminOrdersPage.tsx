import { useEffect, useMemo, useState } from "react";
import { getAdminOrders, updateAdminOrderStatus, type AdminOrder } from "../../services/api";
import { formatPrice } from "../../utils/formatPrice";
import { Badge, type BadgeVariant } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { useToastStore } from "../../store/useToastStore";
import { CalendarClock, CheckCircle2, CreditCard, MapPin, PackageCheck, Search, Truck, XCircle } from "lucide-react";

type OrderStatus = AdminOrder["status"];
type PaymentStatus = AdminOrder["paymentStatus"];

const orderStatuses: { value: OrderStatus; label: string; badge: BadgeVariant; icon: React.ReactNode }[] = [
  { value: "PENDING", label: "Chờ xác nhận", badge: "accent", icon: <CalendarClock className="w-4 h-4" /> },
  { value: "CONFIRMED", label: "Đã xác nhận", badge: "primary", icon: <CheckCircle2 className="w-4 h-4" /> },
  { value: "SHIPPING", label: "Đang giao", badge: "primary", icon: <Truck className="w-4 h-4" /> },
  { value: "DELIVERED", label: "Đã giao", badge: "success", icon: <PackageCheck className="w-4 h-4" /> },
  { value: "CANCELLED", label: "Đã huỷ", badge: "neutral", icon: <XCircle className="w-4 h-4" /> },
  { value: "REFUNDED", label: "Hoàn tiền", badge: "sale", icon: <CreditCard className="w-4 h-4" /> },
];

const paymentStatuses: { value: PaymentStatus; label: string; badge: BadgeVariant }[] = [
  { value: "UNPAID", label: "Chưa thanh toán", badge: "neutral" },
  { value: "PAID", label: "Đã thanh toán", badge: "success" },
  { value: "REFUNDED", label: "Đã hoàn tiền", badge: "sale" },
];

function getStatusMeta(status: OrderStatus) {
  return orderStatuses.find((s) => s.value === status) ?? orderStatuses[0];
}

function getPaymentMeta(status: PaymentStatus) {
  return paymentStatuses.find((s) => s.value === status) ?? paymentStatuses[0];
}

export function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [status, setStatus] = useState<string>("");
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const showToast = useToastStore((s) => s.show);

  const totalRevenue = useMemo(
    () => orders.reduce((sum, order) => sum + Number(order.paymentStatus === "PAID" ? order.total : 0), 0),
    [orders],
  );

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const res = await getAdminOrders({ status: status || undefined, search: search || undefined });
      setOrders(res.data);
    } catch (error) {
      showToast((error as Error).message || "Không tải được đơn hàng", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleUpdate(order: AdminOrder, next: { status?: string; paymentStatus?: string }) {
    setUpdatingId(order.id);
    try {
      const res = await updateAdminOrderStatus(order.id, next);
      setOrders((current) => current.map((item) => (item.id === order.id ? res.data : item)));
      showToast("Cập nhật đơn hàng thành công", "success");
    } catch (error) {
      showToast((error as Error).message || "Cập nhật đơn hàng thất bại", "error");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-primary mb-1">Vận hành</p>
          <h1 className="font-serif text-3xl font-bold text-espresso">Quản lý Đơn hàng</h1>
          <p className="text-text-sub text-sm mt-1">Theo dõi trạng thái giao hàng, thanh toán và chi tiết sản phẩm.</p>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white border border-border-warm rounded-2xl px-5 py-3 shadow-sm">
            <p className="text-xs text-text-sub">Đơn đang xem</p>
            <p className="font-extrabold text-espresso text-xl">{orders.length}</p>
          </div>
          <div className="bg-white border border-border-warm rounded-2xl px-5 py-3 shadow-sm">
            <p className="text-xs text-text-sub">Đã thanh toán</p>
            <p className="font-extrabold text-primary text-xl">{formatPrice(totalRevenue)}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-border-warm rounded-2xl p-4 shadow-sm grid grid-cols-1 md:grid-cols-[1fr_220px_auto] gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-sub" />
          <input
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border-warm outline-none focus:border-primary text-sm"
            placeholder="Tìm mã đơn, người nhận hoặc SĐT..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadOrders()}
          />
        </div>
        <select
          className="px-3 py-2.5 rounded-xl border border-border-warm outline-none focus:border-primary text-sm bg-white"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          {orderStatuses.map((item) => (
            <option key={item.value} value={item.value}>{item.label}</option>
          ))}
        </select>
        <Button variant="outline" onClick={loadOrders}>Lọc</Button>
      </div>

      {isLoading ? (
        <Spinner fullPage label="Đang tải đơn hàng..." />
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            const statusMeta = getStatusMeta(order.status);
            const paymentMeta = getPaymentMeta(order.paymentStatus);
            return (
              <article key={order.id} className="bg-white border border-border-warm rounded-3xl p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-extrabold text-espresso text-lg">#{order.orderCode}</h2>
                      <Badge variant={statusMeta.badge}>{statusMeta.label}</Badge>
                      <Badge variant={paymentMeta.badge}>{paymentMeta.label}</Badge>
                    </div>
                    <p className="text-sm text-text-sub mt-2">
                      {new Date(order.createdAt).toLocaleString("vi-VN")} • {order.user?.email ?? "Khách vãng lai"}
                    </p>
                    <p className="text-sm text-text-sub mt-2 flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 shrink-0" />
                      <span>{order.shippingName} • {order.shippingPhone} • {order.shippingAddress}</span>
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 min-w-fit">
                    <select
                      className="px-3 py-2 rounded-xl border border-border-warm text-sm bg-white outline-none focus:border-primary"
                      value={order.status}
                      disabled={updatingId === order.id}
                      onChange={(e) => handleUpdate(order, { status: e.target.value })}
                    >
                      {orderStatuses.map((item) => (
                        <option key={item.value} value={item.value}>{item.label}</option>
                      ))}
                    </select>
                    <select
                      className="px-3 py-2 rounded-xl border border-border-warm text-sm bg-white outline-none focus:border-primary"
                      value={order.paymentStatus}
                      disabled={updatingId === order.id}
                      onChange={(e) => handleUpdate(order, { paymentStatus: e.target.value })}
                    >
                      {paymentStatuses.map((item) => (
                        <option key={item.value} value={item.value}>{item.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-4">
                  <div className="space-y-3">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3 bg-surface-warm rounded-2xl p-3">
                        <img
                          src={item.bookCover ?? "/placeholder-book.svg"}
                          alt={item.bookTitle}
                          className="w-12 h-16 object-cover rounded-xl bg-white border border-border-warm"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-bold text-sm text-espresso truncate">{item.bookTitle}</p>
                          <p className="text-xs text-text-sub">SL: {item.quantity} × {formatPrice(Number(item.unitPrice))}</p>
                        </div>
                        <p className="font-extrabold text-sm text-primary">{formatPrice(Number(item.totalPrice))}</p>
                      </div>
                    ))}
                  </div>

                  <div className="bg-espresso text-white rounded-2xl p-4 h-fit space-y-2">
                    <div className="flex justify-between text-sm text-white/70"><span>Tạm tính</span><span>{formatPrice(Number(order.subtotal))}</span></div>
                    <div className="flex justify-between text-sm text-white/70"><span>Giảm giá</span><span>-{formatPrice(Number(order.discount))}</span></div>
                    <div className="flex justify-between text-sm text-white/70"><span>Vận chuyển</span><span>{formatPrice(Number(order.shippingFee))}</span></div>
                    <div className="pt-3 border-t border-white/15 flex justify-between items-center">
                      <span className="font-bold">Tổng</span>
                      <span className="font-extrabold text-xl text-accent">{formatPrice(Number(order.total))}</span>
                    </div>
                    <p className="text-xs text-white/60 pt-2">PTTT: {order.paymentMethod}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
