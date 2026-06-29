import { prisma } from "../config/database.js";

function activeBannerWhere(position: "HOME_HERO" | "HOME_MID" | "CATEGORY_TOP", now: Date) {
  return {
    position,
    isActive: true,
    OR: [{ startDate: null }, { startDate: { lte: now } }],
    AND: [{ OR: [{ endDate: null }, { endDate: { gte: now } }] }],
  };
}

export async function getHomeData() {
  const now = new Date();

  const [heroBanners, midBanners, categories, bestSellingBooks, newBooks, saleCandidates] = await Promise.all([
    prisma.banner.findMany({
      where: activeBannerWhere("HOME_HERO", now),
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    }),
    prisma.banner.findMany({
      where: activeBannerWhere("HOME_MID", now),
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
      take: 3,
    }),
    prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    }),
    prisma.book.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: [{ soldCount: "desc" }, { reviewCount: "desc" }, { createdAt: "desc" }],
      take: 10,
    }),
    prisma.book.findMany({
      where: { isActive: true },
      include: { category: true },
      orderBy: { createdAt: "desc" },
      take: 10,
    }),
    prisma.book.findMany({
      where: { isActive: true, originalPrice: { not: null } },
      include: { category: true },
      orderBy: [{ isFeatured: "desc" }, { soldCount: "desc" }, { createdAt: "desc" }],
      take: 30,
    }),
  ]);

  const saleBooks = saleCandidates
    .filter((book) => book.originalPrice && Number(book.originalPrice) > Number(book.price))
    .slice(0, 10);

  return {
    heroBanners,
    midBanners,
    categories,
    bestSellingBooks,
    newBooks,
    saleBooks,
  };
}
