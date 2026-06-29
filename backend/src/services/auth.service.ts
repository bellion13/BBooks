import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../config/database.js";
import type { LoginInput, RegisterInput } from "../validations/auth.validation.js";

function signToken(userId: string, role: string) {
  const secret = process.env.JWT_SECRET;

  if (!secret) {
    throw new Error("JWT_SECRET is not configured");
  }

  const expiresIn = (process.env.JWT_EXPIRES_IN ?? "7d") as jwt.SignOptions["expiresIn"];

  return jwt.sign({ sub: userId, role }, secret, { expiresIn });
}

function toSafeUser(user: { id: string; fullName: string; email: string; phone: string | null; role: string; avatarUrl: string | null }) {
  return {
    id: user.id,
    fullName: user.fullName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatarUrl: user.avatarUrl,
  };
}

export async function register(input: RegisterInput) {
  const existed = await prisma.user.findFirst({
    where: {
      OR: [
        { email: input.email },
        ...(input.phone ? [{ phone: input.phone }] : []),
      ],
    },
  });

  if (existed) {
    const error = new Error("Email hoặc số điện thoại đã được sử dụng");
    error.name = "ConflictError";
    throw error;
  }

  const passwordHash = await bcrypt.hash(input.password, 10);
  const user = await prisma.user.create({
    data: {
      fullName: input.fullName,
      email: input.email,
      phone: input.phone,
      passwordHash,
    },
  });

  return {
    user: toSafeUser(user),
    token: signToken(user.id, user.role),
  };
}

export async function login(input: LoginInput) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });

  if (!user || !user.isActive) {
    const error = new Error("Email hoặc mật khẩu không đúng");
    error.name = "UnauthorizedError";
    throw error;
  }

  const isMatch = await bcrypt.compare(input.password, user.passwordHash);

  if (!isMatch) {
    const error = new Error("Email hoặc mật khẩu không đúng");
    error.name = "UnauthorizedError";
    throw error;
  }

  return {
    user: toSafeUser(user),
    token: signToken(user.id, user.role),
  };
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || !user.isActive) {
    const error = new Error("Tài khoản không tồn tại hoặc bị khóa");
    error.name = "UnauthorizedError";
    throw error;
  }

  return toSafeUser(user);
}
