import { useEffect, useState } from "react";
import { getBooks } from "../services/api";
import { demoBooks } from "../data";
import type { Book } from "../types/book.types";

type UseBooksParams = {
  category?: string;
  limit?: number;
  featured?: boolean;
};

type UseBooksResult = {
  books: Book[];
  isLoading: boolean;
  error: string;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

/**
 * Hook tải danh sách sách từ API với bộ lọc tuỳ chọn.
 * Tự động tải lại khi `params` thay đổi.
 */
export function useBooks(params: UseBooksParams = {}): UseBooksResult {
  const { category, limit = 12, featured } = params;

  const [books, setBooks] = useState<Book[]>(demoBooks);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [meta, setMeta] = useState<UseBooksResult["meta"]>(undefined);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoading(true);
      setError("");

      try {
        const result = await getBooks({
          limit,
          ...(category && category !== "tat-ca" ? { category } : {}),
          ...(featured !== undefined ? { featured } : {}),
        });

        if (!isMounted) return;
        setBooks(result.books.length ? result.books : []);
        setMeta(result.meta);
      } catch (err) {
        console.error("useBooks: Không tải được sách", err);
        if (isMounted) {
          setError("Chưa kết nối được API, đang hiển thị dữ liệu mẫu.");
          setBooks(demoBooks.concat(demoBooks));
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    load();
    return () => { isMounted = false; };
  }, [category, limit, featured]);

  return { books, isLoading, error, meta };
}
