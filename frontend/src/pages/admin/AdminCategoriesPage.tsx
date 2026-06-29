import { useEffect, useMemo, useState } from "react";
import { createAdminCategory, deleteAdminCategory, getAdminCategories, updateAdminCategory, type AdminCategory, type AdminCategoryPayload } from "../../services/api";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { Spinner } from "../../components/ui/Spinner";
import { useToastStore } from "../../store/useToastStore";
import { Edit3, FolderTree, Layers3, Plus, Save, Search, Trash2, X } from "lucide-react";

type CategoryForm = { id?: number; name: string; slug: string; description: string; icon: string; imageUrl: string; parentId: string; sortOrder: string; isActive: boolean };
const emptyForm: CategoryForm = { name: "", slug: "", description: "", icon: "📚", imageUrl: "", parentId: "", sortOrder: "0", isActive: true };

function slugify(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/đ/g, "d").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

export function AdminCategoriesPage() {
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<CategoryForm | null>(null);
  const showToast = useToastStore((s) => s.show);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const res = await getAdminCategories({ search: search || undefined });
      setCategories(res.data);
    } catch (error) {
      showToast((error as Error).message || "Không tải được danh mục", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadData(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, []);

  const activeCount = useMemo(() => categories.filter((c) => c.isActive).length, [categories]);
  const rootCount = useMemo(() => categories.filter((c) => !c.parentId).length, [categories]);

  const openCreate = () => setForm(emptyForm);
  const openEdit = (category: AdminCategory) => setForm({
    id: category.id,
    name: category.name,
    slug: category.slug,
    description: category.description ?? "",
    icon: category.icon ?? "📚",
    imageUrl: category.imageUrl ?? "",
    parentId: category.parentId ? String(category.parentId) : "",
    sortOrder: String(category.sortOrder ?? 0),
    isActive: category.isActive,
  });

  const updateForm = (field: keyof CategoryForm, value: string | boolean) => {
    setForm((prev) => {
      if (!prev) return prev;
      const next = { ...prev, [field]: value };
      if (field === "name" && !prev.id) next.slug = slugify(String(value));
      return next;
    });
  };

  const handleSave = async () => {
    if (!form) return;
    if (!form.name || !form.slug) { showToast("Vui lòng nhập tên danh mục và slug.", "warning"); return; }
    const payload: AdminCategoryPayload = {
      name: form.name.trim(),
      slug: form.slug.trim(),
      description: form.description.trim() || undefined,
      icon: form.icon.trim() || undefined,
      imageUrl: form.imageUrl.trim() || undefined,
      parentId: form.parentId ? Number(form.parentId) : null,
      sortOrder: Number(form.sortOrder || 0),
      isActive: form.isActive,
    };
    setIsSaving(true);
    try {
      if (form.id) { await updateAdminCategory(form.id, payload); showToast(`Đã cập nhật danh mục: ${form.name}`, "success"); }
      else { await createAdminCategory(payload); showToast(`Đã thêm danh mục mới: ${form.name}`, "success"); }
      setForm(null);
      await loadData();
    } catch (error) {
      showToast((error as Error).message || "Lưu danh mục thất bại", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (category: AdminCategory) => {
    if (!confirm(`Ẩn danh mục "${category.name}"?`)) return;
    try { await deleteAdminCategory(category.id); showToast(`Đã ẩn danh mục: ${category.name}`, "success"); await loadData(); }
    catch (error) { showToast((error as Error).message || "Ẩn danh mục thất bại", "error"); }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-primary mb-1">Cấu trúc thư viện</p>
          <h1 className="font-serif text-3xl font-bold text-espresso">Quản lý Danh mục</h1>
          <p className="text-text-sub text-sm mt-1">Tổ chức nhóm sách, icon, thứ tự hiển thị và trạng thái danh mục.</p>
        </div>
        <Button variant="primary" onClick={openCreate} icon={<Plus className="w-4 h-4" />}>Thêm danh mục</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-border-warm rounded-2xl p-5 shadow-sm"><div className="flex items-center gap-3"><FolderTree className="w-5 h-5 text-primary" /><span className="text-sm text-text-sub">Tổng danh mục</span></div><p className="text-2xl font-extrabold text-espresso mt-2">{categories.length}</p></div>
        <div className="bg-white border border-border-warm rounded-2xl p-5 shadow-sm"><div className="flex items-center gap-3"><Layers3 className="w-5 h-5 text-emerald-600" /><span className="text-sm text-text-sub">Đang hiển thị</span></div><p className="text-2xl font-extrabold text-espresso mt-2">{activeCount}</p></div>
        <div className="bg-white border border-border-warm rounded-2xl p-5 shadow-sm"><div className="flex items-center gap-3"><FolderTree className="w-5 h-5 text-amber-500" /><span className="text-sm text-text-sub">Danh mục gốc</span></div><p className="text-2xl font-extrabold text-espresso mt-2">{rootCount}</p></div>
      </div>

      <div className="bg-white border border-border-warm rounded-2xl p-4 shadow-sm flex gap-3">
        <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-sub" /><input className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border-warm outline-none focus:border-primary text-sm" placeholder="Tìm theo tên, slug hoặc mô tả..." value={search} onChange={(e) => setSearch(e.target.value)} onKeyDown={(e) => e.key === "Enter" && loadData()} /></div>
        <Button variant="outline" onClick={loadData}>Tìm</Button>
      </div>

      {isLoading ? <Spinner fullPage label="Đang tải danh mục..." /> : (
        <div className="bg-white border border-border-warm rounded-2xl shadow-sm overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-sm"><thead className="bg-surface-warm text-text-sub"><tr><th className="text-left p-4 font-bold">Danh mục</th><th className="text-left p-4 font-bold">Danh mục cha</th><th className="text-center p-4 font-bold">Sách</th><th className="text-center p-4 font-bold">Thứ tự</th><th className="text-center p-4 font-bold">Trạng thái</th><th className="text-right p-4 font-bold">Hành động</th></tr></thead><tbody>{categories.map((category) => (
          <tr key={category.id} className="border-t border-border-warm hover:bg-surface-warm/50 transition-colors"><td className="p-4"><div className="flex items-center gap-3 min-w-[240px]"><div className="w-11 h-11 rounded-2xl bg-accent-soft flex items-center justify-center text-xl shrink-0">{category.icon ?? "📚"}</div><div className="min-w-0"><p className="font-bold text-espresso line-clamp-1">{category.name}</p><p className="text-xs text-text-sub line-clamp-1">/{category.slug}</p></div></div></td><td className="p-4 text-text-sub">{category.parent?.name ?? "Danh mục gốc"}</td><td className="p-4 text-center font-extrabold text-espresso">{category._count.books}</td><td className="p-4 text-center text-text-sub">{category.sortOrder}</td><td className="p-4 text-center"><Badge variant={category.isActive ? "success" : "sale"} size="sm">{category.isActive ? "Active" : "Hidden"}</Badge></td><td className="p-4"><div className="flex justify-end gap-2"><Button variant="ghost" size="sm" onClick={() => openEdit(category)}><Edit3 className="w-4 h-4" /></Button><Button variant="danger" size="sm" onClick={() => handleDelete(category)}><Trash2 className="w-4 h-4" /></Button></div></td></tr>
        ))}</tbody></table></div></div>
      )}

      {form && <div className="fixed inset-0 bg-espresso/50 z-50 flex items-center justify-center p-4"><div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"><div className="sticky top-0 bg-white border-b border-border-warm px-6 py-4 flex items-center justify-between rounded-t-3xl"><div><h2 className="font-serif text-2xl font-bold text-espresso">{form.id ? "Sửa danh mục" : "Thêm danh mục"}</h2><p className="text-xs text-text-sub">Cập nhật thông tin hiển thị ngoài website.</p></div><button className="cursor-pointer text-text-sub hover:text-sale" onClick={() => setForm(null)}><X className="w-5 h-5" /></button></div><div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4"><Input label="Tên danh mục" value={form.name} onChange={(e) => updateForm("name", e.target.value)} /><Input label="Slug" value={form.slug} onChange={(e) => updateForm("slug", e.target.value)} /><Input label="Icon" value={form.icon} onChange={(e) => updateForm("icon", e.target.value)} hint="Có thể dùng emoji hoặc tên icon nội bộ." /><Input label="Thứ tự" type="number" value={form.sortOrder} onChange={(e) => updateForm("sortOrder", e.target.value)} /><Input label="URL ảnh" value={form.imageUrl} onChange={(e) => updateForm("imageUrl", e.target.value)} wrapperClassName="md:col-span-2" /><div className="md:col-span-2 flex flex-col gap-1.5"><label className="text-sm font-bold text-espresso">Danh mục cha</label><select className="h-11 rounded-xl border border-border-warm px-3.5 text-sm outline-none focus:border-accent bg-surface" value={form.parentId} onChange={(e) => updateForm("parentId", e.target.value)}><option value="">Không có — danh mục gốc</option>{categories.filter((c) => c.id !== form.id).map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div><div className="md:col-span-2 flex flex-col gap-1.5"><label className="text-sm font-bold text-espresso">Mô tả</label><textarea className="min-h-24 rounded-xl border border-border-warm px-3.5 py-3 text-sm outline-none focus:border-accent bg-surface resize-none" value={form.description} onChange={(e) => updateForm("description", e.target.value)} /></div><label className="md:col-span-2 flex items-center gap-3 text-sm font-bold text-espresso cursor-pointer"><input type="checkbox" checked={form.isActive} onChange={(e) => updateForm("isActive", e.target.checked)} className="w-4 h-4 accent-primary" />Hiển thị danh mục ngoài website</label></div><div className="border-t border-border-warm px-6 py-4 flex justify-end gap-3"><Button variant="ghost" onClick={() => setForm(null)}>Hủy</Button><Button variant="primary" loading={isSaving} onClick={handleSave} icon={<Save className="w-4 h-4" />}>Lưu danh mục</Button></div></div></div>}
    </div>
  );
}
