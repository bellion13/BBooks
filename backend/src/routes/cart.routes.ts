import { Router } from "express";
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from "../controllers/cart.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const cartRouter = Router();

cartRouter.use(requireAuth);

cartRouter.get("/", getCart);
cartRouter.post("/", addToCart);
cartRouter.delete("/", clearCart);
cartRouter.put("/:id", updateCartItem);
cartRouter.delete("/:id", removeFromCart);
