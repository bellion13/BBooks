import { prisma } from "../config/database.js";
import { maskReviewList } from "./moderation.service.js";

export type BookQuery = {
  page?: string;
  limit?: string;
  category?: string;
  search?: string;
  featured?: string;
};

export async function findBooks(query: BookQuery) {
  const page = Math.max(Number(query.page ?? 1), 1);
  const limit = Math.min(Math.max(Number(query.limit ?? 12), 1), 50);
  const skip = (page - 1) * limit;

  const where = {
    isActive: true,
    ...(query.featured === "true" ? { isFeatured: true } : {}),
    ...(query.search
      ? {
          OR: [
            { title: { contains: query.search, mode: "insensitive" as const } },
            { author: { contains: query.search, mode: "insensitive" as const } },
          ],
        }
      : {}),
    ...(query.category ? { category: { slug: query.category } } : {}),
  };

  const [items, total] = await Promise.all([
    prisma.book.findMany({
      where,
      include: { category: true },
      orderBy: [{ isFeatured: "desc" }, { soldCount: "desc" }, { createdAt: "desc" }],
      skip,
      take: limit,
    }),
    prisma.book.count({ where }),
  ]);

  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}

export async function findBookBySlug(slug: string) {
  const book = await prisma.book.findUnique({
    where: { slug },
    include: {
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      reviews: {
        where: { isApproved: true },
        include: { user: { select: { id: true, fullName: true, avatarUrl: true } } },
        orderBy: { createdAt: "desc" },
        take: 10,
      },
    },
  });

  if (!book) return null;

  return {
    ...book,
    reviews: await maskReviewList(book.reviews),
  };
}

