import { create } from "zustand";
import { getWishlist as apiGetWishlist, toggleWishlist as apiToggleWishlist, mapApiBook } from "../services/api";
import { useToastStore } from "./useToastStore";

export type WishlistItem = {
  id: string;
  bookId: string;
  title: string;
  slug: string;
  cover: string;
  price: number;
};

type WishlistState = {
  items: WishlistItem[];
  isLoading: boolean;
  fetchWishlist: () => Promise<void>;
  toggleWishlist: (bookId: string, bookInfo?: { title: string; slug: string; cover: string; price: number }) => Promise<boolean>;
  isInWishlist: (bookId: string) => boolean;
  clearWishlist: () => void;
};

export const useWishlistStore = create<WishlistState>((set, get) => ({
  items: [],
  isLoading: false,

  fetchWishlist: async () => {
    set({ isLoading: true });
    try {
      const response = await apiGetWishlist();
      const mapped = response.data.map((item) => {
        const book = mapApiBook(item.book);
        return {
          id: item.id,
          bookId: item.bookId,
          title: book.title,
          slug: book.slug,
          cover: book.cover,
          price: book.price,
        };
      });
      set({ items: mapped });
    } catch (e) {
      console.error("Failed to fetch wishlist", e);
    } finally {
      set({ isLoading: false });
    }
  },

  toggleWishlist: async (bookId, bookInfo) => {
    try {
      const response = await apiToggleWishlist(bookId);
      const isAdded = response.data.added;

      if (isAdded) {
        if (bookInfo) {
          set({
            items: [
              ...get().items,
              {
                id: Math.random().toString(),
                bookId,
                title: bookInfo.title,
                slug: bookInfo.slug,
                cover: bookInfo.cover,
                price: bookInfo.price,
              },
            ],
          });
        }
        await get().fetchWishlist();
        useToastStore.getState().show(
          bookInfo ? `Đã thêm "${bookInfo.title}" vào yêu thích!` : "Đã thêm vào yêu thích!", 
          "success"
        );
        return true;
      } else {
        set({
          items: get().items.filter((item) => item.bookId !== bookId),
        });
        useToastStore.getState().show("Đã xóa khỏi danh sách yêu thích!", "info");
        return false;
      }
    } catch (e: any) {
      console.error("Failed to toggle wishlist", e);
      useToastStore.getState().show(e.message || "Không thể cập nhật danh sách yêu thích", "error");
      throw e;
    }
  },

  isInWishlist: (bookId) => {
    return get().items.some((item) => item.bookId === bookId);
  },

  clearWishlist: () => {
    set({ items: [] });
  },
}));
