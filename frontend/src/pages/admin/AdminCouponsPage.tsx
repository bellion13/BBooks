import { useEffect, useMemo, useState } from "react";
import { createAdminCoupon, deleteAdminCoupon, getAdminCoupons, updateAdminCoupon, type AdminCoupon, type AdminCouponPayload, type AdminCouponType } from "../../services/api";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { Spinner } from "../../components/ui/Spinner";
import { useToastStore } from "../../store/useToastStore";
import { Edit3, Gift, Percent, Plus, Save, Search, Ticket, Trash2, X, Zap } from "lucide-react";

type CouponForm = { id?: string; code: string; name: string; type: AdminCouponType; value: string; minOrderValue: string; maxDiscount: string; usageLimit: string; startDate: string; endDate: string; isActive: boolean };
const emptyForm: CouponForm = { code: "", name: "", type: "PERCENT", value: "10", minOrderValue: "0", maxDiscount: "", usageLimit: "", startDate: "", endDate: "", isActive: true };

function toDateInput(value: string | null) { return value ? value.slice(0, 10) : ""; }
function formatCurrency(value: string | number | null | undefined) { return Number(value ?? 0).toLocaleString("vi-VN") + "đ"; }
function formatCouponValue(coupon: AdminCoupon) { if (coupon.type === "PERCENT") return `${Number(coupon.value)}%`; if (coupon.type === "FREE_SHIP") return "Freeship"; return formatCurrency(coupon.value); }
function typeLabel(type: AdminCouponType) { if (type === "PERCENT") return "Phần trăm"; if (type === "FREE_SHIP") return "Miễn ship"; return "Số tiền"; }

