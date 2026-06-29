import { useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { BookCard } from "../components/shared/BookCard";
import { Spinner } from "../components/ui/Spinner";
import { useBooks } from "../hooks/useBooks";
import { useCategories } from "../hooks/useCategories";

export function BooksPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const selectedCategory = searchParams.get("category") ?? "";

  const { categories } = useCategories();
  const { books, isLoading, error } = useBooks({
    category: selectedCategory,
    limit: 12,
  });

  const visibleCategories = useMemo(
    () => categories.filter((c) => c.slug !== "tat-ca"),
    [categories]
  );

  function chooseCategory(slug: string) {
    if (!slug) {
      setSearchParams({});
    } else {
      setSearchParams({ category: slug });
    }
  }

  return (
    <main className="max-w-[1280px] w-[calc(100%-48px)] mx-auto py-12 pb-20">
      <div className="mb-8">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-primary mb-1">Danh mục</p>
        <h1 className="font-serif text-4xl md:text-5xl font-bold text-espresso mb-3 leading-tight">Tất cả sách</h1>
        <p className="text-text-sub text-sm md:text-base">Tìm kiếm, lọc và chọn sách phù hợp với bạn.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6 items-start">
        {/* Sidebar lọc */}
        <aside className="md:sticky md:top-[110px] rounded-3xl p-5 bg-surface border border-border-warm shadow-sm flex flex-col gap-2">
          <h2 className="text-lg font-bold text-espresso mb-3">Bộ lọc</h2>
          <button
            className={`w-full text-left border rounded-xl py-2.5 px-3.5 font-bold text-sm transition-all duration-200 cursor-pointer ${
              !selectedCategory
                ? "bg-espresso text-white border-espresso"
                : "bg-surface text-espresso border-border-warm hover:bg-surface-warm"
            }`}
            type="button"
            onClick={() => chooseCategory("")}
          >
            Tất cả sách
          </button>
          {visibleCategories.map((category) => (
            <button
              className={`w-full text-left border rounded-xl py-2.5 px-3.5 font-bold text-sm transition-all duration-200 cursor-pointer ${
                selectedCategory === category.slug
                  ? "bg-espresso text-white border-espresso"
                  : "bg-surface text-espresso border-border-warm hover:bg-surface-warm"
              }`}
              key={category.id}
              type="button"
              onClick={() => chooseCategory(category.slug)}
            >
              {category.icon} {category.name}
            </button>
          ))}
        </aside>

        {/* Danh sách sách */}
        <section
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-[18px] w-full"
          aria-busy={isLoading}
        >
          {error && (
            <p className="col-span-full bg-red-50 border border-red-200 p-4 rounded-2xl text-red-700 text-sm text-center font-medium">
              {error}
            </p>
          )}
          {isLoading && (
            <div className="col-span-full py-16 flex justify-center">
              <Spinner size="lg" label="Đang tải sách..." />
            </div>
          )}
          {!isLoading && books.length === 0 && (
            <p className="col-span-full bg-surface-warm border border-border-warm p-4 rounded-2xl text-espresso text-sm text-center font-medium">
              Chưa có sách trong danh mục này.
            </p>
          )}
          {books.map((book) => (
            <BookCard key={book.id} book={book} />
          ))}
        </section>
      </div>
    </main>
  );
}
