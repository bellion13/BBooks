import type { Request, Response } from "express";
import { findBookBySlug, findBooks } from "../services/book.service.js";
import { createBookReview, findApprovedReviewsByBookSlug } from "../services/review.service.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { sendError, sendSuccess } from "../utils/response.js";

export async function getBooks(req: Request, res: Response) {
  const result = await findBooks(req.query);
  return sendSuccess(res, "Lấy danh sách sách thành công", result.items, result.meta);
}

export async function getBookDetail(req: Request, res: Response) {
  const slug = String(req.params.slug);
  const book = await findBookBySlug(slug);

  if (!book || !book.isActive) {
    return sendError(res, "Không tìm thấy sách", 404);
  }

  return sendSuccess(res, "Lấy chi tiết sách thành công", book);
}

export async function getBookReviews(req: Request, res: Response) {
  const slug = String(req.params.slug);

  try {
    const reviews = await findApprovedReviewsByBookSlug(slug);
    return sendSuccess(res, "Lấy đánh giá sách thành công", reviews);
  } catch (error) {
    return sendError(res, (error as Error).message || "Không tìm thấy sách", 404);
  }
}

export async function submitBookReview(req: AuthenticatedRequest, res: Response) {
  const slug = String(req.params.slug);
  const userId = req.user?.id;

  if (!userId) {
    return sendError(res, "Yêu cầu xác thực", 401);
  }

  try {
    const review = await createBookReview(slug, userId, req.body);
    return sendSuccess(res, "Gửi đánh giá thành công. Đánh giá của bạn đã được hiển thị.", review, undefined, 201);
  } catch (error) {
    const message = (error as Error).message || "Gửi đánh giá thất bại";
    const statusCode = message.includes("Không tìm thấy") ? 404 : 400;
    return sendError(res, message, statusCode);
  }
}
