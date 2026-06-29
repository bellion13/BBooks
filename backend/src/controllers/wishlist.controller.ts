import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { sendSuccess, sendError } from "../utils/response.js";
import * as wishlistService from "../services/wishlist.service.js";

export async function getWishlist(req: AuthenticatedRequest, res: Response) {
  const items = await wishlistService.getWishlist(req.user!.id);
  return sendSuccess(res, "Lấy danh sách yêu thích thành công", items);
}

export async function toggleWishlist(req: AuthenticatedRequest, res: Response) {
  const { bookId } = req.body;

  if (!bookId) {
    return sendError(res, "Thiếu bookId", 400);
  }

  const result = await wishlistService.toggleWishlist(req.user!.id, bookId);
  const message = result.added 
    ? "Đã thêm vào danh sách yêu thích" 
    : "Đã xóa khỏi danh sách yêu thích";
  
  return sendSuccess(res, message, result);
}
