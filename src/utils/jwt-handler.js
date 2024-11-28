import jwt from "jsonwebtoken";
import { APP_JWT_SECRET } from "../conf/constant.js";
import { ResponseError } from "../errors/response-error.js";

/**
 * Membuat JWT dengan payload tertentu
 * @param {object} payload - Data yang ingin dimasukkan ke dalam JWT
 * @param {string} expiresIn - Masa berlaku token (contoh: "1h", "7d")
 * @returns {string} - JWT yang dihasilkan
 */
const createJWT = (payload, expiresIn = "1h") => {
  return jwt.sign(payload, APP_JWT_SECRET, { algorithm: "HS256", expiresIn });
};

/**
 * Memverifikasi JWT dan mengembalikan payload jika valid
 * @param {string} token - JWT yang ingin diverifikasi
 * @returns {object} - Payload dari JWT yang valid
 * @throws {Error} - Jika token tidak valid atau telah kedaluwarsa
 */
const verifyJWT = (token) => {
  try {
    return jwt.verify(token, APP_JWT_SECRET, { algorithms: ["HS256"] });
  } catch (error) {
    throw new ResponseError(401, "Token invalid atau kadaluarsa");
  }
};

export default {
  createJWT,
  verifyJWT,
};
