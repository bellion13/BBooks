import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ArrowUpDown, BookOpenCheck, Filter, Search, ShieldCheck, Sparkles, Truck } from "lucide-react";
import { BookCard } from "../components/shared/BookCard";
import { Spinner } from "../components/ui/Spinner";
import { useBooks } from "../hooks/useBooks";
import { useCategories } from "../hooks/useCategories";
import type { Book } from "../types/book.types";

type SortMode = "popular" | "price-asc" | "price-desc" | "rating";

const SORT_LABELS: Record<SortMode, string> = {
  popular: "Bán chạy",
  "price-asc": "Giá thấp đến cao",
  "price-desc": "Giá cao đến thấp",
  rating: "Đánh giá tốt",
};

function normalizeText(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function sortBooks(books: Book[], sort: SortMode) {
  return [...books].sort((a, b) => {
    if (sort === "price-asc") return a.price - b.price;
    if (sort === "price-desc") return b.price - a.price;
    if (sort === "rating") return b.rating - a.rating;
    return b.soldCount - a.soldCount;
  });
}

export function BooksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") ?? "";
  const keyword = searchParams.get("q") ?? "";
  const sort = (searchParams.get("sort") as SortMode | null) ?? "popular";

  const { categories } = useCategories();
  const { books, isLoading, error, meta } = useBooks({
    category: selectedCategory,
    limit: 24,
  });

  const visibleCategories = useMemo(
    () => categories.filter((c) => c.slug !== "tat-ca"),
    [categories]
  );

  const selectedCategoryName = useMemo(() => {
    return visibleCategories.find((category) => category.slug === selectedCategory)?.name ?? "Tất cả sách";
  }, [selectedCategory, visibleCategories]);

  const filteredBooks = useMemo(() => {
    const normalizedKeyword = normalizeText(keyword);
    const matchedBooks = normalizedKeyword
      ? books.filter((book) => {
          const haystack = normalizeText(`${book.title} ${book.author}`);
          return haystack.includes(normalizedKeyword);
        })
      : books;

    return sortBooks(matchedBooks, SORT_LABELS[sort] ? sort : "popular");
  }, [books, keyword, sort]);

  const maxPrice = useMemo(() => {
    if (!filteredBooks.length) return 0;
    return Math.max(...filteredBooks.map((book) => book.price));
  }, [filteredBooks]);

  function updateParams(next: Record<string, string>) {
    const params = new URLSearchParams(searchParams);

    Object.entries(next).forEach(([key, value]) => {
      if (!value) params.delete(key);
      else params.set(key, value);
    });

    setSearchParams(params);
  }

  return (
    <main className="relative overflow-hidden pb-24">
      <section className="relative max-w-[1280px] w-[calc(100%-32px)] md:w-[calc(100%-48px)] mx-auto pt-10 md:pt-14">
        <div className="absolute -top-24 right-0 h-80 w-80 rounded-full bg-accent/20 blur-3xl" aria-hidden="true" />
        <div className="absolute top-32 -left-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />

        <div className="glass-panel relative overflow-hidden rounded-[34px] p-6 md:p-10 lg:p-12">
          <div className="absolute inset-x-0 top-0 h-px shimmer-line overflow-hidden" aria-hidden="true" />
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
            <div>
              <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-primary shadow-sm backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" /> Kho sách tuyển chọn
              </p>
              <h1 className="font-serif text-4xl font-bold leading-tight text-espresso md:text-6xl">
                Tìm cuốn sách hợp gu trong vài giây.
              </h1>
              <p className="mt-4 max-w-2xl text-sm font-medium leading-7 text-text-sub md:text-base">
                Lọc theo danh mục, tìm theo tên sách/tác giả và sắp xếp nhanh để chọn đúng cuốn bạn muốn đọc hoặc tặng.
              </p>
            </div>

            <form
              className="rounded-[28px] border border-white/70 bg-white/75 p-3 shadow-espresso backdrop-blur-xl"
              onSubmit={(event) => event.preventDefault()}
              role="search"
            >
              <label className="sr-only" htmlFor="books-search-input">Tìm sách</label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-primary" />
                  <input
                    id="books-search-input"
                    className="h-14 w-full rounded-2xl border border-border-warm bg-surface px-12 text-sm font-bold text-espresso shadow-inner outline-none transition focus:border-accent"
                    value={keyword}
                    onChange={(event) => updateParams({ q: event.target.value })}
                    placeholder="Tìm: Nhà giả kim, Atomic Habits..."
                    type="search"
                  />
                </div>
                <Link
                  className="inline-flex h-14 items-center justify-center rounded-2xl bg-espresso px-6 text-sm font-black text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-primary"
                  to="/cart"
                >
                  Xem giỏ hàng
                </Link>
              </div>
            </form>
          </div>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {[
            { icon: Truck, title: "Freeship từ 199K", desc: "Giao nhanh toàn quốc" },
            { icon: ShieldCheck, title: "Sách chính hãng", desc: "Nguồn bán minh bạch" },
            { icon: BookOpenCheck, title: "Gợi ý dễ chọn", desc: "Lọc nhanh theo nhu cầu" },
          ].map((item) => (
            <div className="glass-panel rounded-3xl p-4" key={item.title}>
              <item.icon className="mb-3 h-6 w-6 text-primary" />
              <h2 className="text-sm font-black text-espresso">{item.title}</h2>
              <p className="mt-1 text-xs font-semibold text-text-sub">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-[1280px] w-[calc(100%-32px)] md:w-[calc(100%-48px)] mx-auto mt-8 grid grid-cols-1 items-start gap-6 lg:grid-cols-[292px_1fr]">
        <aside className="glass-panel lg:sticky lg:top-[104px] rounded-[30px] p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-primary">Bộ lọc</p>
              <h2 className="mt-1 text-xl font-black text-espresso">Danh mục</h2>
            </div>
            <Filter className="h-5 w-5 text-primary" />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            <button
              className={`shrink-0 rounded-2xl border px-4 py-3 text-left text-sm font-black transition-all ${
                !selectedCategory
                  ? "border-espresso bg-espresso text-white shadow-espresso"
                  : "border-white/70 bg-white/70 text-espresso hover:-translate-y-0.5 hover:bg-white"
              }`}
              type="button"
              onClick={() => updateParams({ category: "" })}
            >
              Tất cả sách
            </button>
            {visibleCategories.map((category) => (
              <button
                className={`shrink-0 rounded-2xl border px-4 py-3 text-left text-sm font-black transition-all ${
                  selectedCategory === category.slug
                    ? "border-espresso bg-espresso text-white shadow-espresso"
                    : "border-white/70 bg-white/70 text-espresso hover:-translate-y-0.5 hover:bg-white"
                }`}
                key={category.id}
                type="button"
                onClick={() => updateParams({ category: category.slug })}
              >
                {category.name}
              </button>
            ))}
          </div>
        </aside>

        <div className="min-w-0">
          <div className="glass-panel mb-5 flex flex-col gap-4 rounded-[28px] p-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.16em] text-primary">
                {error ? "Đang dùng dữ liệu mẫu" : "Kết quả tìm kiếm"}
              </p>
              <h2 className="mt-1 text-2xl font-black text-espresso">
                {selectedCategoryName} · {filteredBooks.length} cuốn
              </h2>
              <p className="mt-1 text-xs font-semibold text-text-sub">
                {meta?.total ? `${meta.total} sách từ API` : "Hiển thị theo dữ liệu hiện có"}
                {maxPrice > 0 ? ` · Giá cao nhất ${new Intl.NumberFormat("vi-VN").format(maxPrice)}đ` : ""}
              </p>
            </div>

            <label className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/75 px-4 py-3 shadow-sm">
              <ArrowUpDown className="h-4 w-4 text-primary" />
              <span className="sr-only">Sắp xếp</span>
              <select
                className="bg-transparent text-sm font-black text-espresso outline-none"
                value={SORT_LABELS[sort] ? sort : "popular"}
                onChange={(event) => updateParams({ sort: event.target.value })}
              >
                {Object.entries(SORT_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </label>
          </div>

          {error && (
            <p className="mb-5 rounded-2xl border border-accent/30 bg-accent-soft/80 p-4 text-center text-sm font-bold text-primary">
              {error}
            </p>
          )}

          <section
            className="grid w-full grid-cols-1 gap-[18px] sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
            aria-busy={isLoading}
          >
            {isLoading && (
              <div className="col-span-full flex justify-center py-16">
                <Spinner size="lg" label="Đang tải sách..." />
              </div>
            )}

            {!isLoading && filteredBooks.length === 0 && (
              <div className="glass-panel col-span-full rounded-[30px] p-10 text-center">
                <Search className="mx-auto mb-4 h-12 w-12 text-primary" />
                <h3 className="font-serif text-3xl text-espresso">Chưa tìm thấy sách phù hợp</h3>
                <p className="mx-auto mt-2 max-w-md text-sm font-medium text-text-sub">
                  Hãy thử bỏ bớt từ khóa hoặc chọn lại danh mục khác nhé.
                </p>
              </div>
            )}

            {!isLoading && filteredBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </section>
        </div>
      </section>
    </main>
  );
}
