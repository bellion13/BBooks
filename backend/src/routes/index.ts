import { Router } from "express";
import { authRouter } from "./auth.routes.js";
import { bookRouter } from "./book.routes.js";
import { categoryRouter } from "./category.routes.js";
import { cartRouter } from "./cart.routes.js";
import { orderRouter } from "./order.routes.js";
import { wishlistRouter } from "./wishlist.routes.js";
import { adminRouter } from "./admin.routes.js";
import { homeRouter } from "./home.routes.js";
import { sendSuccess } from "../utils/response.js";

export const apiRouter = Router();

apiRouter.get("/health", (_req, res) => {
  return sendSuccess(res, "BBooks API sẵn sàng", {
    name: "BBooks API",
    version: "1.0.0",
  });
});

apiRouter.use("/home", homeRouter);
apiRouter.use("/auth", authRouter);
apiRouter.use("/books", bookRouter);
apiRouter.use("/categories", categoryRouter);
apiRouter.use("/cart", cartRouter);
apiRouter.use("/orders", orderRouter);
apiRouter.use("/wishlist", wishlistRouter);
apiRouter.use("/admin", adminRouter);

