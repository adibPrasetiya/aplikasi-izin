import { Router } from "express";
import departementController from "../controllers/departement-controller.js";
import authorizationMiddleware from "../middlewares/authorization-middleware.js";
import userController from "../controllers/user-controller.js";
import leaveController from "../controllers/leave-controller.js";

export const protectedRoutes = new Router();

protectedRoutes.post(
  "/api/v1/departement",
  authorizationMiddleware.verifyAuthorization(["admin"]),
  departementController.create
);
protectedRoutes.get(
  "/api/v1/departement/:departementId",
  departementController.get
);
protectedRoutes.patch(
  "/api/v1/departement/:departementId",
  authorizationMiddleware.verifyAuthorization(["admin"]),
  departementController.update
);
protectedRoutes.delete(
  "/api/v1/departement/:departementId",
  authorizationMiddleware.verifyAuthorization(["admin"]),
  departementController.remove
);

protectedRoutes.patch("/api/v1/user/current", userController.update);
protectedRoutes.get("/api/v1/user/current/logout", userController.logout);
protectedRoutes.get(
  "/api/v1/user/search",
  authorizationMiddleware.verifyAuthorization(["admin"]),
  userController.search
);
protectedRoutes.patch(
  "/api/v1/user/:userId",
  authorizationMiddleware.verifyAuthorization(["admin"]),
  userController.updateByAdmin
);

protectedRoutes.post("/api/v1/leave/draft", leaveController.saveDraft);
protectedRoutes.put(
  "/api/v1/leave/:leaveId/submit",
  leaveController.submitLeave
);
protectedRoutes.put(
  "/api/v1/leave/:leaveId/verify",
  authorizationMiddleware.verifyAuthorization(["manajer"]),
  leaveController.verifyLeave
);
protectedRoutes.put(
  "/api/v1/leave/:leaveId/update",
  leaveController.updateDraft
);
protectedRoutes.delete("/api/v1/leave/:leaveId", leaveController.removeDraft);
