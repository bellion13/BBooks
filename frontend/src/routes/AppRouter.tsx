import { Routes, Route } from "react-router-dom";
import { routes } from "./index";
import { AdminGuard } from "../components/layout/AdminGuard";
import { AdminLayout } from "../components/layout/AdminLayout";
import { AdminDashboardPage } from "../pages/admin/AdminDashboardPage";
import { AdminBooksPage } from "../pages/admin/AdminBooksPage";
import { AdminCategoriesPage } from "../pages/admin/AdminCategoriesPage";
import { AdminUsersPage } from "../pages/admin/AdminUsersPage";
import { AdminOrdersPage } from "../pages/admin/AdminOrdersPage";
import { AdminCouponsPage } from "../pages/admin/AdminCouponsPage";
import { AdminBannersPage } from "../pages/admin/AdminBannersPage";
import { AdminReviewsPage } from "../pages/admin/AdminReviewsPage";

/**
 * Component tập trung quản lý toàn bộ routing của ứng dụng.
 * Public routes vẫn lấy từ routes/index.tsx, admin routes được nest riêng để dùng AdminLayout.
 */
export function AppRouter() {
  return (
    <Routes>
      {routes.map(({ path, element }) => (
        <Route key={path} path={path} element={element} />
      ))}

      <Route element={<AdminGuard />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="books" element={<AdminBooksPage />} />
          <Route path="categories" element={<AdminCategoriesPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="orders" element={<AdminOrdersPage />} />
          <Route path="coupons" element={<AdminCouponsPage />} />
          <Route path="banners" element={<AdminBannersPage />} />
          <Route path="reviews" element={<AdminReviewsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