export function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<AdminCoupon[]>([]);
  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<CouponForm | null>(null);
  const showToast = useToastStore((s) => s.show);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await getAdminCoupons({ search: search || undefined, type: type || undefined, isActive: status || undefined });
      setCoupons(res.data);
    } catch (error) { showToast((error as Error).message || "Không tải được mã giảm giá", "error"); }
    finally { setIsLoading(false); }
  };
  useEffect(() => { loadData(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const activeCount = useMemo(() => coupons.filter((c) => c.isActive).length, [coupons]);
  const totalUsage = useMemo(() => coupons.reduce((sum, c) => sum + c.usedCount, 0), [coupons]);
  const expiringCount = useMemo(() => { const now = Date.now(); const next7Days = now + 7 * 24 * 60 * 60 * 1000; return coupons.filter((c) => c.endDate && new Date(c.endDate).getTime() <= next7Days && new Date(c.endDate).getTime() >= now).length; }, [coupons]);

  const openCreate = () => setForm(emptyForm);
  const openEdit = (coupon: AdminCoupon) => setForm({ id: coupon.id, code: coupon.code, name: coupon.name ?? "", type: coupon.type, value: String(Number(coupon.value)), minOrderValue: String(Number(coupon.minOrderValue ?? 0)), maxDiscount: coupon.maxDiscount ? String(Number(coupon.maxDiscount)) : "", usageLimit: coupon.usageLimit ? String(coupon.usageLimit) : "", startDate: toDateInput(coupon.startDate), endDate: toDateInput(coupon.endDate), isActive: coupon.isActive });
  const updateForm = (field: keyof CouponForm, value: string | boolean) => setForm((prev) => prev ? { ...prev, [field]: field === "code" ? String(value).toUpperCase() : value } : prev);

  const handleSave = async () => {
    if (!form) return;
    if (!form.code.trim() || !form.type || Number(form.value) < 0) { showToast("Vui lòng nhập mã, loại và giá trị hợp lệ.", "warning"); return; }
    const payload: AdminCouponPayload = { code: form.code.trim().toUpperCase(), name: form.name.trim() || undefined, type: form.type, value: Number(form.value || 0), minOrderValue: Number(form.minOrderValue || 0), maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : null, usageLimit: form.usageLimit ? Number(form.usageLimit) : null, startDate: form.startDate ? new Date(form.startDate).toISOString() : null, endDate: form.endDate ? new Date(form.endDate).toISOString() : null, isActive: form.isActive };
    setIsSaving(true);
    try { if (form.id) { await updateAdminCoupon(form.id, payload); showToast(`Đã cập nhật mã: ${form.code}`, "success"); } else { await createAdminCoupon(payload); showToast(`Đã tạo mã mới: ${form.code}`, "success"); } setForm(null); await loadData(); }
    catch (error) { showToast((error as Error).message || "Lưu mã giảm giá thất bại", "error"); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (coupon: AdminCoupon) => {
    if (!confirm(`Ẩn mã giảm giá "${coupon.code}"?`)) return;
    try { await deleteAdminCoupon(coupon.id); showToast(`Đã ẩn mã: ${coupon.code}`, "success"); await loadData(); }
    catch (error) { showToast((error as Error).message || "Ẩn mã giảm giá thất bại", "error"); }
  };

  return <div className="flex flex-col gap-6">
    <div className="relative overflow-hidden rounded-3xl bg-espresso text-surface-warm p-6 md:p-8 shadow-sm"><div className="absolute -right-16 -top-16 w-56 h-56 rounded-full bg-accent/25 blur-3xl" /><div className="absolute right-16 bottom-0 w-32 h-32 rounded-full bg-primary/20 blur-2xl" /><div className="relative flex flex-col md:flex-row md:items-end justify-between gap-4"><div><p className="text-[11px] font-extrabold uppercase tracking-widest text-accent mb-2">Revenue engine</p><h1 className="font-serif text-3xl font-bold">Quản lý Mã giảm giá</h1><p className="text-surface-warm/70 text-sm mt-2 max-w-2xl">Tạo campaign khuyến mãi, giới hạn lượt dùng, điều kiện đơn tối thiểu và lịch kích hoạt coupon.</p></div><Button variant="secondary" onClick={openCreate} icon={<Plus className="w-4 h-4" />}>Tạo mã mới</Button></div></div>

    <div className="grid grid-cols-1 md:grid-cols-4 gap-4"><div className="bg-white border border-border-warm rounded-2xl p-5 shadow-sm"><div className="flex items-center gap-3"><Ticket className="w-5 h-5 text-primary" /><span className="text-sm text-text-sub">Tổng mã</span></div><p className="text-2xl font-extrabold text-espresso mt-2">{coupons.length}</p></div><div className="bg-white border border-border-warm rounded-2xl p-5 shadow-sm"><div className="flex items-center gap-3"><Zap className="w-5 h-5 text-emerald-600" /><span className="text-sm text-text-sub">Đang chạy</span></div><p className="text-2xl font-extrabold text-espresso mt-2">{activeCount}</p></div><div className="bg-white border border-border-warm rounded-2xl p-5 shadow-sm"><div className="flex items-center gap-3"><Gift className="w-5 h-5 text-amber-500" /><span className="text-sm text-text-sub">Lượt dùng</span></div><p className="text-2xl font-extrabold text-espresso mt-2">{totalUsage}</p></div><div className="bg-white border border-border-warm rounded-2xl p-5 shadow-sm"><div className="flex items-center gap-3"><Percent className="w-5 h-5 text-sale" /><span className="text-sm text-text-sub">Sắp hết hạn</span></div><p className="text-2xl font-extrabold text-espresso mt-2">{expiringCount}</p></div></div>

    <div className="bg-white border border-border-warm rounded-2xl p-4 shadow-sm grid grid-cols-1 lg:grid-cols-[1fr_180px_160px_auto] gap-3"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-sub" /><input className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border-warm outline-none focus:border-primary text-sm" placeholder="Tìm theo mã hoặc tên chiến dịch..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && loadData()} /></div><select className="rounded-xl border border-border-warm px-3 text-sm outline-none focus:border-primary bg-white" value={type} onChange={(e) => setType(e.target.value)}><option value="">Tất cả loại</option><option value="PERCENT">Phần trăm</option><option value="FIXED_AMOUNT">Số tiền</option><option value="FREE_SHIP">Miễn ship</option></select><select className="rounded-xl border border-border-warm px-3 text-sm outline-none focus:border-primary bg-white" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">Mọi trạng thái</option><option value="true">Active</option><option value="false">Hidden</option></select><Button variant="outline" onClick={loadData}>Lọc</Button></div>

    {isLoading ? <Spinner fullPage label="Đang tải mã giảm giá..." /> : <div className="bg-white border border-border-warm rounded-2xl shadow-sm overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-surface-warm text-text-sub"><tr><th className="text-left p-4 font-bold">Coupon</th><th className="text-left p-4 font-bold">Loại</th><th className="text-right p-4 font-bold">Giá trị</th><th className="text-right p-4 font-bold">Đơn tối thiểu</th><th className="text-center p-4 font-bold">Sử dụng</th><th className="text-center p-4 font-bold">Hiệu lực</th><th className="text-center p-4 font-bold">Trạng thái</th><th className="text-right p-4 font-bold">Hành động</th></tr></thead><tbody>{coupons.map((coupon) => <tr key={coupon.id} className="border-t border-border-warm hover:bg-surface-warm/50 transition-colors"><td className="p-4"><div className="min-w-[220px]"><p className="font-extrabold text-espresso tracking-wide">{coupon.code}</p><p className="text-xs text-text-sub line-clamp-1">{coupon.name || "Không có tên chiến dịch"}</p></div></td><td className="p-4 text-text-sub">{typeLabel(coupon.type)}</td><td className="p-4 text-right font-extrabold text-primary">{formatCouponValue(coupon)}</td><td className="p-4 text-right text-text-sub">{formatCurrency(coupon.minOrderValue)}</td><td className="p-4 text-center text-text-sub">{coupon.usedCount}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}</td><td className="p-4 text-center text-xs text-text-sub">{coupon.startDate ? toDateInput(coupon.startDate) : "—"}<br />→ {coupon.endDate ? toDateInput(coupon.endDate) : "—"}</td><td className="p-4 text-center"><Badge variant={coupon.isActive ? "success" : "sale"} size="sm">{coupon.isActive ? "Active" : "Hidden"}</Badge></td><td className="p-4"><div className="flex justify-end gap-2"><Button variant="ghost" size="sm" onClick={() => openEdit(coupon)}><Edit3 className="w-4 h-4" /></Button><Button variant="danger" size="sm" onClick={() => handleDelete(coupon)}><Trash2 className="w-4 h-4" /></Button></div></td></tr>)}</tbody></table>{coupons.length === 0 && <div className="p-10 text-center text-text-sub">Chưa có mã giảm giá phù hợp bộ lọc.</div>}</div></div>}

    {form && <div className="fixed inset-0 bg-espresso/50 z-50 flex items-center justify-center p-4"><div className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"><div className="sticky top-0 bg-white border-b border-border-warm px-6 py-4 flex items-center justify-between rounded-t-3xl"><div><h2 className="font-serif text-2xl font-bold text-espresso">{form.id ? "Sửa mã giảm giá" : "Tạo mã giảm giá"}</h2><p className="text-xs text-text-sub">Thiết lập điều kiện áp dụng và giới hạn campaign.</p></div><button className="cursor-pointer text-text-sub hover:text-sale" onClick={() => setForm(null)}><X className="w-5 h-5" /></button></div><div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4"><Input label="Mã coupon" value={form.code} onChange={(e) => updateForm("code", e.target.value)} hint="Ví dụ: SUMMER25" /><Input label="Tên chiến dịch" value={form.name} onChange={(e) => updateForm("name", e.target.value)} /><div className="flex flex-col gap-1.5"><label className="text-sm font-bold text-espresso">Loại giảm</label><select className="h-11 rounded-xl border border-border-warm px-3.5 text-sm outline-none focus:border-accent bg-surface" value={form.type} onChange={(e) => updateForm("type", e.target.value as AdminCouponType)}><option value="PERCENT">Giảm theo %</option><option value="FIXED_AMOUNT">Giảm số tiền</option><option value="FREE_SHIP">Miễn phí vận chuyển</option></select></div><Input label={form.type === "PERCENT" ? "Giá trị (%)" : "Giá trị (VNĐ)"} type="number" value={form.value} onChange={(e) => updateForm("value", e.target.value)} /><Input label="Đơn tối thiểu" type="number" value={form.minOrderValue} onChange={(e) => updateForm("minOrderValue", e.target.value)} /><Input label="Giảm tối đa" type="number" value={form.maxDiscount} onChange={(e) => updateForm("maxDiscount", e.target.value)} hint="Để trống nếu không giới hạn." /><Input label="Giới hạn lượt dùng" type="number" value={form.usageLimit} onChange={(e) => updateForm("usageLimit", e.target.value)} /><Input label="Ngày bắt đầu" type="date" value={form.startDate} onChange={(e) => updateForm("startDate", e.target.value)} /><Input label="Ngày kết thúc" type="date" value={form.endDate} onChange={(e) => updateForm("endDate", e.target.value)} /><label className="md:col-span-2 flex items-center gap-3 text-sm font-bold text-espresso cursor-pointer"><input type="checkbox" checked={form.isActive} onChange={(e) => updateForm("isActive", e.target.checked)} className="w-4 h-4 accent-primary" />Kích hoạt mã giảm giá</label></div><div className="border-t border-border-warm px-6 py-4 flex justify-end gap-3"><Button variant="ghost" onClick={() => setForm(null)}>Hủy</Button><Button variant="primary" loading={isSaving} onClick={handleSave} icon={<Save className="w-4 h-4" />}>Lưu coupon</Button></div></div></div>}
  </div>;
}
