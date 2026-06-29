import { create } from "zustand";
import { 
  getCart as apiGetCart, 
  addToCart as apiAddToCart, 
  updateCartItem as apiUpdateCartItem, 
  removeFromCart as apiRemoveFromCart, 
  clearCart as apiClearCart,
  mapApiBook
} from "../services/api";
import { useToastStore } from "./useToastStore";

export type CartItem = {
  id: string; // Database ID or bookId for guest items
  bookId: string;
  quantity: number;
  title: string;
  slug: string;
  author: string;
  cover: string;
  price: number;
  originalPrice?: number;
  stock: number;
};

type CartState = {
  items: CartItem[];
  isAuthenticated: boolean;
  isLoading: boolean;
  init: (isAuthenticated: boolean) => Promise<void>;
  fetchCart: () => Promise<void>;
  addToCart: (book: { id: string; title: string; slug: string; author: string; cover: string; price: number; originalPrice?: number; stock: number }, quantity: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeFromCart: (itemId: string) => Promise<void>;
  clearCart: () => Promise<void>;
  getTotalItems: () => number;
  getTotalPrice: () => number;
};

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  isAuthenticated: false,
  isLoading: false,

  init: async (isAuthenticated: boolean) => {
    set({ isAuthenticated });
    if (isAuthenticated) {
      // If there are guest items in localStorage, merge them to the server
      const localCartStr = localStorage.getItem("bbooks_cart");
      if (localCartStr) {
        try {
          const localItems: CartItem[] = JSON.parse(localCartStr);
          // Merge one by one
          for (const item of localItems) {
            await apiAddToCart(item.bookId, item.quantity);
          }
          localStorage.removeItem("bbooks_cart");
          useToastStore.getState().show("Đã đồng bộ giỏ hàng tạm thời thành công!", "success");
        } catch (e) {
          console.error("Failed to merge local cart", e);
        }
      }
      await get().fetchCart();
    } else {
      // Load guest cart from local storage
      const localCartStr = localStorage.getItem("bbooks_cart");
      if (localCartStr) {
        try {
          set({ items: JSON.parse(localCartStr) });
        } catch (e) {
          console.error("Failed to parse local cart", e);
          set({ items: [] });
        }
      } else {
        set({ items: [] });
      }
    }
  },

  fetchCart: async () => {
    if (!get().isAuthenticated) return;
    set({ isLoading: true });
    try {
      const response = await apiGetCart();
      const mappedItems: CartItem[] = response.data.map((item) => {
        const mappedBook = mapApiBook(item.book);
        return {
          id: item.id,
          bookId: item.bookId,
          quantity: item.quantity,
          title: mappedBook.title,
          slug: mappedBook.slug,
          author: mappedBook.author,
          cover: mappedBook.cover,
          price: mappedBook.price,
          originalPrice: mappedBook.originalPrice,
          stock: item.book.stock ?? 0,
        };
      });
      set({ items: mappedItems });
    } catch (e) {
      console.error("Failed to fetch cart from server", e);
    } finally {
      set({ isLoading: false });
    }
  },

  addToCart: async (book, quantity) => {
    const { isAuthenticated, items } = get();
    if (isAuthenticated) {
      set({ isLoading: true });
      try {
        await apiAddToCart(book.id, quantity);
        await get().fetchCart();
        useToastStore.getState().show(`Đã thêm "${book.title}" vào giỏ hàng!`, "success");
      } catch (err: any) {
        useToastStore.getState().show(err.message || "Không thể thêm vào giỏ hàng", "error");
        throw err;
      } finally {
        set({ isLoading: false });
      }
    } else {
      // Guest local storage logic
      const existingIndex = items.findIndex((item) => item.bookId === book.id);
      let updatedItems = [...items];

      if (existingIndex > -1) {
        const newQuantity = items[existingIndex].quantity + quantity;
        if (newQuantity > book.stock) {
          const err = new Error(`Tổng số lượng vượt quá tồn kho (${book.stock})`);
          useToastStore.getState().show(err.message, "error");
          throw err;
        }
        updatedItems[existingIndex] = {
          ...items[existingIndex],
          quantity: newQuantity,
        };
      } else {
        if (quantity > book.stock) {
          const err = new Error(`Số lượng yêu cầu vượt quá tồn kho (${book.stock})`);
          useToastStore.getState().show(err.message, "error");
          throw err;
        }
        updatedItems.push({
          id: book.id, // For guests, the item ID is the book ID
          bookId: book.id,
          quantity,
          title: book.title,
          slug: book.slug,
          author: book.author,
          cover: book.cover,
          price: book.price,
          originalPrice: book.originalPrice,
          stock: book.stock,
        });
      }

      set({ items: updatedItems });
      localStorage.setItem("bbooks_cart", JSON.stringify(updatedItems));
      useToastStore.getState().show(`Đã thêm "${book.title}" vào giỏ hàng!`, "success");
    }
  },

  updateQuantity: async (itemId, quantity) => {
    const { isAuthenticated, items } = get();
    if (isAuthenticated) {
      set({ isLoading: true });
      try {
        await apiUpdateCartItem(itemId, quantity);
        await get().fetchCart();
        useToastStore.getState().show("Đã cập nhật số lượng sản phẩm!", "success");
      } catch (err: any) {
        useToastStore.getState().show(err.message || "Không thể cập nhật số lượng", "error");
        throw err;
      } finally {
        set({ isLoading: false });
      }
    } else {
      // Guest local storage update
      let errorOccurred = false;
      const updatedItems = items.map((item) => {
        if (item.id === itemId) {
          if (quantity > item.stock) {
            errorOccurred = true;
            return item;
          }
          return { ...item, quantity };
        }
        return item;
      });
      if (errorOccurred) {
        const errMsg = "Số lượng yêu cầu vượt quá tồn kho";
        useToastStore.getState().show(errMsg, "error");
        throw new Error(errMsg);
      }
      set({ items: updatedItems });
      localStorage.setItem("bbooks_cart", JSON.stringify(updatedItems));
      useToastStore.getState().show("Đã cập nhật số lượng sản phẩm!", "success");
    }
  },

  removeFromCart: async (itemId) => {
    const { isAuthenticated, items } = get();
    if (isAuthenticated) {
      set({ isLoading: true });
      try {
        await apiRemoveFromCart(itemId);
        await get().fetchCart();
        useToastStore.getState().show("Đã xóa sản phẩm khỏi giỏ hàng!", "info");
      } catch (err: any) {
        useToastStore.getState().show("Không thể xóa sản phẩm", "error");
        throw err;
      } finally {
        set({ isLoading: false });
      }
    } else {
      const updatedItems = items.filter((item) => item.id !== itemId);
      set({ items: updatedItems });
      localStorage.setItem("bbooks_cart", JSON.stringify(updatedItems));
      useToastStore.getState().show("Đã xóa sản phẩm khỏi giỏ hàng!", "info");
    }
  },

  clearCart: async () => {
    const { isAuthenticated } = get();
    if (isAuthenticated) {
      set({ isLoading: true });
      try {
        await apiClearCart();
        set({ items: [] });
        useToastStore.getState().show("Đã xóa toàn bộ giỏ hàng!", "info");
      } catch (err: any) {
        useToastStore.getState().show("Không thể xóa giỏ hàng", "error");
        throw err;
      } finally {
        set({ isLoading: false });
      }
    } else {
      set({ items: [] });
      localStorage.removeItem("bbooks_cart");
      useToastStore.getState().show("Đã xóa toàn bộ giỏ hàng!", "info");
    }
  },

  getTotalItems: () => {
    return get().items.reduce((sum, item) => sum + item.quantity, 0);
  },

  getTotalPrice: () => {
    return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  },
}));
