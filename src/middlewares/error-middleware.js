import { ResponseError } from "../errors/response-error.js";

export const errorMiddleware = async (err, req, res, next) => {
  if (!err) {
    next();
    return;
  }

  if (err instanceof ResponseError) {
    res
      .status(err.status)
      .json({
        errors: err.message,
      })
      .end();
  } else {
    console.log(err);
    res
      .status(500)
      .json({
        errors: err.message,
      })
      .end();
  }
};
