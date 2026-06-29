import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.middleware.js";
import {
  getDashboard,
  getAdminBooks,
  createBook,
  updateBook,
  deleteBook,
  getAdminCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getAdminUsers,
  updateUserStatus,
  getAdminOrders,
  updateOrderStatus,
  getAdminCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
  getAdminBanners,
  createBanner,
  updateBanner,
  deleteBanner,
  getAdminReviews,
  deleteReview,
  getModerationWords,
  createModerationWord,
  updateModerationWord,
  deleteModerationWord,
} from "../controllers/admin.controller.js";

export const adminRouter = Router();

// Tất cả route admin đều yêu cầu đăng nhập và có quyền ADMIN
adminRouter.use(requireAuth, requireRole(["ADMIN"]));

adminRouter.get("/dashboard", getDashboard);

adminRouter.get("/books", getAdminBooks);
adminRouter.post("/books", createBook);
adminRouter.put("/books/:id", updateBook);
adminRouter.delete("/books/:id", deleteBook);

adminRouter.get("/categories", getAdminCategories);
adminRouter.post("/categories", createCategory);
adminRouter.put("/categories/:id", updateCategory);
adminRouter.delete("/categories/:id", deleteCategory);

adminRouter.get("/users", getAdminUsers);
adminRouter.patch("/users/:id/status", updateUserStatus);

adminRouter.get("/orders", getAdminOrders);
adminRouter.patch("/orders/:id/status", updateOrderStatus);

adminRouter.get("/coupons", getAdminCoupons);
adminRouter.post("/coupons", createCoupon);
adminRouter.put("/coupons/:id", updateCoupon);
adminRouter.delete("/coupons/:id", deleteCoupon);

adminRouter.get("/banners", getAdminBanners);
adminRouter.post("/banners", createBanner);
adminRouter.put("/banners/:id", updateBanner);
adminRouter.delete("/banners/:id", deleteBanner);

adminRouter.get("/reviews", getAdminReviews);
adminRouter.delete("/reviews/:id", deleteReview);

adminRouter.get("/moderation-words", getModerationWords);
adminRouter.post("/moderation-words", createModerationWord);
adminRouter.put("/moderation-words/:id", updateModerationWord);
adminRouter.delete("/moderation-words/:id", deleteModerationWord);
