import { prisma } from "../config/database.js";
import { sendOrderConfirmationEmail } from "./email.service.js";

type PaymentMethodInput = "COD" | "BANK_TRANSFER";

type PrismaTransaction = Parameters<Parameters<typeof prisma.$transaction>[0]>[0];

export type CreateOrderInput = {
  paymentMethod: PaymentMethodInput;
  shippingName: string;
  shippingPhone: string;
  shippingAddress: string;
  note?: string;
};

const FREE_SHIP_THRESHOLD = 199000;
const STANDARD_SHIPPING_FEE = 30000;
const CANCELLABLE_STATUSES = ["PENDING", "CONFIRMED"];

function createNamedError(message: string, name = "BadRequestError") {
  const error = new Error(message);
  error.name = name;
  return error;
}

function generateOrderCode() {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `BB${yyyy}${mm}${dd}${random}`;
}

function calculateShippingFee(subtotal: number) {
  if (subtotal <= 0 || subtotal >= FREE_SHIP_THRESHOLD) return 0;
  return STANDARD_SHIPPING_FEE;
}

function getOrderInclude() {
  return {
    user: { select: { id: true, fullName: true, email: true } },
    items: {
      select: {
        id: true,
        bookId: true,
        bookTitle: true,
        bookCover: true,
        quantity: true,
        unitPrice: true,
        totalPrice: true,
      },
    },
  };
}

async function restoreOrderInventory(tx: PrismaTransaction, orderId: string) {
  const items = await tx.orderItem.findMany({ where: { orderId } });

  for (const item of items) {
    if (!item.bookId) continue;
    await tx.book.update({
      where: { id: item.bookId },
      data: {
        stock: { increment: item.quantity },
        soldCount: { decrement: item.quantity },
      },
    });
  }
}

export async function createOrderFromCart(userId: string, data: CreateOrderInput) {
  if (!data.shippingName?.trim()) throw createNamedError("Vui lòng nhập họ tên người nhận");
  if (!data.shippingPhone?.trim()) throw createNamedError("Vui lòng nhập số điện thoại nhận hàng");
  if (!data.shippingAddress?.trim()) throw createNamedError("Vui lòng nhập địa chỉ giao hàng");
  if (!["COD", "BANK_TRANSFER"].includes(data.paymentMethod)) {
    throw createNamedError("Phương thức thanh toán chưa được hỗ trợ");
  }

  const order = await prisma.$transaction(async (tx) => {
    const cartItems = await tx.cartItem.findMany({
      where: { userId },
      include: { book: true },
      orderBy: { createdAt: "asc" },
    });

    if (cartItems.length === 0) {
      throw createNamedError("Giỏ hàng đang trống");
    }

    for (const item of cartItems) {
      if (!item.book.isActive) {
        throw createNamedError(`Sách "${item.book.title}" đã ngừng bán`);
      }
      if (item.quantity <= 0) {
        throw createNamedError("Số lượng sản phẩm không hợp lệ");
      }
      if (item.book.stock < item.quantity) {
        throw createNamedError(`Sách "${item.book.title}" chỉ còn ${item.book.stock} cuốn`);
      }
    }

    const subtotal = cartItems.reduce((sum, item) => sum + Number(item.book.price) * item.quantity, 0);
    const shippingFee = calculateShippingFee(subtotal);
    const discount = 0;
    const total = subtotal + shippingFee - discount;

    const order = await tx.order.create({
      data: {
        orderCode: generateOrderCode(),
        userId,
        paymentMethod: data.paymentMethod,
        paymentStatus: "UNPAID",
        subtotal,
        discount,
        shippingFee,
        total,
        note: data.note?.trim() || null,
        shippingName: data.shippingName.trim(),
        shippingPhone: data.shippingPhone.trim(),
        shippingAddress: data.shippingAddress.trim(),
        items: {
          create: cartItems.map((item) => ({
            bookId: item.bookId,
            bookTitle: item.book.title,
            bookCover: item.book.coverUrl,
            quantity: item.quantity,
            unitPrice: item.book.price,
            totalPrice: Number(item.book.price) * item.quantity,
          })),
        },
      },
      include: getOrderInclude(),
    });

    for (const item of cartItems) {
      const updated = await tx.book.updateMany({
        where: { id: item.bookId, stock: { gte: item.quantity }, isActive: true },
        data: {
          stock: { decrement: item.quantity },
          soldCount: { increment: item.quantity },
        },
      });

      if (updated.count !== 1) {
        throw createNamedError(`Sách "${item.book.title}" không còn đủ tồn kho`);
      }
    }

    await tx.cartItem.deleteMany({ where: { userId } });
    return order;
  });

  sendOrderConfirmationEmail(order).catch((error) => {
    console.warn("[mail] Failed to send order confirmation email", {
      orderCode: order.orderCode,
      error: error instanceof Error ? error.message : error,
    });
  });

  return order;
}

export async function getMyOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: getOrderInclude(),
    orderBy: { createdAt: "desc" },
  });
}

export async function getMyOrderById(userId: string, orderId: string) {
  const order = await prisma.order.findFirst({
    where: { id: orderId, userId },
    include: getOrderInclude(),
  });

  if (!order) throw createNamedError("Không tìm thấy đơn hàng", "NotFoundError");
  return order;
}

export async function cancelMyOrder(userId: string, orderId: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findFirst({
      where: { id: orderId, userId },
    });

    if (!order) throw createNamedError("Không tìm thấy đơn hàng", "NotFoundError");
    if (!CANCELLABLE_STATUSES.includes(order.status)) {
      throw createNamedError("Đơn hàng này không thể hủy ở trạng thái hiện tại");
    }

    await restoreOrderInventory(tx, order.id);

    return tx.order.update({
      where: { id: order.id },
      data: {
        status: "CANCELLED",
        cancelledAt: new Date(),
        cancelReason: "Khách hàng hủy đơn",
        ...(order.paymentStatus === "PAID" ? { paymentStatus: "REFUNDED" as const } : {}),
      },
      include: getOrderInclude(),
    });
  });
}
