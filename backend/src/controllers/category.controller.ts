import type { Request, Response } from "express";
import { findActiveCategories } from "../services/category.service.js";
import { sendSuccess } from "../utils/response.js";

export async function getCategories(_req: Request, res: Response) {
  const categories = await findActiveCategories();
  return sendSuccess(res, "Lấy danh mục thành công", categories);
}
