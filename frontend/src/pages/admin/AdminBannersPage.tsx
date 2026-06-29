import { useEffect, useMemo, useState } from "react";
import { ImagePlus, Layers, MonitorPlay, Pencil, Plus, Save, Search, Sparkles, Trash2, X } from "lucide-react";
import {
  createAdminBanner,
  deleteAdminBanner,
  getAdminBanners,
  updateAdminBanner,
  type AdminBanner,
  type AdminBannerPayload,
  type AdminBannerPosition,
} from "../../services/api";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Spinner } from "../../components/ui/Spinner";
import { useToastStore } from "../../store/useToastStore";

type BannerForm = {
  id?: number;
  title: string;
  subtitle: string;
  imageUrl: string;
  linkUrl: string;
  buttonText: string;
  position: AdminBannerPosition;
  sortOrder: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
};

const emptyForm: BannerForm = {
  title: "",
  subtitle: "",
  imageUrl: "https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1400&q=85",
  linkUrl: "/books",
  buttonText: "Khám phá ngay",
  position: "HOME_HERO",
  sortOrder: "0",
  startDate: "",
  endDate: "",
  isActive: true,
};

const positionOptions: { value: AdminBannerPosition; label: string }[] = [
  { value: "HOME_HERO", label: "Trang chủ · Hero" },
  { value: "HOME_MID", label: "Trang chủ · Mid" },
  { value: "CATEGORY_TOP", label: "Danh mục · Top" },
];

function toDateInput(value: string | null) {
  return value ? value.slice(0, 10) : "";
}

function positionLabel(position: AdminBannerPosition) {
  return positionOptions.find((item) => item.value === position)?.label ?? position;
}

function buildPayload(form: BannerForm): AdminBannerPayload {
  return {
    title: form.title.trim() || undefined,
    subtitle: form.subtitle.trim() || undefined,
    imageUrl: form.imageUrl.trim(),
    linkUrl: form.linkUrl.trim() || undefined,
    buttonText: form.buttonText.trim() || undefined,
    position: form.position,
    sortOrder: Number(form.sortOrder || 0),
    startDate: form.startDate ? new Date(form.startDate).toISOString() : null,
    endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
    isActive: form.isActive,
  };
}

