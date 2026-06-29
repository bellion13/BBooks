import { prisma } from "../config/database.js";
import { recalculateBookRating } from "./review.service.js";

// ────────────────── Dashboard Stats ──────────────────
export async function getDashboardStats() {
  const [totalBooks, totalUsers, totalOrders, revenueResult, lowStockBooks, recentOrders] =
    await Promise.all([
      prisma.book.count({ where: { isActive: true } }),
      prisma.user.count({ where: { isActive: true } }),
      prisma.order.count(),
      prisma.order.aggregate({
        where: { paymentStatus: "PAID" },
        _sum: { total: true },
      }),
      prisma.book.findMany({
        where: { isActive: true, stock: { lte: 5 } },
        select: { id: true, title: true, stock: true, coverUrl: true },
        orderBy: { stock: "asc" },
        take: 5,
      }),
      prisma.order.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
        select: {
          id: true,
          orderCode: true,
          status: true,
          total: true,
          createdAt: true,
          shippingName: true,
        },
      }),
    ]);

  return {
    totalBooks,
    totalUsers,
    totalOrders,
    totalRevenue: Number(revenueResult._sum.total ?? 0),
    lowStockBooks,
    recentOrders,
  };
}

// ────────────────── Admin Book CRUD ──────────────────
export type AdminBookQuery = {
  page?: string;
  limit?: string;
  search?: string;
  category?: string;
  isActive?: string;
};

