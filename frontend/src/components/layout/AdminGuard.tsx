import { Outlet } from "react-router-dom";
import { useAuth } from "../../store/AuthContext";
import { useAuthModalStore } from "../../store/useAuthModalStore";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import { LockKeyhole, ShieldAlert } from "lucide-react";

export function AdminGuard() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const openAuth = useAuthModalStore((s) => s.open);

  if (isLoading) {
    return <Spinner fullPage size="lg" label="Đang kiểm tra quyền truy cập..." />;
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background-warm flex items-center justify-center p-4 text-center">
        <div className="bg-white border border-border-warm rounded-3xl p-10 shadow-sm max-w-md">
          <LockKeyhole className="w-14 h-14 text-primary mx-auto mb-4" />
          <h1 className="font-serif text-3xl font-bold text-espresso mb-2">Cần đăng nhập</h1>
          <p className="text-text-sub mb-6">Vui lòng đăng nhập bằng tài khoản quản trị để vào Admin Panel.</p>
          <Button variant="primary" onClick={openAuth}>Đăng nhập</Button>
        </div>
      </div>
    );
  }

  if (user?.role !== "ADMIN") {
    return (
      <div className="min-h-screen bg-background-warm flex items-center justify-center p-4 text-center">
        <div className="bg-white border border-border-warm rounded-3xl p-10 shadow-sm max-w-md">
          <ShieldAlert className="w-14 h-14 text-sale mx-auto mb-4" />
          <h1 className="font-serif text-3xl font-bold text-espresso mb-2">Không có quyền</h1>
          <p className="text-text-sub mb-6">Tài khoản của bạn không có quyền truy cập khu vực quản trị.</p>
          <Button variant="outline" onClick={() => window.history.back()}>Quay lại</Button>
        </div>
      </div>
    );
  }

  return <Outlet />;
}
