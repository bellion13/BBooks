import type { Response } from "express";
import type { AuthenticatedRequest } from "../middleware/auth.middleware.js";
import {
  getDashboardStats,
  adminFindBooks,
  adminCreateBook,
  adminUpdateBook,
  adminDeleteBook,
  adminFindCategories,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  adminFindUsers,
  adminUpdateUserStatus,
  adminFindOrders,
  adminUpdateOrderStatus,
  adminFindCoupons,
  adminCreateCoupon,
  adminUpdateCoupon,
  adminDeleteCoupon,
  adminFindBanners,
  adminCreateBanner,
  adminUpdateBanner,
  adminDeleteBanner,
  adminFindReviews,
  adminDeleteReview,
} from "../services/admin.service.js";
import {
  adminCreateModerationWord,
  adminDeleteModerationWord,
  adminFindModerationWords,
  adminUpdateModerationWord,
} from "../services/moderation.service.js";
import { sendError, sendSuccess } from "../utils/response.js";

function getParamString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

// GET /admin/dashboard
export async function getDashboard(req: AuthenticatedRequest, res: Response) {
  const stats = await getDashboardStats();
  return sendSuccess(res, "Thống kê dashboard", stats);
}

// GET /admin/books
export async function getAdminBooks(req: AuthenticatedRequest, res: Response) {
  const result = await adminFindBooks(req.query as any);
  return sendSuccess(res, "Danh sách sách (admin)", result.items, result.meta);
}

// POST /admin/books
export async function createBook(req: AuthenticatedRequest, res: Response) {
  const { title, slug, author, price, stock } = req.body;
  if (!title || !slug || !author || price === undefined || stock === undefined) {
    return sendError(res, "Thiếu thông tin bắt buộc: title, slug, author, price, stock", 400);
  }
  const book = await adminCreateBook(req.body);
  return sendSuccess(res, "Tạo sách thành công", book, undefined, 201);
}

// PUT /admin/books/:id
export async function updateBook(req: AuthenticatedRequest, res: Response) {
  const id = getParamString(req.params.id);
  if (!id) return sendError(res, "Thiếu book ID", 400);
  const book = await adminUpdateBook(id, req.body);
  return sendSuccess(res, "Cập nhật sách thành công", book);
}

// DELETE /admin/books/:id
export async function deleteBook(req: AuthenticatedRequest, res: Response) {
  const id = getParamString(req.params.id);
  if (!id) return sendError(res, "Thiếu book ID", 400);
  await adminDeleteBook(id);
  return sendSuccess(res, "Đã ẩn sách thành công (soft delete)");
}

// GET /admin/categories
export async function getAdminCategories(req: AuthenticatedRequest, res: Response) {
  const categories = await adminFindCategories(req.query as any);
  return sendSuccess(res, "Danh sách danh mục (admin)", categories);
}

// POST /admin/categories
export async function createCategory(req: AuthenticatedRequest, res: Response) {
  const { name, slug } = req.body;
  if (!name || !slug) return sendError(res, "Thiếu thông tin bắt buộc: name, slug", 400);
  const category = await adminCreateCategory(req.body);
  return sendSuccess(res, "Tạo danh mục thành công", category, undefined, 201);
}

// PUT /admin/categories/:id
export async function updateCategory(req: AuthenticatedRequest, res: Response) {
  const id = Number(getParamString(req.params.id));
  if (!Number.isInteger(id) || id <= 0) return sendError(res, "Thiếu category ID hợp lệ", 400);

  try {
    const category = await adminUpdateCategory(id, req.body);
    return sendSuccess(res, "Cập nhật danh mục thành công", category);
  } catch (error) {
    return sendError(res, (error as Error).message || "Cập nhật danh mục thất bại", 400);
  }
}

