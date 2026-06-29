import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Ban, Edit3, MessageSquareText, Plus, Save, Search, ShieldCheck, Star, Trash2, X } from "lucide-react";
import {
  createModerationWord,
  deleteAdminReview,
  deleteModerationWord,
  getAdminReviews,
  getModerationWords,
  updateModerationWord,
  type AdminReview,
  type AdminReviewStats,
  type ModerationWord,
} from "../../services/api";
import { Badge } from "../../components/ui/Badge";
import { Button } from "../../components/ui/Button";
import { Spinner } from "../../components/ui/Spinner";
import { useToastStore } from "../../store/useToastStore";

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function StatCard({ label, value, icon }: { label: string; value: string | number; icon: ReactNode }) {
  return (
    <div className="bg-white border border-border-warm rounded-2xl p-5 shadow-sm">
      <div className="flex items-center gap-3 text-text-sub text-sm">
        {icon}
        <span>{label}</span>
      </div>
      <p className="text-2xl font-extrabold text-espresso mt-2">{value}</p>
    </div>
  );
}

const emptyWordForm = { word: "", note: "" };

export function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReview[]>([]);
  const [stats, setStats] = useState<AdminReviewStats>({ total: 0, approved: 0, pending: 0, averageRating: 0 });
  const [words, setWords] = useState<ModerationWord[]>([]);
  const [search, setSearch] = useState("");
  const [rating, setRating] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [wordSearch, setWordSearch] = useState("");
  const [wordForm, setWordForm] = useState(emptyWordForm);
  const [editingWordId, setEditingWordId] = useState<string | null>(null);
  const [editingWordForm, setEditingWordForm] = useState(emptyWordForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isWordsLoading, setIsWordsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [wordBusyId, setWordBusyId] = useState<string | null>(null);
  const showToast = useToastStore((state) => state.show);

  const loadReviews = async (nextPage = page) => {
    setIsLoading(true);
    try {
      const response = await getAdminReviews({
        page: nextPage,
        search: search || undefined,
        rating: rating || undefined,
      });
      setReviews(response.data);
      setTotalPages(response.meta?.totalPages ?? 1);
      setStats((response.meta as typeof response.meta & { stats?: AdminReviewStats })?.stats ?? stats);
    } catch (error) {
      showToast((error as Error).message || "Không tải được danh sách đánh giá", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const loadWords = async () => {
    setIsWordsLoading(true);
    try {
      const response = await getModerationWords({ search: wordSearch || undefined });
      setWords(response.data);
    } catch (error) {
      showToast((error as Error).message || "Không tải được danh sách từ cấm", "error");
    } finally {
      setIsWordsLoading(false);
    }
  };

  useEffect(() => {
    loadReviews(1);
    loadWords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeWordCount = useMemo(() => words.filter((word) => word.isActive).length, [words]);

  const handleFilter = () => {
    setPage(1);
    loadReviews(1);
  };

  const handleDelete = async (review: AdminReview) => {
    if (!confirm(`Xóa vĩnh viễn đánh giá của ${review.user.fullName} cho sách "${review.book.title}"?`)) return;

    setBusyId(review.id);
    try {
      await deleteAdminReview(review.id);
      showToast("Đã xóa đánh giá", "success");
      await loadReviews();
    } catch (error) {
      showToast((error as Error).message || "Xóa đánh giá thất bại", "error");
    } finally {
      setBusyId(null);
    }
  };

  const handleCreateWord = async () => {
    if (!wordForm.word.trim()) {
      showToast("Vui lòng nhập từ cấm", "error");
      return;
    }

    setWordBusyId("new");
    try {
      await createModerationWord({ word: wordForm.word, note: wordForm.note || undefined, isActive: true });
      setWordForm(emptyWordForm);
      showToast("Đã thêm từ cấm", "success");
      await loadWords();
    } catch (error) {
      showToast((error as Error).message || "Thêm từ cấm thất bại", "error");
    } finally {
      setWordBusyId(null);
    }
  };

  const startEditWord = (word: ModerationWord) => {
    setEditingWordId(word.id);
    setEditingWordForm({ word: word.word, note: word.note ?? "" });
  };

  const handleUpdateWord = async (word: ModerationWord) => {
    if (!editingWordForm.word.trim()) {
      showToast("Vui lòng nhập từ cấm", "error");
      return;
    }

    setWordBusyId(word.id);
    try {
      await updateModerationWord(word.id, { word: editingWordForm.word, note: editingWordForm.note });
      setEditingWordId(null);
      showToast("Đã cập nhật từ cấm", "success");
      await loadWords();
    } catch (error) {
      showToast((error as Error).message || "Cập nhật từ cấm thất bại", "error");
    } finally {
      setWordBusyId(null);
    }
  };

  const handleToggleWord = async (word: ModerationWord) => {
    setWordBusyId(word.id);
    try {
      await updateModerationWord(word.id, { isActive: !word.isActive });
      showToast(word.isActive ? "Đã tắt từ cấm" : "Đã bật từ cấm", "success");
      await loadWords();
    } catch (error) {
      showToast((error as Error).message || "Cập nhật từ cấm thất bại", "error");
    } finally {
      setWordBusyId(null);
    }
  };

  const handleDeleteWord = async (word: ModerationWord) => {
    if (!confirm(`Xóa từ cấm "${word.word}"?`)) return;

    setWordBusyId(word.id);
    try {
      await deleteModerationWord(word.id);
      showToast("Đã xóa từ cấm", "success");
      await loadWords();
    } catch (error) {
      showToast((error as Error).message || "Xóa từ cấm thất bại", "error");
    } finally {
      setWordBusyId(null);
    }
  };

  const goToPage = (nextPage: number) => {
    setPage(nextPage);
    loadReviews(nextPage);
  };

  return (
    <div className="flex flex-col gap-6">
      <section className="relative overflow-hidden rounded-3xl bg-espresso text-surface-warm p-6 md:p-8 shadow-sm">
        <div className="absolute -right-16 -top-16 w-64 h-64 rounded-full bg-accent/30 blur-3xl" />
        <div className="absolute left-1/3 bottom-0 w-44 h-44 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-accent mb-2">Community safety</p>
            <h1 className="font-serif text-3xl font-bold">Bình luận & từ cấm</h1>
            <p className="text-surface-warm/70 text-sm mt-2 max-w-2xl">
              Review được tự duyệt ngay. Từ cấm sẽ tự động hiển thị thành *** ở phía khách hàng; admin chỉ cần xóa bình luận không phù hợp.
            </p>
          </div>
          <Badge variant="success" size="md">
            {activeWordCount} từ cấm đang bật
          </Badge>
        </div>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard label="Tổng đánh giá" value={stats.total} icon={<MessageSquareText className="w-5 h-5 text-primary" />} />
        <StatCard label="Đang hiển thị" value={stats.approved} icon={<ShieldCheck className="w-5 h-5 text-emerald-600" />} />
        <StatCard label="Từ cấm đang bật" value={activeWordCount} icon={<Ban className="w-5 h-5 text-rose-500" />} />
        <StatCard label="Rating TB" value={stats.averageRating.toFixed(1)} icon={<Star className="w-5 h-5 text-amber-400" />} />
      </section>

      <section className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-6 items-start">
        <div className="flex flex-col gap-4">
          <section className="bg-white border border-border-warm rounded-2xl p-4 shadow-sm grid grid-cols-1 lg:grid-cols-[1fr_150px_auto] gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-sub" />
              <input
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-border-warm outline-none focus:border-primary text-sm"
                placeholder="Tìm theo sách, người dùng hoặc nội dung..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && handleFilter()}
              />
            </div>
            <select className="rounded-xl border border-border-warm px-3 text-sm outline-none focus:border-primary bg-white" value={rating} onChange={(event) => setRating(event.target.value)}>
              <option value="">Mọi số sao</option>
              {[5, 4, 3, 2, 1].map((star) => <option key={star} value={star}>{star} sao</option>)}
            </select>
            <Button variant="outline" onClick={handleFilter}>Lọc</Button>
          </section>

          {isLoading ? (
            <Spinner fullPage label="Đang tải đánh giá..." />
          ) : (
            <section className="bg-white border border-border-warm rounded-3xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[880px] text-sm">
                  <thead className="bg-surface-warm text-text-sub">
                    <tr>
                      <th className="px-5 py-4 text-left font-extrabold">Đánh giá</th>
                      <th className="px-5 py-4 text-left font-extrabold">Sách</th>
                      <th className="px-5 py-4 text-left font-extrabold">Người dùng</th>
                      <th className="px-5 py-4 text-right font-extrabold">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border-warm">
                    {reviews.map((review) => (
                      <tr key={review.id} className="align-top hover:bg-surface-warm/35 transition-colors">
                        <td className="px-5 py-4 max-w-md">
                          <div className="flex items-center gap-1 text-amber-400 mb-2">
                            {Array.from({ length: 5 }, (_, index) => <Star key={index} className={`w-4 h-4 ${index < review.rating ? "fill-current" : "text-stone-300"}`} />)}
                          </div>
                          <p className="font-bold text-espresso">{review.title || "Không có tiêu đề"}</p>
                          <p className="text-text-sub mt-1 line-clamp-3">{review.content || "Người dùng không để lại nhận xét."}</p>
                          <p className="text-xs text-text-sub mt-2">{formatDate(review.createdAt)}</p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <img src={review.book.coverUrl || "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=100&q=80"} alt={review.book.title} className="w-11 h-14 rounded-lg object-cover bg-surface-warm" />
                            <div>
                              <p className="font-bold text-espresso line-clamp-2">{review.book.title}</p>
                              <p className="text-xs text-text-sub">/{review.book.slug}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <p className="font-bold text-espresso">{review.user.fullName}</p>
                          <p className="text-xs text-text-sub">{review.user.email}</p>
                        </td>
                        <td className="px-5 py-4">
                          <div className="flex justify-end">
                            <Button variant="danger" size="sm" loading={busyId === review.id} onClick={() => handleDelete(review)} icon={<Trash2 className="w-4 h-4" />}>Xóa</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {reviews.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-5 py-12 text-center text-text-sub">Không có đánh giá phù hợp bộ lọc.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          <div className="flex items-center justify-end gap-3">
            <Button variant="outline" disabled={page <= 1} onClick={() => goToPage(page - 1)}>Trang trước</Button>
            <span className="text-sm font-bold text-text-sub">Trang {page}/{totalPages}</span>
            <Button variant="outline" disabled={page >= totalPages} onClick={() => goToPage(page + 1)}>Trang sau</Button>
          </div>
        </div>

        <aside className="bg-white border border-border-warm rounded-3xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-border-warm bg-surface-warm/60">
            <p className="text-[11px] font-extrabold uppercase tracking-widest text-primary mb-1">Auto mask</p>
            <h2 className="font-serif text-2xl font-bold text-espresso">Quản lý từ cấm</h2>
            <p className="text-sm text-text-sub mt-1">Từ đang bật sẽ được che thành *** khi khách xem review.</p>
          </div>

          <div className="p-5 space-y-4">
            <div className="grid grid-cols-1 gap-2">
              <input
                className="w-full px-3 py-2.5 rounded-xl border border-border-warm outline-none focus:border-primary text-sm"
                placeholder="Nhập từ cấm..."
                value={wordForm.word}
                onChange={(event) => setWordForm((prev) => ({ ...prev, word: event.target.value }))}
              />
              <input
                className="w-full px-3 py-2.5 rounded-xl border border-border-warm outline-none focus:border-primary text-sm"
                placeholder="Ghi chú nội bộ (không bắt buộc)"
                value={wordForm.note}
                onChange={(event) => setWordForm((prev) => ({ ...prev, note: event.target.value }))}
                onKeyDown={(event) => event.key === "Enter" && handleCreateWord()}
              />
              <Button variant="primary" loading={wordBusyId === "new"} onClick={handleCreateWord} icon={<Plus className="w-4 h-4" />}>Thêm từ cấm</Button>
            </div>

            <div className="flex gap-2">
              <input
                className="flex-1 px-3 py-2.5 rounded-xl border border-border-warm outline-none focus:border-primary text-sm"
                placeholder="Tìm từ cấm..."
                value={wordSearch}
                onChange={(event) => setWordSearch(event.target.value)}
                onKeyDown={(event) => event.key === "Enter" && loadWords()}
              />
              <Button variant="outline" onClick={loadWords}>Tìm</Button>
            </div>

            {isWordsLoading ? (
              <div className="py-8"><Spinner label="Đang tải từ cấm..." /></div>
            ) : (
              <div className="space-y-3 max-h-[620px] overflow-y-auto pr-1">
                {words.map((word) => {
                  const isEditing = editingWordId === word.id;
                  return (
                    <div key={word.id} className="rounded-2xl border border-border-warm p-3 bg-white hover:bg-surface-warm/40 transition-colors">
                      {isEditing ? (
                        <div className="space-y-2">
                          <input
                            className="w-full px-3 py-2 rounded-xl border border-border-warm outline-none focus:border-primary text-sm font-bold"
                            value={editingWordForm.word}
                            onChange={(event) => setEditingWordForm((prev) => ({ ...prev, word: event.target.value }))}
                          />
                          <input
                            className="w-full px-3 py-2 rounded-xl border border-border-warm outline-none focus:border-primary text-sm"
                            value={editingWordForm.note}
                            placeholder="Ghi chú"
                            onChange={(event) => setEditingWordForm((prev) => ({ ...prev, note: event.target.value }))}
                          />
                          <div className="flex gap-2 justify-end">
                            <Button variant="ghost" size="sm" onClick={() => setEditingWordId(null)} icon={<X className="w-4 h-4" />}>Hủy</Button>
                            <Button variant="primary" size="sm" loading={wordBusyId === word.id} onClick={() => handleUpdateWord(word)} icon={<Save className="w-4 h-4" />}>Lưu</Button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-extrabold text-espresso">{word.word}</p>
                                <Badge variant={word.isActive ? "success" : "neutral"} size="sm">{word.isActive ? "Đang bật" : "Đã tắt"}</Badge>
                              </div>
                              <p className="text-xs text-text-sub mt-1">{word.note || "Không có ghi chú"}</p>
                            </div>
                          </div>
                          <div className="flex flex-wrap gap-2 justify-end mt-3">
                            <Button variant="outline" size="sm" loading={wordBusyId === word.id} onClick={() => handleToggleWord(word)}>{word.isActive ? "Tắt" : "Bật"}</Button>
                            <Button variant="ghost" size="sm" onClick={() => startEditWord(word)} icon={<Edit3 className="w-4 h-4" />}>Sửa</Button>
                            <Button variant="danger" size="sm" loading={wordBusyId === word.id} onClick={() => handleDeleteWord(word)} icon={<Trash2 className="w-4 h-4" />}>Xóa</Button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
                {words.length === 0 && <p className="text-center text-text-sub text-sm py-8">Chưa có từ cấm nào.</p>}
              </div>
            )}
          </div>
        </aside>
      </section>
    </div>
  );
}
