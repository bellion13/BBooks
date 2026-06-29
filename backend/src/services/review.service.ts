import { prisma } from "../config/database.js";
import { maskReviewList, maskReviewText } from "./moderation.service.js";

export type CreateReviewInput = {
  rating: number;
  title?: string;
  content?: string;
};

const REVIEW_COOLDOWN_SECONDS = 30;

const reviewInclude = {
  user: { select: { id: true, fullName: true, avatarUrl: true } },
  book: { select: { id: true, title: true, slug: true, coverUrl: true } },
};

export async function recalculateBookRating(bookId: string) {
  const approvedReviews = await prisma.review.findMany({
    where: { bookId, isApproved: true },
    select: { rating: true },
  });

  const reviewCount = approvedReviews.length;
  const avgRating = reviewCount
    ? approvedReviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
    : 0;

  return prisma.book.update({
    where: { id: bookId },
    data: {
      avgRating: Number(avgRating.toFixed(1)),
      reviewCount,
    },
  });
}

export async function findApprovedReviewsByBookSlug(slug: string) {
  const book = await prisma.book.findUnique({
    where: { slug },
    select: { id: true, isActive: true },
  });

  if (!book || !book.isActive) {
    throw new Error("Không tìm thấy sách");
  }

  const reviews = await prisma.review.findMany({
    where: { bookId: book.id, isApproved: true },
    include: { user: { select: { id: true, fullName: true, avatarUrl: true } } },
    orderBy: { createdAt: "desc" },
  });

  return maskReviewList(reviews);
}

export async function createBookReview(slug: string, userId: string, input: CreateReviewInput) {
  const rating = Number(input.rating);

  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw new Error("Điểm đánh giá phải là số nguyên từ 1 đến 5");
  }

  const book = await prisma.book.findUnique({
    where: { slug },
    select: { id: true, isActive: true },
  });

  if (!book || !book.isActive) {
    throw new Error("Không tìm thấy sách");
  }

  const recentReview = await prisma.review.findFirst({
    where: {
      userId,
      createdAt: { gt: new Date(Date.now() - REVIEW_COOLDOWN_SECONDS * 1000) },
    },
    orderBy: { createdAt: "desc" },
  });

  if (recentReview) {
    throw new Error(`Bạn vui lòng chờ ${REVIEW_COOLDOWN_SECONDS} giây trước khi gửi đánh giá tiếp theo`);
  }

  const existingReview = await prisma.review.findUnique({
    where: { bookId_userId: { bookId: book.id, userId } },
  });

  if (existingReview) {
    throw new Error("Bạn đã đánh giá sách này rồi");
  }

  const review = await prisma.review.create({
    data: {
      bookId: book.id,
      userId,
      rating,
      title: input.title?.trim() || null,
      content: input.content?.trim() || null,
      isApproved: true,
    },
    include: reviewInclude,
  });

  await recalculateBookRating(book.id);
  return maskReviewText(review);
}