// DELETE /admin/categories/:id
export async function deleteCategory(req: AuthenticatedRequest, res: Response) {
  const id = Number(getParamString(req.params.id));
  if (!Number.isInteger(id) || id <= 0) return sendError(res, "Thiếu category ID hợp lệ", 400);
  await adminDeleteCategory(id);
  return sendSuccess(res, "Đã ẩn danh mục thành công (soft delete)");
}

// GET /admin/users
export async function getAdminUsers(req: AuthenticatedRequest, res: Response) {
  const result = await adminFindUsers(req.query as any);
  return sendSuccess(res, "Danh sách người dùng (admin)", result.items, result.meta);
}


// PATCH /admin/users/:id/status
export async function updateUserStatus(req: AuthenticatedRequest, res: Response) {
  const id = getParamString(req.params.id);
  const { isActive } = req.body;
  if (!id) return sendError(res, "Thiếu user ID", 400);
  if (typeof isActive !== "boolean") return sendError(res, "isActive phải là boolean", 400);

  try {
    const user = await adminUpdateUserStatus(id, isActive, req.user?.id);
    return sendSuccess(res, isActive ? "Đã mở khóa tài khoản" : "Đã khóa tài khoản", user);
  } catch (error) {
    return sendError(res, (error as Error).message || "Cập nhật người dùng thất bại", 400);
  }
}

// GET /admin/orders
export async function getAdminOrders(req: AuthenticatedRequest, res: Response) {
  const result = await adminFindOrders(req.query as any);
  return sendSuccess(res, "Danh sách đơn hàng (admin)", result.items, result.meta);
}

// PATCH /admin/orders/:id/status
export async function updateOrderStatus(req: AuthenticatedRequest, res: Response) {
  const id = getParamString(req.params.id);
  const { status, paymentStatus, cancelReason } = req.body;
  if (!id) return sendError(res, "Thiếu order ID", 400);
  if (!status && !paymentStatus) return sendError(res, "Thiếu trạng thái cần cập nhật", 400);

  const order = await adminUpdateOrderStatus(id, { status, paymentStatus, cancelReason });
  return sendSuccess(res, "Cập nhật đơn hàng thành công", order);
}

// GET /admin/coupons
export async function getAdminCoupons(req: AuthenticatedRequest, res: Response) {
  const coupons = await adminFindCoupons(req.query as any);
  return sendSuccess(res, "Danh sách mã giảm giá (admin)", coupons);
}

// POST /admin/coupons
export async function createCoupon(req: AuthenticatedRequest, res: Response) {
  const { code, type, value } = req.body;
  if (!code || !type || value === undefined) {
    return sendError(res, "Thiếu thông tin bắt buộc: code, type, value", 400);
  }

  try {
    const coupon = await adminCreateCoupon(req.body);
    return sendSuccess(res, "Tạo mã giảm giá thành công", coupon, undefined, 201);
  } catch (error) {
    return sendError(res, (error as Error).message || "Tạo mã giảm giá thất bại", 400);
  }
}

// PUT /admin/coupons/:id
export async function updateCoupon(req: AuthenticatedRequest, res: Response) {
  const id = getParamString(req.params.id);
  if (!id) return sendError(res, "Thiếu coupon ID", 400);

  try {
    const coupon = await adminUpdateCoupon(id, req.body);
    return sendSuccess(res, "Cập nhật mã giảm giá thành công", coupon);
  } catch (error) {
    return sendError(res, (error as Error).message || "Cập nhật mã giảm giá thất bại", 400);
  }
}

// DELETE /admin/coupons/:id
export async function deleteCoupon(req: AuthenticatedRequest, res: Response) {
  const id = getParamString(req.params.id);
  if (!id) return sendError(res, "Thiếu coupon ID", 400);
  await adminDeleteCoupon(id);
  return sendSuccess(res, "Đã ẩn mã giảm giá thành công");
}

// GET /admin/banners
export async function getAdminBanners(req: AuthenticatedRequest, res: Response) {
  const banners = await adminFindBanners(req.query as any);
  return sendSuccess(res, "Danh sách banner (admin)", banners);
}

