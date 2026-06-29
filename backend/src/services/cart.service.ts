import { prisma } from "../config/database.js";

export async function getCart(userId: string) {
  return prisma.cartItem.findMany({
    where: { userId },
    include: {
      book: {
        include: { category: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function addToCart(userId: string, bookId: string, quantity: number) {
  if (quantity <= 0) {
    throw new Error("Số lượng phải lớn hơn 0");
  }

  const book = await prisma.book.findUnique({
    where: { id: bookId },
  });

  if (!book || !book.isActive) {
    throw new Error("Không tìm thấy sách hoặc sách đã ngừng bán");
  }

  if (book.stock < quantity) {
    throw new Error(`Số lượng yêu cầu vượt quá tồn kho (${book.stock})`);
  }

  const existing = await prisma.cartItem.findUnique({
    where: {
      userId_bookId: { userId, bookId },
    },
  });

  if (existing) {
    const newQuantity = existing.quantity + quantity;
    if (book.stock < newQuantity) {
      throw new Error(`Tổng số lượng trong giỏ hàng vượt quá tồn kho (${book.stock})`);
    }
    return prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: newQuantity },
      include: {
        book: {
          include: { category: true },
        },
      },
    });
  }

  return prisma.cartItem.create({
    data: {
      userId,
      bookId,
      quantity,
    },
    include: {
      book: {
        include: { category: true },
      },
    },
  });
}

export async function updateCartItemQuantity(userId: string, cartItemId: string, quantity: number) {
  if (quantity <= 0) {
    throw new Error("Số lượng phải lớn hơn 0");
  }

  const cartItem = await prisma.cartItem.findFirst({
    where: { id: cartItemId, userId },
  });

  if (!cartItem) {
    const error = new Error("Không tìm thấy mục trong giỏ hàng");
    error.name = "NotFoundError";
    throw error;
  }

  const book = await prisma.book.findUnique({
    where: { id: cartItem.bookId },
  });

  if (!book || !book.isActive) {
    throw new Error("Sách đã ngừng bán");
  }

  if (book.stock < quantity) {
    throw new Error(`Số lượng yêu cầu vượt quá tồn kho (${book.stock})`);
  }

  return prisma.cartItem.update({
    where: { id: cartItemId },
    data: { quantity },
    include: {
      book: {
        include: { category: true },
      },
    },
  });
}

export async function removeFromCart(userId: string, cartItemId: string) {
  const cartItem = await prisma.cartItem.findFirst({
    where: { id: cartItemId, userId },
  });

  if (!cartItem) {
    const error = new Error("Không tìm thấy mục trong giỏ hàng");
    error.name = "NotFoundError";
    throw error;
  }

  return prisma.cartItem.delete({
    where: { id: cartItemId },
  });
}

export async function clearCart(userId: string) {
  return prisma.cartItem.deleteMany({
    where: { userId },
  });
}
