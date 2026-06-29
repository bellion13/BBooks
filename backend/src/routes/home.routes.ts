import { Router } from "express";
import { getHome } from "../controllers/home.controller.js";

export const homeRouter = Router();

homeRouter.get("/", getHome);