export function AdminBannersPage() {
  const [banners, setBanners] = useState<AdminBanner[]>([]);
  const [search, setSearch] = useState("");
  const [position, setPosition] = useState("");
  const [status, setStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<BannerForm | null>(null);
  const showToast = useToastStore((state) => state.show);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const response = await getAdminBanners({ search: search || undefined, position: position || undefined, isActive: status || undefined });
      setBanners(response.data);
    } catch (error) {
      showToast((error as Error).message || "Không tải được danh sách banner", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const activeCount = useMemo(() => banners.filter((banner) => banner.isActive).length, [banners]);
  const heroCount = useMemo(() => banners.filter((banner) => banner.position === "HOME_HERO").length, [banners]);
  const scheduledCount = useMemo(() => banners.filter((banner) => banner.startDate || banner.endDate).length, [banners]);

  const openEdit = (banner: AdminBanner) => setForm({
    id: banner.id,
    title: banner.title ?? "",
    subtitle: banner.subtitle ?? "",
    imageUrl: banner.imageUrl,
    linkUrl: banner.linkUrl ?? "",
    buttonText: banner.buttonText ?? "",
    position: banner.position,
    sortOrder: String(banner.sortOrder),
    startDate: toDateInput(banner.startDate),
    endDate: toDateInput(banner.endDate),
    isActive: banner.isActive,
  });

  const updateForm = (field: keyof BannerForm, value: string | boolean) => setForm((prev) => prev ? { ...prev, [field]: value } : prev);

  const handleSave = async () => {
    if (!form) return;
    if (!form.imageUrl.trim() || !form.position) { showToast("Vui lòng nhập ảnh banner và vị trí hiển thị.", "warning"); return; }
    setIsSaving(true);
    try {
      const payload = buildPayload(form);
      if (form.id) { await updateAdminBanner(form.id, payload); showToast("Đã cập nhật banner", "success"); }
      else { await createAdminBanner(payload); showToast("Đã tạo banner mới", "success"); }
      setForm(null);
      await loadData();
    } catch (error) { showToast((error as Error).message || "Lưu banner thất bại", "error"); }
    finally { setIsSaving(false); }
  };

  const handleDelete = async (banner: AdminBanner) => {
    if (!confirm(`Ẩn banner "${banner.title || banner.imageUrl}"?`)) return;
    try { await deleteAdminBanner(banner.id); showToast("Đã ẩn banner", "success"); await loadData(); }
    catch (error) { showToast((error as Error).message || "Ẩn banner thất bại", "error"); }
  };

  return <div className="flex flex-col gap-6">
    <section className="relative overflow-hidden rounded-3xl bg-espresso text-surface-warm p-6 md:p-8 shadow-sm"><div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-accent/30 blur-3xl" /><div className="absolute left-1/3 bottom-0 w-44 h-44 rounded-full bg-primary/20 blur-3xl" /><div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-4"><div><p className="text-[11px] font-extrabold uppercase tracking-widest text-accent mb-2">Visual merchandising</p><h1 className="font-serif text-3xl font-bold">Quản lý Banner</h1><p className="text-surface-warm/70 text-sm mt-2 max-w-2xl">Điều phối hero, banner giữa trang và banner đầu danh mục với lịch chạy, CTA và thứ tự ưu tiên.</p></div><Button variant="secondary" onClick={() => setForm(emptyForm)} icon={<Plus className="w-4 h-4" />}>Tạo banner mới</Button></div></section>

    <section className="grid grid-cols-1 md:grid-cols-4 gap-4"><div className="bg-white border border-border-warm rounded-2xl p-5 shadow-sm"><div className="flex items-center gap-3"><ImagePlus className="w-5 h-5 text-primary" /><span className="text-sm text-text-sub">Tổng banner</span></div><p className="text-2xl font-extrabold text-espresso mt-2">{banners.length}</p></div><div className="bg-white border border-border-warm rounded-2xl p-5 shadow-sm"><div className="flex items-center gap-3"><Sparkles className="w-5 h-5 text-emerald-600" /><span className="text-sm text-text-sub">Đang bật</span></div><p className="text-2xl font-extrabold text-espresso mt-2">{activeCount}</p></div><div className="bg-white border border-border-warm rounded-2xl p-5 shadow-sm"><div className="flex items-center gap-3"><MonitorPlay className="w-5 h-5 text-amber-500" /><span className="text-sm text-text-sub">Hero</span></div><p className="text-2xl font-extrabold text-espresso mt-2">{heroCount}</p></div><div className="bg-white border border-border-warm rounded-2xl p-5 shadow-sm"><div className="flex items-center gap-3"><Layers className="w-5 h-5 text-sale" /><span className="text-sm text-text-sub">Có lịch chạy</span></div><p className="text-2xl font-extrabold text-espresso mt-2">{scheduledCount}</p></div></section>

    <section className="bg-white border border-border-warm rounded-2xl p-4 shadow-sm grid grid-cols-1 lg:grid-cols-[1fr_210px_160px_auto] gap-3"><div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-sub" /><input className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border-warm outline-none focus:border-primary text-sm" placeholder="Tìm theo tiêu đề, phụ đề hoặc CTA..." value={search} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => event.key === "Enter" && loadData()} /></div><select className="rounded-xl border border-border-warm px-3 text-sm outline-none focus:border-primary bg-white" value={position} onChange={(event) => setPosition(event.target.value)}><option value="">Tất cả vị trí</option>{positionOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select><select className="rounded-xl border border-border-warm px-3 text-sm outline-none focus:border-primary bg-white" value={status} onChange={(event) => setStatus(event.target.value)}><option value="">Mọi trạng thái</option><option value="true">Active</option><option value="false">Hidden</option></select><Button variant="outline" onClick={loadData}>Lọc</Button></section>

    {isLoading ? <Spinner fullPage label="Đang tải banners..." /> : <section className="grid grid-cols-1 xl:grid-cols-2 gap-5">{banners.map((banner) => <article key={banner.id} className="group overflow-hidden rounded-3xl bg-white border border-border-warm shadow-sm hover:shadow-xl transition-all"><div className="relative h-56 bg-espresso overflow-hidden"><img src={banner.imageUrl} alt={banner.title || "Banner"} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /><div className="absolute inset-0 bg-gradient-to-t from-espresso/90 via-espresso/25 to-transparent" /><div className="absolute top-4 left-4 flex gap-2"><Badge variant={banner.isActive ? "success" : "sale"} size="sm">{banner.isActive ? "Active" : "Hidden"}</Badge><span className="px-2.5 py-1 rounded-full bg-white/90 text-[11px] font-extrabold text-espresso">#{banner.sortOrder}</span></div><div className="absolute bottom-4 left-4 right-4 text-white"><p className="text-[11px] font-extrabold uppercase tracking-widest text-accent mb-1">{positionLabel(banner.position)}</p><h2 className="font-serif text-2xl font-bold line-clamp-1">{banner.title || "Banner chưa đặt tiêu đề"}</h2><p className="text-sm text-white/75 line-clamp-2 mt-1">{banner.subtitle || "Chưa có phụ đề"}</p></div></div><div className="p-5 flex flex-col gap-4"><div className="grid grid-cols-2 gap-3 text-xs text-text-sub"><div><span className="font-bold text-espresso">CTA:</span> {banner.buttonText || "—"}</div><div><span className="font-bold text-espresso">Link:</span> {banner.linkUrl || "—"}</div><div><span className="font-bold text-espresso">Từ:</span> {toDateInput(banner.startDate) || "—"}</div><div><span className="font-bold text-espresso">Đến:</span> {toDateInput(banner.endDate) || "—"}</div></div><div className="flex justify-end gap-2"><Button variant="ghost" size="sm" onClick={() => openEdit(banner)} icon={<Pencil className="w-4 h-4" />}>Sửa</Button><Button variant="danger" size="sm" onClick={() => handleDelete(banner)} icon={<Trash2 className="w-4 h-4" />}>Ẩn</Button></div></div></article>)}{banners.length === 0 && <div className="xl:col-span-2 p-12 bg-white border border-border-warm rounded-3xl text-center text-text-sub">Chưa có banner phù hợp bộ lọc.</div>}</section>}

    {form && <div className="fixed inset-0 bg-espresso/50 z-50 flex items-center justify-center p-4"><div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] overflow-y-auto"><div className="sticky top-0 bg-white border-b border-border-warm px-6 py-4 flex items-center justify-between rounded-t-3xl z-10"><div><h2 className="font-serif text-2xl font-bold text-espresso">{form.id ? "Sửa banner" : "Tạo banner"}</h2><p className="text-xs text-text-sub">Preview trực tiếp, CTA và lịch hiển thị.</p></div><button className="cursor-pointer text-text-sub hover:text-sale" onClick={() => setForm(null)}><X className="w-5 h-5" /></button></div><div className="p-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6"><div className="grid grid-cols-1 md:grid-cols-2 gap-4"><Input label="Tiêu đề" value={form.title} onChange={(event) => updateForm("title", event.target.value)} /><Input label="CTA button" value={form.buttonText} onChange={(event) => updateForm("buttonText", event.target.value)} /><div className="md:col-span-2"><Input label="Phụ đề" value={form.subtitle} onChange={(event) => updateForm("subtitle", event.target.value)} /></div><div className="md:col-span-2"><Input label="URL ảnh" value={form.imageUrl} onChange={(event) => updateForm("imageUrl", event.target.value)} hint="Có thể dùng URL ảnh CDN/Cloudinary/Unsplash." /></div><Input label="Link đích" value={form.linkUrl} onChange={(event) => updateForm("linkUrl", event.target.value)} hint="Ví dụ: /books hoặc /category/..." /><Input label="Thứ tự" type="number" value={form.sortOrder} onChange={(event) => updateForm("sortOrder", event.target.value)} /><div className="flex flex-col gap-1.5"><label className="text-sm font-bold text-espresso">Vị trí</label><select className="h-11 rounded-xl border border-border-warm px-3.5 text-sm outline-none focus:border-accent bg-surface" value={form.position} onChange={(event) => updateForm("position", event.target.value as AdminBannerPosition)}>{positionOptions.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div><Input label="Ngày bắt đầu" type="date" value={form.startDate} onChange={(event) => updateForm("startDate", event.target.value)} /><Input label="Ngày kết thúc" type="date" value={form.endDate} onChange={(event) => updateForm("endDate", event.target.value)} /><label className="md:col-span-2 flex items-center gap-3 text-sm font-bold text-espresso cursor-pointer"><input type="checkbox" checked={form.isActive} onChange={(event) => updateForm("isActive", event.target.checked)} className="w-4 h-4 accent-primary" />Kích hoạt banner</label></div><div className="rounded-3xl bg-espresso p-3 h-fit"><div className="relative rounded-2xl overflow-hidden h-72 bg-surface-warm">{form.imageUrl ? <img src={form.imageUrl} alt="Banner preview" className="w-full h-full object-cover" /> : null}<div className="absolute inset-0 bg-gradient-to-t from-espresso/90 via-espresso/20 to-transparent" /><div className="absolute bottom-4 left-4 right-4 text-white"><p className="text-[10px] uppercase tracking-widest text-accent font-extrabold">Live preview</p><h3 className="font-serif text-2xl font-bold mt-1">{form.title || "Tiêu đề banner"}</h3><p className="text-sm text-white/75 mt-1">{form.subtitle || "Phụ đề banner sẽ hiển thị tại đây."}</p>{form.buttonText && <span className="inline-flex mt-3 rounded-full bg-accent px-4 py-2 text-xs font-extrabold">{form.buttonText}</span>}</div></div></div></div><div className="border-t border-border-warm px-6 py-4 flex justify-end gap-3"><Button variant="ghost" onClick={() => setForm(null)}>Hủy</Button><Button variant="primary" loading={isSaving} onClick={handleSave} icon={<Save className="w-4 h-4" />}>Lưu banner</Button></div></div></div>}
  </div>;
}
