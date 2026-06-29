import { useState } from "react";
import { useAuth } from "../../store/AuthContext";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { Mail, Lock, User, Phone, X } from "lucide-react";

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const { login, register } = useAuth();
  const [activeTab, setActiveTab] = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (activeTab === "login") {
        await login({ email, password });
      } else {
        await register({ fullName, email, phone, password });
      }
      onClose();
    } catch (err: any) {
      setError(err.message || "Đã xảy ra lỗi, vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  }

  function handleTabChange(tab: "login" | "register") {
    setActiveTab(tab);
    setError("");
  }

  return (
    <div
      className="fixed inset-0 bg-espresso/45 backdrop-blur-md z-[1000] grid place-items-center animate-fade-in p-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
      aria-label={activeTab === "login" ? "Modal đăng nhập" : "Modal đăng ký"}
    >
      <div
        className="bg-surface rounded-[28px] w-full max-w-[460px] p-9 shadow-[0_24px_60px_rgba(59,36,22,0.22)] border border-border-warm/60 relative animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Nút đóng */}
        <button
          className="absolute top-5 right-5 w-9 h-9 rounded-full border border-border-warm bg-surface-warm hover:bg-[#f5eadd] text-text-sub hover:text-espresso flex items-center justify-center transition-all cursor-pointer"
          onClick={onClose}
          aria-label="Đóng modal"
          type="button"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Logo + tiêu đề */}
        <div className="mb-6 text-center">
          <span className="font-serif text-2xl font-bold text-espresso">BBooks</span>
          <p className="text-text-sub text-sm mt-1">
            {activeTab === "login" ? "Chào mừng trở lại!" : "Tạo tài khoản mới"}
          </p>
        </div>

        {/* Tab chuyển đổi */}
        <div className="grid grid-cols-2 bg-surface-warm p-1 border border-border-warm rounded-2xl mb-7">
          {(["login", "register"] as const).map((tab) => (
            <button
              key={tab}
              className={`border-0 bg-transparent py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                activeTab === tab
                  ? "bg-surface text-primary shadow-[0_4px_12px_rgba(59,36,22,0.05)]"
                  : "text-text-sub hover:text-espresso"
              }`}
              onClick={() => handleTabChange(tab)}
              type="button"
            >
              {tab === "login" ? "Đăng nhập" : "Đăng ký"}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Lỗi chung */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-xl text-xs font-medium leading-relaxed">
              {error}
            </div>
          )}

          {/* Họ tên — chỉ hiện khi đăng ký */}
          {activeTab === "register" && (
            <Input
              id="reg-name"
              label="Họ và tên"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Nhập họ và tên đầy đủ"
              prefixIcon={<User className="w-4 h-4" />}
              required
              autoComplete="name"
            />
          )}

          {/* Email */}
          <Input
            id="auth-email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@bbooks.com"
            prefixIcon={<Mail className="w-4 h-4" />}
            required
            autoComplete="email"
          />

          {/* Số điện thoại — chỉ hiện khi đăng ký */}
          {activeTab === "register" && (
            <Input
              id="reg-phone"
              label="Số điện thoại (tùy chọn)"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ví dụ: 0912345678"
              prefixIcon={<Phone className="w-4 h-4" />}
              autoComplete="tel"
            />
          )}

          {/* Mật khẩu */}
          <Input
            id="auth-password"
            label="Mật khẩu"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            prefixIcon={<Lock className="w-4 h-4" />}
            required
            autoComplete={activeTab === "login" ? "current-password" : "new-password"}
          />

          {/* Submit */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            className="w-full mt-1"
          >
            {activeTab === "login" ? "Đăng nhập" : "Đăng ký tài khoản"}
          </Button>
        </form>

        {/* Chuyển tab gợi ý */}
        <p className="text-center text-xs text-text-sub mt-5">
          {activeTab === "login" ? (
            <>
              Chưa có tài khoản?{" "}
              <button
                type="button"
                className="text-primary font-bold hover:underline cursor-pointer"
                onClick={() => handleTabChange("register")}
              >
                Đăng ký ngay
              </button>
            </>
          ) : (
            <>
              Đã có tài khoản?{" "}
              <button
                type="button"
                className="text-primary font-bold hover:underline cursor-pointer"
                onClick={() => handleTabChange("login")}
              >
                Đăng nhập
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
