import { Router } from "express";
import departementController from "../controllers/departement-controller.js";
import authorizationMiddleware from "../middlewares/authorization-middleware.js";
import userController from "../controllers/user-controller.js";
import leaveController from "../controllers/leave-controller.js";

export const protectedRoutes = new Router();

protectedRoutes.post(
  "/api/v1/departement",
  authorizationMiddleware.verifyAuthorization(["ADMIN"]),
  departementController.create
);
protectedRoutes.get(
  "/api/v1/departement/:departementId",
  departementController.get
);
protectedRoutes.patch(
  "/api/v1/departement/:departementId",
  authorizationMiddleware.verifyAuthorization(["ADMIN"]),
  departementController.update
);
protectedRoutes.delete(
  "/api/v1/departement/:departementId",
  authorizationMiddleware.verifyAuthorization(["ADMIN"]),
  departementController.remove
);

protectedRoutes.patch("/api/v1/user/current", userController.update);
protectedRoutes.get("/api/v1/user/current/logout", userController.logout);
protectedRoutes.get(
  "/api/v1/user/search",
  authorizationMiddleware.verifyAuthorization(["ADMIN"]),
  userController.search
);
protectedRoutes.patch(
  "/api/v1/user/:userId",
  authorizationMiddleware.verifyAuthorization(["ADMIN"]),
  userController.update
);

protectedRoutes.post("/api/v1/leave/draft", leaveController.saveDraft);
protectedRoutes.put(
  "/api/v1/leave/:leaveId/submit",
  leaveController.submitLeave
);
protectedRoutes.put(
  "/api/v1/leave/:leaveId/verify",
  authorizationMiddleware.verifyAuthorization(["MANAJER"]),
  leaveController.verifyLeave
);
protectedRoutes.put(
  "/api/v1/leave/:leaveId/update",
  leaveController.updateDraft
);
protectedRoutes.delete("/api/v1/leave/:leaveId", leaveController.removeDraft);
