import { ResponseError } from "../errors/response-error.js";
import jwtHandler from "../utils/jwt-handler.js";

export const authenticationMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      throw new ResponseError(401, "Unauthorized Access");
    } else {
      const token = authHeader.split(" ")[1];
      const payload = jwtHandler.verifyJWT(token);

      req.user = payload;
      next();
    }
  } catch (error) {
    next(error);
  }
};
