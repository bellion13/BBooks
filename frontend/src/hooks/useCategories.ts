import { useEffect, useState } from "react";
import { getCategories } from "../services/api";
import { categories as fallbackCategories } from "../data";
import type { Category } from "../types/book.types";

/**
 * Hook tải danh sách thể loại sách từ API.
 * Dùng dữ liệu mẫu (fallback) trong khi chờ hoặc khi lỗi.
 */
export function useCategories() {
  const [categories, setCategories] = useState<Category[]>(fallbackCategories);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      setIsLoading(true);
      setError(null);
      try {
        const data = await getCategories();
        if (isMounted) setCategories(data);
      } catch (err) {
        console.error("useCategories: Không tải được danh mục", err);
        if (isMounted) setError("Không tải được danh mục");
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    load();
    return () => { isMounted = false; };
  }, []);

  return { categories, isLoading, error };
}
