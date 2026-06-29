import type { ReactElement } from "react";
import { Home } from "../pages/Home";
import { BooksPage } from "../pages/BooksPage";
import { BookDetailPage } from "../pages/BookDetailPage";
import { CartPage } from "../pages/CartPage";
import { WishlistPage } from "../pages/WishlistPage";
import { CheckoutPage } from "../pages/CheckoutPage";
import { OrdersPage } from "../pages/OrdersPage";
import { PlaceholderPage } from "../pages/PlaceholderPage";

export type RouteConfig = {
  path: string;
  element: ReactElement;
  /** Tiêu đề trang (dùng cho document.title nếu cần) */
  title?: string;
};

/** Danh sách tất cả các route của ứng dụng */
export const routes: RouteConfig[] = [
  {
    path: "/",
    element: <Home />,
    title: "BBooks – Nhà sách ấm áp",
  },
  {
    path: "/books",
    element: <BooksPage />,
    title: "Danh sách sách – BBooks",
  },
  {
    path: "/books/:slug",
    element: <BookDetailPage />,
    title: "Chi tiết sách – BBooks",
  },
  {
    path: "/cart",
    element: <CartPage />,
    title: "Giỏ hàng – BBooks",
  },
  {
    path: "/wishlist",
    element: <WishlistPage />,
    title: "Yêu thích – BBooks",
  },
  {
    path: "/checkout",
    element: <CheckoutPage />,
    title: "Thanh toán – BBooks",
  },
  {
    path: "/orders",
    element: <OrdersPage />,
    title: "Đơn hàng – BBooks",
  },
  {
    path: "/admin",
    element: <PlaceholderPage title="Admin Dashboard" />,
    title: "Quản trị – BBooks",
  },
  {
    path: "*",
    element: <PlaceholderPage title="Không tìm thấy trang (404)" />,
    title: "404 – BBooks",
  },
];
