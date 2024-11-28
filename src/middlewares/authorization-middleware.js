import { ResponseError } from "../errors/response-error.js";

const verifyAuthorization = (allowedRoles) => (req, res, next) => {
  if (!allowedRoles.includes(req.user.role)) {
    throw new ResponseError("401", "Unauthorized access");
  } else {
    next();
  }
};

export default {
  verifyAuthorization,
};
