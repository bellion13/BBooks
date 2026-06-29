import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { sendSuccess, sendError } from "../utils/response.js";
import * as cartService from "../services/cart.service.js";

export async function getCart(req: AuthenticatedRequest, res: Response) {
  const items = await cartService.getCart(req.user!.id);
  return sendSuccess(res, "Lấy giỏ hàng thành công", items);
}

export async function addToCart(req: AuthenticatedRequest, res: Response) {
  const { bookId, quantity } = req.body;
  
  if (!bookId) {
    return sendError(res, "Thiếu bookId", 400);
  }

  const parsedQuantity = quantity ? parseInt(quantity, 10) : 1;
  const item = await cartService.addToCart(req.user!.id, bookId, parsedQuantity);
  return sendSuccess(res, "Đã thêm vào giỏ hàng", item, undefined, 201);
}

export async function updateCartItem(req: AuthenticatedRequest, res: Response) {
  const id = String(req.params.id);
  const { quantity } = req.body;

  if (quantity === undefined) {
    return sendError(res, "Thiếu số lượng", 400);
  }

  const parsedQuantity = parseInt(quantity, 10);
  const item = await cartService.updateCartItemQuantity(req.user!.id, id, parsedQuantity);
  return sendSuccess(res, "Cập nhật số lượng thành công", item);
}

export async function removeFromCart(req: AuthenticatedRequest, res: Response) {
  const id = String(req.params.id);
  await cartService.removeFromCart(req.user!.id, id);
  return sendSuccess(res, "Đã xóa sản phẩm khỏi giỏ hàng");
}

export async function clearCart(req: AuthenticatedRequest, res: Response) {
  await cartService.clearCart(req.user!.id);
  return sendSuccess(res, "Đã xóa toàn bộ giỏ hàng");
}
