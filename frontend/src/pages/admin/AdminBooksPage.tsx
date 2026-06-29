import { useEffect, useMemo, useState } from "react";
import {
  createAdminBook,
  deleteAdminBook,
  getAdminBooks,
  getCategories,
  updateAdminBook,
  type ApiBook,
} from "../../services/api";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Badge } from "../../components/ui/Badge";
import { Spinner } from "../../components/ui/Spinner";
import { useToastStore } from "../../store/useToastStore";
import { formatPrice } from "../../utils/formatPrice";
import { BookOpen, Edit3, Plus, Search, Trash2, X, Save, Star, Package } from "lucide-react";

type CategoryOption = { id: string; name: string; slug: string; icon: string };

type BookForm = {
  id?: string;
  title: string;
  slug: string;
  author: string;
  price: string;
  originalPrice: string;
  stock: string;
  coverUrl: string;
  categoryId: string;
  isFeatured: boolean;
};

const emptyForm: BookForm = {
  title: "",
  slug: "",
  author: "",
  price: "",
  originalPrice: "",
  stock: "0",
  coverUrl: "",
  categoryId: "",
  isFeatured: false,
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function AdminBooksPage() {
  const [books, setBooks] = useState<ApiBook[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<BookForm | null>(null);
  const showToast = useToastStore((s) => s.show);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [bookRes, cats] = await Promise.all([
        getAdminBooks({ search: search || undefined, limit: 30 }),
        getCategories(),
      ]);
      setBooks(bookRes.data);
      setCategories(cats);
    } catch (error) {
      showToast((error as Error).message || "Không tải được dữ liệu", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalValue = useMemo(
    () => books.reduce((sum, book) => sum + Number(book.price) * (book.stock ?? 0), 0),
    [books],
  );

  const openCreate = () => setForm(emptyForm);

  const openEdit = (book: ApiBook) => {
    setForm({
      id: book.id,
      title: book.title,
      slug: book.slug,
      author: book.author,
      price: String(book.price),
      originalPrice: book.originalPrice ? String(book.originalPrice) : "",
      stock: String(book.stock ?? 0),
      coverUrl: book.coverUrl ?? "",
      categoryId: book.category?.id ? String(book.category.id) : "",
      isFeatured: book.isFeatured,
    });
  };

  const updateForm = (field: keyof BookForm, value: string | boolean) => {
    setForm((prev) => {
      if (!prev) return prev;
      const next = { ...prev, [field]: value };
      if (field === "title" && !prev.id) next.slug = slugify(String(value));
      return next;
    });
  };

  const handleSave = async () => {
    if (!form) return;
    if (!form.title || !form.slug || !form.author || !form.price) {
      showToast("Vui lòng nhập tên sách, slug, tác giả và giá.", "warning");
      return;
    }

    const payload = {
      title: form.title,
      slug: form.slug,
      author: form.author,
      price: Number(form.price),
      originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
      stock: Number(form.stock || 0),
      coverUrl: form.coverUrl || undefined,
      categoryId: form.categoryId ? Number(form.categoryId) : undefined,
      isFeatured: form.isFeatured,
    };

    setIsSaving(true);
    try {
      if (form.id) {
        await updateAdminBook(form.id, payload);
        showToast(`Đã cập nhật sách: ${form.title}`, "success");
      } else {
        await createAdminBook(payload);
        showToast(`Đã thêm sách mới: ${form.title}`, "success");
      }
      setForm(null);
      await loadData();
    } catch (error) {
      showToast((error as Error).message || "Lưu sách thất bại", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (book: ApiBook) => {
    if (!confirm(`Ẩn sách "${book.title}"?`)) return;
    try {
      await deleteAdminBook(book.id);
      showToast(`Đã xoá/ẩn sách: ${book.title}`, "success");
      await loadData();
    } catch (error) {
      showToast((error as Error).message || "Xoá sách thất bại", "error");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <p className="text-[11px] font-extrabold uppercase tracking-widest text-primary mb-1">Kho sách</p>
          <h1 className="font-serif text-3xl font-bold text-espresso">Quản lý Sách</h1>
          <p className="text-text-sub text-sm mt-1">Thêm, sửa, ẩn sách và quản lý tồn kho.</p>
        </div>
        <Button variant="primary" onClick={openCreate}>
          <Plus className="w-4 h-4" /> Thêm sách
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-border-warm rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3"><BookOpen className="w-5 h-5 text-primary" /><span className="text-sm text-text-sub">Tổng sách</span></div>
          <p className="text-2xl font-extrabold text-espresso mt-2">{books.length}</p>
        </div>
        <div className="bg-white border border-border-warm rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3"><Package className="w-5 h-5 text-emerald-600" /><span className="text-sm text-text-sub">Giá trị tồn kho</span></div>
          <p className="text-2xl font-extrabold text-espresso mt-2">{formatPrice(totalValue)}</p>
        </div>
        <div className="bg-white border border-border-warm rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-3"><Star className="w-5 h-5 text-amber-500" /><span className="text-sm text-text-sub">Sách nổi bật</span></div>
          <p className="text-2xl font-extrabold text-espresso mt-2">{books.filter((b) => b.isFeatured).length}</p>
        </div>
      </div>

      <div className="bg-white border border-border-warm rounded-2xl p-4 shadow-sm flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-sub" />
          <input
            className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border-warm outline-none focus:border-primary text-sm"
            placeholder="Tìm theo tên sách, tác giả, ISBN..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && loadData()}
          />
        </div>
        <Button variant="outline" onClick={loadData}>Tìm</Button>
      </div>

      {isLoading ? (
        <Spinner fullPage label="Đang tải sách..." />
      ) : (
        <div className="bg-white border border-border-warm rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-surface-warm text-text-sub">
                <tr>
                  <th className="text-left p-4 font-bold">Sách</th>
                  <th className="text-left p-4 font-bold">Danh mục</th>
                  <th className="text-right p-4 font-bold">Giá</th>
                  <th className="text-center p-4 font-bold">Kho</th>
                  <th className="text-center p-4 font-bold">Nổi bật</th>
                  <th className="text-right p-4 font-bold">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {books.map((book) => (
                  <tr key={book.id} className="border-t border-border-warm hover:bg-surface-warm/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3 min-w-[260px]">
                        <div className="w-11 h-14 rounded-lg overflow-hidden bg-surface-warm border border-border-warm shrink-0">
                          {book.coverUrl && <img src={book.coverUrl} alt={book.title} className="w-full h-full object-cover" />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-espresso line-clamp-1">{book.title}</p>
                          <p className="text-xs text-text-sub line-clamp-1">{book.author}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-text-sub">{book.category?.name ?? "—"}</td>
                    <td className="p-4 text-right font-extrabold text-sale">{formatPrice(Number(book.price))}</td>
                    <td className="p-4 text-center">
                      <Badge variant={book.stock <= 0 ? "sale" : book.stock <= 5 ? "accent" : "success"} size="sm">
                        {book.stock}
                      </Badge>
                    </td>
                    <td className="p-4 text-center">{book.isFeatured ? <Badge variant="primary" size="sm">Có</Badge> : "—"}</td>
                    <td className="p-4">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(book)}><Edit3 className="w-4 h-4" /></Button>
                        <Button variant="danger" size="sm" onClick={() => handleDelete(book)}><Trash2 className="w-4 h-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {form && (
        <div className="fixed inset-0 bg-espresso/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-border-warm px-6 py-4 flex items-center justify-between rounded-t-3xl">
              <h2 className="font-serif text-2xl font-bold text-espresso">{form.id ? "Sửa sách" : "Thêm sách mới"}</h2>
              <button onClick={() => setForm(null)} className="text-text-sub hover:text-espresso cursor-pointer"><X className="w-5 h-5" /></button>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input label="Tên sách *" value={form.title} onChange={(e) => updateForm("title", e.target.value)} />
              <Input label="Slug *" value={form.slug} onChange={(e) => updateForm("slug", e.target.value)} />
              <Input label="Tác giả *" value={form.author} onChange={(e) => updateForm("author", e.target.value)} />
              <Input label="Ảnh bìa URL" value={form.coverUrl} onChange={(e) => updateForm("coverUrl", e.target.value)} />
              <Input label="Giá bán *" type="number" value={form.price} onChange={(e) => updateForm("price", e.target.value)} />
              <Input label="Giá gốc" type="number" value={form.originalPrice} onChange={(e) => updateForm("originalPrice", e.target.value)} />
              <Input label="Tồn kho" type="number" value={form.stock} onChange={(e) => updateForm("stock", e.target.value)} />
              <label className="flex flex-col gap-1.5 text-sm font-semibold text-espresso">
                Danh mục
                <select
                  className="w-full rounded-xl border border-border-warm bg-white px-3 py-2.5 outline-none focus:border-primary"
                  value={form.categoryId}
                  onChange={(e) => updateForm("categoryId", e.target.value)}
                >
                  <option value="">Không chọn</option>
                  {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
                </select>
              </label>
              <label className="md:col-span-2 flex items-center gap-3 p-4 rounded-2xl bg-surface-warm cursor-pointer">
                <input type="checkbox" checked={form.isFeatured} onChange={(e) => updateForm("isFeatured", e.target.checked)} />
                <span className="font-semibold text-espresso">Đánh dấu là sách nổi bật</span>
              </label>
            </div>

            <div className="px-6 py-4 border-t border-border-warm flex justify-end gap-3">
              <Button variant="outline" onClick={() => setForm(null)}>Huỷ</Button>
              <Button variant="primary" onClick={handleSave} loading={isSaving}>
                <Save className="w-4 h-4" /> Lưu sách
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
