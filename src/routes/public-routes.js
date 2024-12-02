import { Router } from "express";
import userController from "../controllers/user-controller.js";
import departementController from "../controllers/departement-controller.js";

export const publicRoutes = new Router();

publicRoutes.post("/api/v1/user", userController.create);
publicRoutes.post("/api/v1/user/login", userController.login);

publicRoutes.get("/api/v1/departement/search", departementController.search);
