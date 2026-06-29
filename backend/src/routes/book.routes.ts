import { Router } from "express";
import { getBookDetail, getBookReviews, getBooks, submitBookReview } from "../controllers/book.controller.js";
import { requireAuth } from "../middleware/auth.middleware.js";

export const bookRouter = Router();

bookRouter.get("/", getBooks);
bookRouter.get("/:slug/reviews", getBookReviews);
bookRouter.post("/:slug/reviews", requireAuth, submitBookReview);
bookRouter.get("/:slug", getBookDetail);
