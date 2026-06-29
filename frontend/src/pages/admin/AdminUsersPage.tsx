import { useEffect, useState } from "react";
import { getAdminUsers, updateAdminUserStatus, type AdminUser } from "../../services/api";
import { Button } from "../../components/ui/Button";
import { Badge } from "../../components/ui/Badge";
import { Spinner } from "../../components/ui/Spinner";
import { useToastStore } from "../../store/useToastStore";
import { Lock, Mail, Phone, Search, Shield, Unlock, UserRound, Users } from "lucide-react";

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const showToast = useToastStore((s) => s.show);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const res = await getAdminUsers({ search: search || undefined });
      setUsers(res.data);
    } catch (error) {
      showToast((error as Error).message || "Không tải được người dùng", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleToggleUser(user: AdminUser) {
    const nextStatus = !user.isActive;
    setUpdatingId(user.id);
    try {
      const res = await updateAdminUserStatus(user.id, nextStatus);
      setUsers((current) => current.map((item) => (item.id === user.id ? res.data : item)));
      showToast(nextStatus ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản", "success");
    } catch (error) {
      showToast((error as Error).message || "Cập nhật người dùng thất bại", "error");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-primary mb-1">Khách hàng</p>
          <h1 className="font-serif text-3xl font-bold text-espresso">Quản lý Người dùng</h1>
          <p className="text-text-sub text-sm mt-1">Theo dõi tài khoản, vai trò và số lượng đơn hàng.</p>
        </div>
        <div className="bg-white border border-border-warm rounded-2xl px-5 py-3 shadow-sm flex items-center gap-3">
          <Users className="w-5 h-5 text-primary" />
          <div>
            <p className="text-xs text-text-sub">Tổng tài khoản</p>
            <p className="font-extrabold text-espresso">{users.length}</p>
          </div>
        </div>
      </div>

      <div className="bg-white border border-border-warm rounded-2xl p-4 shadow-sm flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-sub" />
          <input
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border-warm outline-none focus:border-primary text-sm"
            placeholder="Tìm theo tên hoặc email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadUsers()}
          />
        </div>
        <Button variant="outline" onClick={loadUsers}>Tìm</Button>
      </div>

      {isLoading ? (
        <Spinner fullPage label="Đang tải người dùng..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {users.map((user) => (
            <article key={user.id} className="bg-white border border-border-warm rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-accent-soft flex items-center justify-center shrink-0">
                  {user.role === "ADMIN" ? <Shield className="w-5 h-5 text-primary" /> : <UserRound className="w-5 h-5 text-primary" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="font-bold text-espresso truncate">{user.fullName}</h2>
                    <Badge variant={user.role === "ADMIN" ? "primary" : "neutral"} size="sm">{user.role}</Badge>
                    <Badge variant={user.isActive ? "success" : "sale"} size="sm">
                      {user.isActive ? "Active" : "Locked"}
                    </Badge>
                  </div>
                  <div className="mt-3 space-y-2 text-sm text-text-sub">
                    <p className="flex items-center gap-2"><Mail className="w-4 h-4" /> {user.email}</p>
                    <p className="flex items-center gap-2"><Phone className="w-4 h-4" /> {user.phone ?? "Chưa có SĐT"}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border-warm flex items-center justify-between gap-3 text-sm">
                <div>
                  <span className="text-text-sub">Đơn hàng</span>
                  <span className="font-extrabold text-espresso ml-2">{user._count.orders}</span>
                </div>
                <Button
                  size="sm"
                  variant={user.isActive ? "danger" : "outline"}
                  loading={updatingId === user.id}
                  icon={user.isActive ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                  onClick={() => handleToggleUser(user)}
                >
                  {user.isActive ? "Khóa" : "Mở khóa"}
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
