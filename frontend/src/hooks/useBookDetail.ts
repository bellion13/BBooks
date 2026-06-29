import { useEffect, useState } from "react";
import { getBookBySlug, getBooks } from "../services/api";

type DetailBook = {
  id: string;
  slug: string;
  title: string;
  author: string;
  price: number;
  originalPrice?: number;
  rating: number;
  soldCount: number;
  cover: string;
  badge?: string;
  description: string | null;
  category?: { id: string; name: string; slug: string; icon: string };
  images: { imageUrl: string; sortOrder: number }[];
  reviews: {
    id: string;
    rating: number;
    title: string | null;
    content: string | null;
    createdAt: string;
    user: { fullName: string; avatarUrl: string | null };
  }[];
  publisher: string | null;
  publishYear: number | null;
  isbn: string | null;
  stock: number;
};

type SimpleBook = {
  id: string;
  slug: string;
  title: string;
  author: string;
  price: number;
  originalPrice?: number;
  rating: number;
  soldCount: number;
  cover: string;
  badge?: string;
};

type UseBookDetailResult = {
  book: DetailBook | null;
  relatedBooks: SimpleBook[];
  isLoading: boolean;
  error: string;
};

/**
 * Hook tải thông tin chi tiết sách theo slug và danh sách sách liên quan.
 * Tự động tải lại khi slug thay đổi.
 */
export function useBookDetail(slug: string | undefined): UseBookDetailResult {
  const [book, setBook] = useState<DetailBook | null>(null);
  const [relatedBooks, setRelatedBooks] = useState<SimpleBook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!slug) return;
    const currentSlug = slug; // narrowed to string for TypeScript
    let isMounted = true;

    async function load() {
      setIsLoading(true);
      setError("");
      setBook(null);
      setRelatedBooks([]);

      try {
        const detail = await getBookBySlug(currentSlug);
        if (!isMounted) return;
        setBook(detail);

        if (detail.category) {
          const related = await getBooks({
            category: detail.category.slug,
            limit: 5,
          });
          if (isMounted) {
            setRelatedBooks(related.books.filter((b) => b.id !== detail.id));
          }
        }
      } catch (err: any) {
        console.error("useBookDetail: Không tải được sách", err);
        if (isMounted) {
          setError(err.message || "Không tải được thông tin sách.");
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    load();
    return () => { isMounted = false; };
  }, [slug]);

  return { book, relatedBooks, isLoading, error };
}