// POST /admin/banners
export async function createBanner(req: AuthenticatedRequest, res: Response) {
  const { imageUrl, position } = req.body;
  if (!imageUrl || !position) {
    return sendError(res, "Thiếu thông tin bắt buộc: imageUrl, position", 400);
  }

  try {
    const banner = await adminCreateBanner(req.body);
    return sendSuccess(res, "Tạo banner thành công", banner, undefined, 201);
  } catch (error) {
    return sendError(res, (error as Error).message || "Tạo banner thất bại", 400);
  }
}

// PUT /admin/banners/:id
export async function updateBanner(req: AuthenticatedRequest, res: Response) {
  const id = Number(getParamString(req.params.id));
  if (!Number.isInteger(id) || id <= 0) return sendError(res, "Thiếu banner ID hợp lệ", 400);

  try {
    const banner = await adminUpdateBanner(id, req.body);
    return sendSuccess(res, "Cập nhật banner thành công", banner);
  } catch (error) {
    return sendError(res, (error as Error).message || "Cập nhật banner thất bại", 400);
  }
}

// DELETE /admin/banners/:id
export async function deleteBanner(req: AuthenticatedRequest, res: Response) {
  const id = Number(getParamString(req.params.id));
  if (!Number.isInteger(id) || id <= 0) return sendError(res, "Thiếu banner ID hợp lệ", 400);
  await adminDeleteBanner(id);
  return sendSuccess(res, "Đã ẩn banner thành công");
}

// GET /admin/reviews
export async function getAdminReviews(req: AuthenticatedRequest, res: Response) {
  const result = await adminFindReviews(req.query as any);
  return sendSuccess(res, "Danh sách đánh giá (admin)", result.items, {
    ...result.meta,
    stats: result.stats,
  });
}

// DELETE /admin/reviews/:id
export async function deleteReview(req: AuthenticatedRequest, res: Response) {
  const id = getParamString(req.params.id);
  if (!id) return sendError(res, "Thiếu review ID", 400);

  try {
    await adminDeleteReview(id);
    return sendSuccess(res, "Đã xóa đánh giá thành công");
  } catch (error) {
    return sendError(res, (error as Error).message || "Xóa đánh giá thất bại", 400);
  }
}

// GET /admin/moderation-words
export async function getModerationWords(req: AuthenticatedRequest, res: Response) {
  const words = await adminFindModerationWords(req.query as any);
  return sendSuccess(res, "Danh sách từ cấm", words);
}

// POST /admin/moderation-words
export async function createModerationWord(req: AuthenticatedRequest, res: Response) {
  try {
    const word = await adminCreateModerationWord(req.body);
    return sendSuccess(res, "Thêm từ cấm thành công", word, undefined, 201);
  } catch (error) {
    return sendError(res, (error as Error).message || "Thêm từ cấm thất bại", 400);
  }
}

// PUT /admin/moderation-words/:id
export async function updateModerationWord(req: AuthenticatedRequest, res: Response) {
  const id = getParamString(req.params.id);
  if (!id) return sendError(res, "Thiếu từ cấm ID", 400);

  try {
    const word = await adminUpdateModerationWord(id, req.body);
    return sendSuccess(res, "Cập nhật từ cấm thành công", word);
  } catch (error) {
    return sendError(res, (error as Error).message || "Cập nhật từ cấm thất bại", 400);
  }
}

// DELETE /admin/moderation-words/:id
export async function deleteModerationWord(req: AuthenticatedRequest, res: Response) {
  const id = getParamString(req.params.id);
  if (!id) return sendError(res, "Thiếu từ cấm ID", 400);

  try {
    await adminDeleteModerationWord(id);
    return sendSuccess(res, "Đã xóa từ cấm thành công");
  } catch (error) {
    return sendError(res, (error as Error).message || "Xóa từ cấm thất bại", 400);
  }
}
