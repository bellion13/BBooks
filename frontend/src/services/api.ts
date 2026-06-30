const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:4000/api";

export type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    stats?: unknown;
  };
};

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = localStorage.getItem("bbooks_token");
  const headers = new Headers(options.headers);

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (options.body && !(options.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMessage = `API request failed: ${response.status}`;
    try {
      const errorData = await response.json();
      if (errorData && errorData.message) {
        errorMessage = errorData.message;
      }
    } catch (e) {
      // Ignore
    }
    throw new Error(errorMessage);
  }

  return response.json() as Promise<ApiResponse<T>>;
}

export type ApiUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: string;
  avatarUrl: string | null;
};

export type AuthResponse = {
  user: ApiUser;
  token: string;
};

export async function login(body: Record<string, string>) {
  return request<AuthResponse>("/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function register(body: Record<string, string>) {
  return request<AuthResponse>("/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getProfile() {
  const response = await request<ApiUser>("/auth/profile");
  return response.data;
}

export type ApiCategory = {
  id: number;
  name: string;
  slug: string;
  icon: string | null;
};

export type ApiBook = {
  id: string;
  title: string;
  slug: string;
  author: string;
  description: string | null;
  coverUrl: string | null;
  price: string;
  originalPrice: string | null;
  soldCount: number;
  avgRating: string;
  reviewCount: number;
  isFeatured: boolean;
  category?: ApiCategory | null;
  stock: number;
};

export function mapApiCategory(category: ApiCategory) {
  return {
    id: String(category.id),
    name: category.name,
    slug: category.slug,
    icon: category.icon ?? "ðŸ“š",
  };
}

export function mapApiBook(book: ApiBook) {
  const discount = book.originalPrice
    ? Math.round((1 - Number(book.price) / Number(book.originalPrice)) * 100)
    : 0;

  return {
    id: book.id,
    slug: book.slug,
    title: book.title,
    author: book.author,
    price: Number(book.price),
    originalPrice: book.originalPrice ? Number(book.originalPrice) : undefined,
    rating: Number(book.avgRating),
    soldCount: book.soldCount,
    cover:
      book.coverUrl ??
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=500&q=80",
    badge: discount > 0 ? `-${discount}%` : book.isFeatured ? "BÃ¡n cháº¡y" : undefined,
    stock: book.stock,
  };
}

export async function getCategories() {
  const response = await request<ApiCategory[]>("/categories");
  return response.data.map(mapApiCategory);
}

export async function getBooks(params: Record<string, string | number | boolean | undefined> = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  const response = await request<ApiBook[]>(`/books${query ? `?${query}` : ""}`);

  return {
    books: response.data.map(mapApiBook),
    meta: response.meta,
  };
}

export type ApiReview = {
  id: string;
  rating: number;
  title: string | null;
  content: string | null;
  isApproved?: boolean;
  createdAt: string;
  user: {
    id?: string;
    fullName: string;
    email?: string;
    avatarUrl: string | null;
  };
  book?: {
    id: string;
    title: string;
    slug: string;
    coverUrl: string | null;
  };
};

export type ApiBookImage = {
  imageUrl: string;
  sortOrder: number;
};

export type ApiBookDetail = ApiBook & {
  images: ApiBookImage[];
  reviews: ApiReview[];
  publisher: string | null;
  publishYear: number | null;
  isbn: string | null;
  stock: number;
};

export async function getBookBySlug(slug: string) {
  const response = await request<ApiBookDetail>(`/books/${slug}`);
  const book = response.data;

  return {
    ...mapApiBook(book),
    description: book.description,
    category: book.category ? mapApiCategory(book.category) : undefined,
    images: book.images,
    reviews: book.reviews,
    publisher: book.publisher,
    publishYear: book.publishYear,
    isbn: book.isbn,
    stock: book.stock,
  };
}

export async function getBookReviews(slug: string) {
  const response = await request<ApiReview[]>(`/books/${slug}/reviews`);
  return response.data;
}

export async function submitBookReview(slug: string, body: { rating: number; title?: string; content?: string }) {
  return request<ApiReview>(`/books/${slug}/reviews`, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export type HomeBanner = {
  id: number;
  title: string | null;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  buttonText: string | null;
  sortOrder: number;
};

export type HomeData = {
  heroBanners: HomeBanner[];
  midBanners: HomeBanner[];
  categories: ApiCategory[];
  bestSellingBooks: ApiBook[];
  newBooks: ApiBook[];
  saleBooks: ApiBook[];
};

export async function getHomeData() {
  const response = await request<HomeData>("/home");

  return {
    heroBanners: response.data.heroBanners,
    midBanners: response.data.midBanners,
    categories: response.data.categories.map(mapApiCategory),
    bestSellingBooks: response.data.bestSellingBooks.map(mapApiBook),
    newBooks: response.data.newBooks.map(mapApiBook),
    saleBooks: response.data.saleBooks.map(mapApiBook),
  };
}

export type ApiCartItem = {
  id: string;
  userId: string;
  bookId: string;
  quantity: number;
  book: ApiBook;
};

export type ApiWishlistItem = {
  id: string;
  userId: string;
  bookId: string;
  createdAt: string;
  book: ApiBook;
};

export async function getCart() {
  return request<ApiCartItem[]>("/cart");
}

export async function addToCart(bookId: string, quantity: number = 1) {
  return request<ApiCartItem>("/cart", {
    method: "POST",
    body: JSON.stringify({ bookId, quantity }),
  });
}

export async function updateCartItem(id: string, quantity: number) {
  return request<ApiCartItem>(`/cart/${id}`, {
    method: "PUT",
    body: JSON.stringify({ quantity }),
  });
}

export async function removeFromCart(id: string) {
  return request<void>(`/cart/${id}`, {
    method: "DELETE",
  });
}

export async function clearCart() {
  return request<void>("/cart", {
    method: "DELETE",
  });
}

export type ApiOrderStatus = "PENDING" | "CONFIRMED" | "SHIPPING" | "DELIVERED" | "CANCELLED" | "REFUNDED";
export type ApiPaymentStatus = "UNPAID" | "PAID" | "REFUNDED";
export type ApiPaymentMethod = "COD" | "BANK_TRANSFER";

export type ApiOrderItem = {
  id: string;
  bookId: string | null;
  bookTitle: string;
  bookCover: string | null;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
};

export type ApiOrder = {
  id: string;
  orderCode: string;
  status: ApiOrderStatus;
  paymentMethod: ApiPaymentMethod;
  paymentStatus: ApiPaymentStatus;
  subtotal: string;
  discount: string;
  shippingFee: string;
  total: string;
  note: string | null;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  cancelReason?: string | null;
  cancelledAt?: string | null;
  createdAt: string;
  items: ApiOrderItem[];
};

export type CreateOrderPayload = {
  paymentMethod: ApiPaymentMethod;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  note?: string;
};

export async function createOrder(body: CreateOrderPayload) {
  return request<ApiOrder>("/orders", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function getMyOrders() {
  return request<ApiOrder[]>("/orders");
}

export async function cancelMyOrder(id: string) {
  return request<ApiOrder>(`/orders/${id}/cancel`, {
    method: "PATCH",
  });
}

export async function getWishlist() {
  return request<ApiWishlistItem[]>("/wishlist");
}

export async function toggleWishlist(bookId: string) {
  return request<{ added: boolean }>("/wishlist", {
    method: "POST",
    body: JSON.stringify({ bookId }),
  });
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ Admin APIs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export type AdminDashboardStats = {
  totalBooks: number;
  totalUsers: number;
  totalOrders: number;
  totalRevenue: number;
  lowStockBooks: { id: string; title: string; stock: number; coverUrl: string | null }[];
  recentOrders: { id: string; orderCode: string; status: string; total: string; createdAt: string; shippingName: string }[];
};

export async function getAdminDashboard() {
  return request<AdminDashboardStats>("/admin/dashboard");
}

export async function getAdminBooks(params: Record<string, string | number | undefined> = {}) {
  const q = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => v !== undefined && q.set(k, String(v)));
  const qs = q.toString();
  return request<ApiBook[]>(`/admin/books${qs ? `?${qs}` : ""}`);
}

export async function createAdminBook(body: Record<string, unknown>) {
  return request<ApiBook>("/admin/books", { method: "POST", body: JSON.stringify(body) });
}

export async function updateAdminBook(id: string, body: Record<string, unknown>) {
  return request<ApiBook>(`/admin/books/${id}`, { method: "PUT", body: JSON.stringify(body) });
}

export async function deleteAdminBook(id: string) {
  return request<void>(`/admin/books/${id}`, { method: "DELETE" });
}

export type AdminCategory = ApiCategory & {
  description: string | null;
  imageUrl: string | null;
  parentId: number | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  parent: { id: number; name: string; slug: string } | null;
  _count: { books: number; children: number };
};

export type AdminCategoryPayload = {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  parentId?: number | null;
  sortOrder?: number;
  isActive?: boolean;
};

export async function getAdminCategories(params: { search?: string; isActive?: string } = {}) {
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.isActive) q.set("isActive", params.isActive);
  const qs = q.toString();
  return request<AdminCategory[]>(`/admin/categories${qs ? `?${qs}` : ""}`);
}

export async function createAdminCategory(body: AdminCategoryPayload) {
  return request<AdminCategory>("/admin/categories", { method: "POST", body: JSON.stringify(body) });
}

export async function updateAdminCategory(id: number, body: Partial<AdminCategoryPayload>) {
  return request<AdminCategory>(`/admin/categories/${id}`, { method: "PUT", body: JSON.stringify(body) });
}

export async function deleteAdminCategory(id: number) {
  return request<void>(`/admin/categories/${id}`, { method: "DELETE" });
}

export type AdminCouponType = "PERCENT" | "FIXED_AMOUNT" | "FREE_SHIP";

export type AdminCoupon = {
  id: string;
  code: string;
  name: string | null;
  type: AdminCouponType;
  value: string;
  minOrderValue: string;
  maxDiscount: string | null;
  usageLimit: number | null;
  usedCount: number;
  startDate: string | null;
  endDate: string | null;
  isActive: boolean;
  createdAt: string;
};

export type AdminCouponPayload = {
  code: string;
  name?: string;
  type: AdminCouponType;
  value: number;
  minOrderValue?: number;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  isActive?: boolean;
};

export async function getAdminCoupons(params: { search?: string; type?: string; isActive?: string } = {}) {
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.type) q.set("type", params.type);
  if (params.isActive) q.set("isActive", params.isActive);
  const qs = q.toString();
  return request<AdminCoupon[]>(`/admin/coupons${qs ? `?${qs}` : ""}`);
}

export async function createAdminCoupon(body: AdminCouponPayload) {
  return request<AdminCoupon>("/admin/coupons", { method: "POST", body: JSON.stringify(body) });
}

export async function updateAdminCoupon(id: string, body: Partial<AdminCouponPayload>) {
  return request<AdminCoupon>(`/admin/coupons/${id}`, { method: "PUT", body: JSON.stringify(body) });
}

export async function deleteAdminCoupon(id: string) {
  return request<void>(`/admin/coupons/${id}`, { method: "DELETE" });
}

export type AdminBannerPosition = "HOME_HERO" | "HOME_MID" | "CATEGORY_TOP";

export type AdminBanner = {
  id: number;
  title: string | null;
  subtitle: string | null;
  imageUrl: string;
  linkUrl: string | null;
  buttonText: string | null;
  position: AdminBannerPosition;
  sortOrder: number;
  isActive: boolean;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
};

export type AdminBannerPayload = {
  title?: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  buttonText?: string;
  position: AdminBannerPosition;
  sortOrder?: number;
  isActive?: boolean;
  startDate?: string | null;
  endDate?: string | null;
};

export async function getAdminBanners(params: { search?: string; position?: string; isActive?: string } = {}) {
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.position) q.set("position", params.position);
  if (params.isActive) q.set("isActive", params.isActive);
  const qs = q.toString();
  return request<AdminBanner[]>(`/admin/banners${qs ? `?${qs}` : ""}`);
}

export async function createAdminBanner(body: AdminBannerPayload) {
  return request<AdminBanner>("/admin/banners", { method: "POST", body: JSON.stringify(body) });
}

export async function updateAdminBanner(id: number, body: Partial<AdminBannerPayload>) {
  return request<AdminBanner>(`/admin/banners/${id}`, { method: "PUT", body: JSON.stringify(body) });
}

export async function deleteAdminBanner(id: number) {
  return request<void>(`/admin/banners/${id}`, { method: "DELETE" });
}

export type AdminReview = ApiReview & {
  isApproved: boolean;
  updatedAt: string;
  book: {
    id: string;
    title: string;
    slug: string;
    coverUrl: string | null;
  };
  user: {
    id: string;
    fullName: string;
    email: string;
    avatarUrl: string | null;
  };
};

export type AdminReviewStats = {
  total: number;
  approved: number;
  pending: number;
  averageRating: number;
};

export async function getAdminReviews(params: { page?: number; search?: string; status?: string; rating?: string } = {}) {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.search) q.set("search", params.search);
  if (params.status) q.set("status", params.status);
  if (params.rating) q.set("rating", params.rating);
  const qs = q.toString();
  return request<AdminReview[]>(`/admin/reviews${qs ? `?${qs}` : ""}`);
}

export async function deleteAdminReview(id: string) {
  return request<void>(`/admin/reviews/${id}`, { method: "DELETE" });
}

export type ModerationWord = {
  id: string;
  word: string;
  note: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export async function getModerationWords(params: { search?: string; isActive?: string } = {}) {
  const q = new URLSearchParams();
  if (params.search) q.set("search", params.search);
  if (params.isActive) q.set("isActive", params.isActive);
  const qs = q.toString();
  return request<ModerationWord[]>(`/admin/moderation-words${qs ? `?${qs}` : ""}`);
}

export async function createModerationWord(body: { word: string; note?: string; isActive?: boolean }) {
  return request<ModerationWord>("/admin/moderation-words", { method: "POST", body: JSON.stringify(body) });
}

export async function updateModerationWord(id: string, body: Partial<{ word: string; note: string; isActive: boolean }>) {
  return request<ModerationWord>(`/admin/moderation-words/${id}`, { method: "PUT", body: JSON.stringify(body) });
}

export async function deleteModerationWord(id: string) {
  return request<void>(`/admin/moderation-words/${id}`, { method: "DELETE" });
}

export type AdminUser = {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  _count: { orders: number };
};

export async function getAdminUsers(params: { page?: number; search?: string } = {}) {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.search) q.set("search", params.search);
  const qs = q.toString();
  return request<AdminUser[]>(`/admin/users${qs ? `?${qs}` : ""}`);
}



export async function updateAdminUserStatus(id: string, isActive: boolean) {
  return request<AdminUser>(`/admin/users/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ isActive }),
  });
}

export type AdminOrderItem = {
  id: string;
  bookTitle: string;
  bookCover: string | null;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
};

export type AdminOrder = {
  id: string;
  orderCode: string;
  status: "PENDING" | "CONFIRMED" | "SHIPPING" | "DELIVERED" | "CANCELLED" | "REFUNDED";
  paymentMethod: string;
  paymentStatus: "UNPAID" | "PAID" | "REFUNDED";
  subtotal: string;
  discount: string;
  shippingFee: string;
  total: string;
  note: string | null;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  createdAt: string;
  user: { id: string; fullName: string; email: string } | null;
  items: AdminOrderItem[];
};

export async function getAdminOrders(params: { page?: number; status?: string; search?: string } = {}) {
  const q = new URLSearchParams();
  if (params.page) q.set("page", String(params.page));
  if (params.status) q.set("status", params.status);
  if (params.search) q.set("search", params.search);
  const qs = q.toString();
  return request<AdminOrder[]>(`/admin/orders${qs ? `?${qs}` : ""}`);
}

export async function updateAdminOrderStatus(
  id: string,
  body: { status?: string; paymentStatus?: string; cancelReason?: string },
) {
  return request<AdminOrder>(`/admin/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}


