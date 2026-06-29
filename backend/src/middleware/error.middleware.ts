import type { NextFunction, Request, Response } from "express";
import { sendError } from "../utils/response.js";

function getStatusCode(error: Error) {
  if (error.name === "ConflictError") return 409;
  if (error.name === "UnauthorizedError") return 401;
  if (error.name === "ForbiddenError") return 403;
  return 500;
}

export function notFoundHandler(req: Request, res: Response) {
  return sendError(res, `Không tìm thấy endpoint ${req.method} ${req.originalUrl}`, 404);
}

export function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  console.error(error);
  return sendError(res, error.message || "Lỗi máy chủ", getStatusCode(error));
}
