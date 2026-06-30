import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import { sendError, sendSuccess } from "../utils/response.js";
import * as orderService from "../services/order.service.js";

function getParamString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

export async function createOrder(req: AuthenticatedRequest, res: Response) {
  const { paymentMethod, shippingName, shippingPhone, shippingAddress, note } = req.body;

  if (!paymentMethod || !shippingName || !shippingPhone || !shippingAddress) {
    return sendError(res, "Thiếu thông tin bắt buộc để đặt hàng", 400);
  }

  const order = await orderService.createOrderFromCart(req.user!.id, {
    paymentMethod,
    shippingName,
    shippingPhone,
    shippingAddress,
    note,
  });

  return sendSuccess(res, "Đặt hàng thành công", order, undefined, 201);
}

export async function getMyOrders(req: AuthenticatedRequest, res: Response) {
  const orders = await orderService.getMyOrders(req.user!.id);
  return sendSuccess(res, "Lấy danh sách đơn hàng thành công", orders);
}

export async function getMyOrderById(req: AuthenticatedRequest, res: Response) {
  const id = getParamString(req.params.id);
  if (!id) return sendError(res, "Thiếu order ID", 400);

  const order = await orderService.getMyOrderById(req.user!.id, id);
  return sendSuccess(res, "Lấy chi tiết đơn hàng thành công", order);
}

export async function cancelMyOrder(req: AuthenticatedRequest, res: Response) {
  const id = getParamString(req.params.id);
  if (!id) return sendError(res, "Thiếu order ID", 400);

  const order = await orderService.cancelMyOrder(req.user!.id, id);
  return sendSuccess(res, "Đã hủy đơn hàng", order);
}
