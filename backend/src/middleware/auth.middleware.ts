import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/database.js";

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
  };
}

export async function requireAuth(req: AuthenticatedRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    const error = new Error("Yêu cầu xác thực");
    error.name = "UnauthorizedError";
    return next(error);
  }

  const token = authHeader.split(" ")[1];
  try {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET is not configured");
    }

    const decoded = jwt.verify(token, secret) as { sub: string; role: string };

    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
    });

    if (!user || !user.isActive) {
      const error = new Error("Tài khoản không tồn tại hoặc bị khóa");
      error.name = "UnauthorizedError";
      return next(error);
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };

    return next();
  } catch (err) {
    const error = new Error("Token không hợp lệ hoặc đã hết hạn");
    error.name = "UnauthorizedError";
    return next(error);
  }
}

export function requireRole(roles: string[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      const error = new Error("Bạn không có quyền thực hiện hành động này");
      error.name = "ForbiddenError";
      return next(error);
    }
    return next();
  };
}
