import { useEffect, useState } from "react";
import { getAdminDashboard, type AdminDashboardStats } from "../../services/api";
import { formatPrice } from "../../utils/formatPrice";
import { Spinner } from "../../components/ui/Spinner";
import { Badge } from "../../components/ui/Badge";
import {
  BookOpen,
  Users,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from "lucide-react";

const statusConfig: Record<string, { label: string; badgeVariant: "primary" | "success" | "accent" | "neutral" | "sale" }> = {
  PENDING: { label: "Chờ xác nhận", badgeVariant: "accent" },
  CONFIRMED: { label: "Đã xác nhận", badgeVariant: "primary" },
  SHIPPING: { label: "Đang giao", badgeVariant: "primary" },
  DELIVERED: { label: "Đã giao", badgeVariant: "success" },
  CANCELLED: { label: "Đã huỷ", badgeVariant: "neutral" },
  REFUNDED: { label: "Hoàn tiền", badgeVariant: "sale" },
};

function StatCard({
  label,
  value,
  icon,
  color,
  sub,
}: {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
  sub?: string;
}) {
  return (
    <div className="bg-white rounded-2xl border border-border-warm p-6 shadow-sm flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-text-sub text-sm font-medium">{label}</p>
        <p className="text-2xl font-extrabold text-espresso mt-0.5">{value}</p>
        {sub && <p className="text-xs text-text-sub mt-1">{sub}</p>}
      </div>
    </div>
  );
}

export function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    setIsLoading(true);
    getAdminDashboard()
      .then((res) => {
        if (isMounted) setStats(res.data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || "Không tải được thống kê");
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  if (isLoading) return <Spinner fullPage size="lg" label="Đang tải dashboard..." />;
  if (error) return <p className="text-red-600 font-medium">{error}</p>;
  if (!stats) return null;

  return (
    <div className="flex flex-col gap-8">
      <div>
        <p className="text-[11px] font-extrabold uppercase tracking-widest text-primary mb-1">BBooks Admin</p>
        <h1 className="font-serif text-3xl font-bold text-espresso">Dashboard</h1>
        <p className="text-text-sub text-sm mt-1">Tổng quan hệ thống tính đến hôm nay</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
        <StatCard
          label="Tổng sách"
          value={stats.totalBooks}
          icon={<BookOpen className="w-6 h-6 text-primary" />}
          color="bg-accent-soft"
        />
        <StatCard
          label="Người dùng"
          value={stats.totalUsers}
          icon={<Users className="w-6 h-6 text-sky-600" />}
          color="bg-sky-50"
        />
        <StatCard
          label="Tổng đơn hàng"
          value={stats.totalOrders}
          icon={<ShoppingCart className="w-6 h-6 text-violet-600" />}
          color="bg-violet-50"
        />
        <StatCard
          label="Doanh thu (đã thanh toán)"
          value={formatPrice(stats.totalRevenue)}
          icon={<TrendingUp className="w-6 h-6 text-emerald-600" />}
          color="bg-emerald-50"
          sub="Chỉ tính đơn hàng đã thanh toán"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sách sắp hết hàng */}
        <section className="bg-white rounded-2xl border border-border-warm shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h2 className="font-bold text-espresso text-base">Sách sắp hết hàng</h2>
            <Badge variant="accent" size="sm">{stats.lowStockBooks.length}</Badge>
          </div>
          {stats.lowStockBooks.length === 0 ? (
            <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
              <CheckCircle2 className="w-4 h-4" /> Tất cả sách còn đủ tồn kho
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {stats.lowStockBooks.map((book) => (
                <div key={book.id} className="flex items-center gap-3">
                  <div className="w-10 h-14 rounded-lg overflow-hidden border border-border-warm shrink-0 bg-surface-warm">
                    {book.coverUrl && (
                      <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-espresso line-clamp-1">{book.title}</p>
                  </div>
                  <Badge variant={book.stock === 0 ? "sale" : "accent"} size="sm">
                    {book.stock === 0 ? "Hết hàng" : `Còn ${book.stock}`}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Đơn hàng gần đây */}
        <section className="bg-white rounded-2xl border border-border-warm shadow-sm p-6">
          <div className="flex items-center gap-2 mb-5">
            <Clock className="w-5 h-5 text-primary" />
            <h2 className="font-bold text-espresso text-base">Đơn hàng gần đây</h2>
          </div>
          {stats.recentOrders.length === 0 ? (
            <p className="text-sm text-text-sub">Chưa có đơn hàng nào</p>
          ) : (
            <div className="flex flex-col gap-3">
              {stats.recentOrders.map((order) => {
                const sc = statusConfig[order.status] ?? { label: order.status, badgeVariant: "neutral" as const };
                return (
                  <div key={order.id} className="flex items-center gap-3 py-2 border-b border-border-warm/60 last:border-0">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-bold text-espresso">{order.orderCode}</span>
                        <Badge variant={sc.badgeVariant} size="sm">{sc.label}</Badge>
                      </div>
                      <p className="text-xs text-text-sub mt-0.5">{order.shippingName}</p>
                    </div>
                    <span className="text-sm font-extrabold text-sale shrink-0">
                      {formatPrice(Number(order.total))}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
