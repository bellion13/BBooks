import type { Request, Response } from "express";
import { getHomeData } from "../services/home.service.js";
import { sendSuccess } from "../utils/response.js";

export async function getHome(_req: Request, res: Response) {
  const data = await getHomeData();
  return sendSuccess(res, "Lấy dữ liệu trang chủ thành công", data);
}