export async function adminFindBooks(query: AdminBookQuery) {
  const page = Math.max(Number(query.page ?? 1), 1);
  const limit = Math.min(Math.max(Number(query.limit ?? 15), 1), 50);
  const skip = (page - 1) * limit;

  const where = {
    ...(query.isActive !== undefined ? { isActive: query.isActive === "true" } : {}),
    ...(query.search
      ? {
          OR: [
            { title: { contains: query.search, mode: "insensitive" as const } },
            { author: { contains: query.search, mode: "insensitive" as const } },
            { isbn: { contains: query.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(query.category ? { category: { slug: query.category } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.book.findMany({
      where,
      include: { category: true },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.book.count({ where }),
  ]);

  return {
    items,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export type CreateBookInput = {
  title: string;
  slug: string;
  author: string;
  publisher?: string;
  publishYear?: number;
  isbn?: string;
  description?: string;
  coverUrl?: string;
  price: number;
  originalPrice?: number;
  stock: number;
  categoryId?: number;
  isFeatured?: boolean;
};

export async function adminCreateBook(data: CreateBookInput) {
  return prisma.book.create({
    data: {
      title: data.title,
      slug: data.slug,
      author: data.author,
      publisher: data.publisher,
      publishYear: data.publishYear,
      isbn: data.isbn,
      description: data.description,
      coverUrl: data.coverUrl,
      price: data.price,
      originalPrice: data.originalPrice ?? null,
      stock: data.stock,
      categoryId: data.categoryId ?? null,
      isFeatured: data.isFeatured ?? false,
      isActive: true,
    },
    include: { category: true },
  });
}

export async function adminUpdateBook(id: string, data: Partial<CreateBookInput> & { isActive?: boolean }) {
  return prisma.book.update({
    where: { id },
    data: {
      ...(data.title !== undefined && { title: data.title }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.author !== undefined && { author: data.author }),
      ...(data.publisher !== undefined && { publisher: data.publisher }),
      ...(data.publishYear !== undefined && { publishYear: data.publishYear }),
      ...(data.isbn !== undefined && { isbn: data.isbn }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.coverUrl !== undefined && { coverUrl: data.coverUrl }),
      ...(data.price !== undefined && { price: data.price }),
      ...(data.originalPrice !== undefined && { originalPrice: data.originalPrice }),
      ...(data.stock !== undefined && { stock: data.stock }),
      ...(data.categoryId !== undefined && { categoryId: data.categoryId }),
      ...(data.isFeatured !== undefined && { isFeatured: data.isFeatured }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
    include: { category: true },
  });
}

export async function adminDeleteBook(id: string) {
  // Soft delete — chỉ đánh dấu isActive = false
  return prisma.book.update({
    where: { id },
    data: { isActive: false },
  });
}

// ────────────────── Admin Categories ──────────────────
export type AdminCategoryInput = {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  imageUrl?: string;
  parentId?: number | null;
  sortOrder?: number;
  isActive?: boolean;
};

export async function adminFindCategories(query: { search?: string; isActive?: string }) {
  const where = {
    ...(query.isActive !== undefined ? { isActive: query.isActive === "true" } : {}),
    ...(query.search
      ? {
          OR: [
            { name: { contains: query.search, mode: "insensitive" as const } },
            { slug: { contains: query.search, mode: "insensitive" as const } },
            { description: { contains: query.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  return prisma.category.findMany({
    where,
    include: {
      parent: { select: { id: true, name: true, slug: true } },
      _count: { select: { books: true, children: true } },
    },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });
}

export async function adminCreateCategory(data: AdminCategoryInput) {
  return prisma.category.create({
    data: {
      name: data.name,
      slug: data.slug,
      description: data.description || null,
      icon: data.icon || null,
      imageUrl: data.imageUrl || null,
      parentId: data.parentId ?? null,
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
    },
    include: {
      parent: { select: { id: true, name: true, slug: true } },
      _count: { select: { books: true, children: true } },
    },
  });
}

export async function adminUpdateCategory(id: number, data: Partial<AdminCategoryInput>) {
  if (data.parentId === id) {
    throw new Error("Danh mục cha không được trùng với chính danh mục đang sửa");
  }

  return prisma.category.update({
    where: { id },
    data: {
      ...(data.name !== undefined && { name: data.name }),
      ...(data.slug !== undefined && { slug: data.slug }),
      ...(data.description !== undefined && { description: data.description || null }),
      ...(data.icon !== undefined && { icon: data.icon || null }),
      ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl || null }),
      ...(data.parentId !== undefined && { parentId: data.parentId ?? null }),
      ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
    include: {
      parent: { select: { id: true, name: true, slug: true } },
      _count: { select: { books: true, children: true } },
    },
  });
}

export async function adminDeleteCategory(id: number) {
  return prisma.category.update({
    where: { id },
    data: { isActive: false },
  });
}

// ────────────────── Admin Users ──────────────────
export async function adminFindUsers(query: { page?: string; search?: string }) {
  const page = Math.max(Number(query.page ?? 1), 1);
  const limit = 15;
  const skip = (page - 1) * limit;

  const where = query.search
    ? {
        OR: [
          { fullName: { contains: query.search, mode: "insensitive" as const } },
          { email: { contains: query.search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        _count: { select: { orders: true } },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.user.count({ where }),
  ]);

  return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function adminUpdateUserStatus(id: string, isActive: boolean, currentAdminId?: string) {
  if (currentAdminId && id === currentAdminId && !isActive) {
    throw new Error("Không thể khóa chính tài khoản admin đang đăng nhập");
  }

  return prisma.user.update({
    where: { id },
    data: { isActive },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
      _count: { select: { orders: true } },
    },
  });
}

// ────────────────── Admin Orders ──────────────────
export type AdminOrderQuery = {
  page?: string;
  status?: string;
  search?: string;
};

export async function adminFindOrders(query: AdminOrderQuery) {
  const page = Math.max(Number(query.page ?? 1), 1);
  const limit = 15;
  const skip = (page - 1) * limit;

  const where = {
    ...(query.status ? { status: query.status as any } : {}),
    ...(query.search
      ? {
          OR: [
            { orderCode: { contains: query.search, mode: "insensitive" as const } },
            { shippingName: { contains: query.search, mode: "insensitive" as const } },
            { shippingPhone: { contains: query.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  const [items, total] = await Promise.all([
    prisma.order.findMany({
      where,
      include: {
        user: { select: { id: true, fullName: true, email: true } },
        items: {
          select: {
            id: true,
            bookTitle: true,
            bookCover: true,
            quantity: true,
            unitPrice: true,
            totalPrice: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    prisma.order.count({ where }),
  ]);

  return { items, meta: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

export async function adminUpdateOrderStatus(
  id: string,
  data: { status?: string; paymentStatus?: string; cancelReason?: string },
) {
  const now = new Date();
  const statusDates =
    data.status === "CONFIRMED"
      ? { confirmedAt: now }
      : data.status === "SHIPPING"
        ? { shippedAt: now }
        : data.status === "DELIVERED"
          ? { deliveredAt: now }
          : data.status === "CANCELLED"
            ? { cancelledAt: now, cancelReason: data.cancelReason ?? "Admin cancelled" }
            : {};

  return prisma.order.update({
    where: { id },
    data: {
      ...(data.status && { status: data.status as any }),
      ...(data.paymentStatus && { paymentStatus: data.paymentStatus as any }),
      ...statusDates,
    },
    include: {
      user: { select: { id: true, fullName: true, email: true } },
      items: true,
    },
  });
}

// ────────────────── Admin Coupons ──────────────────
export type AdminCouponQuery = {
  search?: string;
  type?: string;
  isActive?: string;
};

export type AdminCouponInput = {
  code: string;
  name?: string;
  type: "PERCENT" | "FIXED_AMOUNT" | "FREE_SHIP";
  value: number;
  minOrderValue?: number;
  maxDiscount?: number | null;
  usageLimit?: number | null;
  startDate?: string | null;
  endDate?: string | null;
  isActive?: boolean;
};

function normalizeCouponData(data: Partial<AdminCouponInput>) {
  return {
    ...(data.code !== undefined && { code: data.code.trim().toUpperCase() }),
    ...(data.name !== undefined && { name: data.name?.trim() || null }),
    ...(data.type !== undefined && { type: data.type as any }),
    ...(data.value !== undefined && { value: data.value }),
    ...(data.minOrderValue !== undefined && { minOrderValue: data.minOrderValue ?? 0 }),
    ...(data.maxDiscount !== undefined && { maxDiscount: data.maxDiscount ?? null }),
    ...(data.usageLimit !== undefined && { usageLimit: data.usageLimit ?? null }),
    ...(data.startDate !== undefined && { startDate: data.startDate ? new Date(data.startDate) : null }),
    ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
    ...(data.isActive !== undefined && { isActive: data.isActive }),
  };
}

export async function adminFindCoupons(query: AdminCouponQuery) {
  const where = {
    ...(query.isActive !== undefined ? { isActive: query.isActive === "true" } : {}),
    ...(query.type ? { type: query.type as any } : {}),
    ...(query.search
      ? {
          OR: [
            { code: { contains: query.search, mode: "insensitive" as const } },
            { name: { contains: query.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  return prisma.coupon.findMany({
    where,
    orderBy: [{ isActive: "desc" }, { createdAt: "desc" }],
  });
}

export async function adminCreateCoupon(data: AdminCouponInput) {
  return prisma.coupon.create({
    data: {
      ...normalizeCouponData(data),
      minOrderValue: data.minOrderValue ?? 0,
      usedCount: 0,
      isActive: data.isActive ?? true,
    } as any,
  });
}

export async function adminUpdateCoupon(id: string, data: Partial<AdminCouponInput>) {
  return prisma.coupon.update({
    where: { id },
    data: normalizeCouponData(data) as any,
  });
}

export async function adminDeleteCoupon(id: string) {
  return prisma.coupon.update({
    where: { id },
    data: { isActive: false },
  });
}

// ────────────────── Admin Banners ──────────────────
export type AdminBannerQuery = {
  search?: string;
  position?: string;
  isActive?: string;
};

export type AdminBannerInput = {
  title?: string;
  subtitle?: string;
  imageUrl: string;
  linkUrl?: string;
  buttonText?: string;
  position: "HOME_HERO" | "HOME_MID" | "CATEGORY_TOP";
  sortOrder?: number;
  isActive?: boolean;
  startDate?: string | null;
  endDate?: string | null;
};

function normalizeBannerData(data: Partial<AdminBannerInput>) {
  return {
    ...(data.title !== undefined && { title: data.title?.trim() || null }),
    ...(data.subtitle !== undefined && { subtitle: data.subtitle?.trim() || null }),
    ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl.trim() }),
    ...(data.linkUrl !== undefined && { linkUrl: data.linkUrl?.trim() || null }),
    ...(data.buttonText !== undefined && { buttonText: data.buttonText?.trim() || null }),
    ...(data.position !== undefined && { position: data.position as any }),
    ...(data.sortOrder !== undefined && { sortOrder: data.sortOrder ?? 0 }),
    ...(data.isActive !== undefined && { isActive: data.isActive }),
    ...(data.startDate !== undefined && { startDate: data.startDate ? new Date(data.startDate) : null }),
    ...(data.endDate !== undefined && { endDate: data.endDate ? new Date(data.endDate) : null }),
  };
}

export async function adminFindBanners(query: AdminBannerQuery) {
  const where = {
    ...(query.isActive !== undefined ? { isActive: query.isActive === "true" } : {}),
    ...(query.position ? { position: query.position as any } : {}),
    ...(query.search
      ? {
          OR: [
            { title: { contains: query.search, mode: "insensitive" as const } },
            { subtitle: { contains: query.search, mode: "insensitive" as const } },
            { buttonText: { contains: query.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
  };

  return prisma.banner.findMany({
    where,
    orderBy: [{ isActive: "desc" }, { position: "asc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
  });
}

export async function adminCreateBanner(data: AdminBannerInput) {
  return prisma.banner.create({
    data: {
      ...normalizeBannerData(data),
      sortOrder: data.sortOrder ?? 0,
      isActive: data.isActive ?? true,
    } as any,
  });
}

export async function adminUpdateBanner(id: number, data: Partial<AdminBannerInput>) {
  return prisma.banner.update({
    where: { id },
    data: normalizeBannerData(data) as any,
  });
}

export async function adminDeleteBanner(id: number) {
  return prisma.banner.update({
    where: { id },
    data: { isActive: false },
  });
}



// ────────────────── Admin Reviews ──────────────────
export type AdminReviewQuery = {
  page?: string;
  search?: string;
  rating?: string;
};

export async function adminFindReviews(query: AdminReviewQuery) {
  const page = Math.max(Number(query.page ?? 1), 1);
  const limit = 15;
  const skip = (page - 1) * limit;
  const rating = Number(query.rating);

  const where = {
    ...(Number.isInteger(rating) && rating >= 1 && rating <= 5 ? { rating } : {}),
    ...(query.search
      ? {
          OR: [
            { title: { contains: query.search, mode: "insensitive" as const } },
            { content: { contains: query.search, mode: "insensitive" as const } },
            { user: { fullName: { contains: query.search, mode: "insensitive" as const } } },
            { user: { email: { contains: query.search, mode: "insensitive" as const } } },
            { book: { title: { contains: query.search, mode: "insensitive" as const } } },
          ],
        }
      : {}),
  };

  const [items, total, stats] = await Promise.all([
    prisma.review.findMany({
      where,
      include: {
        user: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
        book: { select: { id: true, title: true, slug: true, coverUrl: true } },
      },
      orderBy: [{ isApproved: "asc" }, { createdAt: "desc" }],
      skip,
      take: limit,
    }),
    prisma.review.count({ where }),
    prisma.review.aggregate({
      _count: { _all: true },
      _avg: { rating: true },
      where: query.search
        ? {
            OR: [
              { title: { contains: query.search, mode: "insensitive" as const } },
              { content: { contains: query.search, mode: "insensitive" as const } },
              { user: { fullName: { contains: query.search, mode: "insensitive" as const } } },
              { book: { title: { contains: query.search, mode: "insensitive" as const } } },
            ],
          }
        : undefined,
    }),
  ]);

  const approvedCount = await prisma.review.count({ where: { isApproved: true } });

  return {
    items,
    stats: {
      total: stats._count._all,
      approved: approvedCount,
      pending: 0,
      averageRating: Number((stats._avg.rating ?? 0).toFixed(1)),
    },
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function adminUpdateReviewStatus(id: string, isApproved: boolean) {
  const review = await prisma.review.update({
    where: { id },
    data: { isApproved },
    include: {
      user: { select: { id: true, fullName: true, email: true, avatarUrl: true } },
      book: { select: { id: true, title: true, slug: true, coverUrl: true } },
    },
  });

  await recalculateBookRating(review.bookId);
  return review;
}

export async function adminDeleteReview(id: string) {
  const review = await prisma.review.delete({ where: { id } });
  await recalculateBookRating(review.bookId);
  return review;
}
