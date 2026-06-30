import { Router } from "express";
import { requireAuth } from "../middleware/auth.middleware.js";
import { cancelMyOrder, createOrder, getMyOrderById, getMyOrders } from "../controllers/order.controller.js";

export const orderRouter = Router();

orderRouter.use(requireAuth);

orderRouter.post("/", createOrder);
orderRouter.get("/", getMyOrders);
orderRouter.get("/:id", getMyOrderById);
orderRouter.patch("/:id/cancel", cancelMyOrder);
