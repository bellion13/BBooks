import type { Request, Response } from "express";
import { sendSuccess } from "../utils/response.js";
import * as authService from "../services/auth.service.js";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";

export async function register(req: Request, res: Response) {
  const data = await authService.register(req.body);
  return sendSuccess(res, "Đăng ký tài khoản thành công", data, undefined, 201);
}

export async function login(req: Request, res: Response) {
  const data = await authService.login(req.body);
  return sendSuccess(res, "Đăng nhập thành công", data);
}

export async function getProfile(req: AuthenticatedRequest, res: Response) {
  const user = await authService.getProfile(req.user!.id);
  return sendSuccess(res, "Lấy thông tin người dùng thành công", user);
}
