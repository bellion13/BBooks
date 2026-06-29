import { prisma } from "../config/database.js";

export async function getWishlist(userId: string) {
  return prisma.wishlist.findMany({
    where: { userId },
    include: {
      book: {
        include: { category: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function toggleWishlist(userId: string, bookId: string) {
  const book = await prisma.book.findUnique({
    where: { id: bookId },
  });

  if (!book || !book.isActive) {
    throw new Error("Không tìm thấy sách hoặc sách đã ngừng bán");
  }

  const existing = await prisma.wishlist.findUnique({
    where: {
      userId_bookId: { userId, bookId },
    },
  });

  if (existing) {
    await prisma.wishlist.delete({
      where: { id: existing.id },
    });
    return { added: false };
  }

  await prisma.wishlist.create({
    data: {
      userId,
      bookId,
    },
  });
  return { added: true };
}
