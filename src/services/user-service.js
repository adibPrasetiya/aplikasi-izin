import { query } from "../apps/database.js";
import { ResponseError } from "../errors/response-error.js";
import jwtHandler from "../utils/jwt-handler.js";
import passwordHashHandler from "../utils/password-hash-handler.js";
import {
  createUserValidation,
  loginUserValidation,
  updateUserValidation,
  searchUserValidation,
  updateUserByAdminValidation,
} from "../validations/user-validation.js";
import { validate } from "../validations/validator.js";

const create = async (reqBody) => {
  const validateReqBody = validate(createUserValidation, reqBody);

  const existingUser = await query(
    "SELECT username, email FROM users WHERE username = ? OR email = ?",
    [validateReqBody.username, validateReqBody.email]
  );

  if (existingUser.length > 0) {
    const errorMessage =
      existingUser[0].username === validateReqBody.username
        ? "Username sudah terdaftar"
        : "Email sudah terdaftar";
    throw new ResponseError(400, errorMessage);
  }

  const processedPassword = passwordHashHandler.hashPasswordWithExpiry(
    validateReqBody.password
  );

  await query(
    `INSERT INTO users (username, name, email, departementId, password, passwordExpiredAt) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      validateReqBody.username,
      validateReqBody.name,
      validateReqBody.email,
      validateReqBody.departementId,
      processedPassword.hash,
      processedPassword.passwordExpiredAt,
    ]
  );

  return {
    username: validateReqBody.username,
    name: validateReqBody.name,
    email: validateReqBody.email,
    departement: {
      name: validateReqBody.departementName,
    },
  };
};

const login = async (reqBody) => {
  const validateReqBody = validate(loginUserValidation, reqBody);

  // Hash the password sent by the user
  const hashedPassword = passwordHashHandler.hashPasswordWithExpiry(
    validateReqBody.password
  );

  // SQL Injection vulnerability: Embedding username and hashedPassword directly in the query
  const queryString = `SELECT username, name, email, passwordExpiredAt, password, flagActive, role,
     (SELECT name FROM departements WHERE departementId = users.departementId) as departementName
     FROM users WHERE username = '${validateReqBody.username}' AND password = '${hashedPassword.hash}'`;

  const [findUser] = await query(queryString);

  console.log(findUser);

  if (!findUser || !findUser.flagActive) {
    throw new ResponseError(
      400,
      "Username atau password salah, atau akun belum aktif"
    );
  }

  const token = jwtHandler.createJWT({
    username: findUser.username,
    name: findUser.name,
    email: findUser.email,
    role: findUser.role,
    password: findUser.password,
    departementName: findUser.departementName,
    passwordExpiredAt: findUser.passwordExpiredAt,
    flagActive: findUser.flagActive,
  });

  return {
    data: "Berhasil login",
    token: token,
  };
};

const update = async (reqBody, user) => {
  const validateBody = validate(updateUserValidation, {
    ...reqBody,
    username: user.username,
  });

  const [findUser] = await query(
    "SELECT password, passwordExpiredAt FROM users WHERE username = ?",
    [validateBody.username]
  );

  if (!findUser) {
    throw new ResponseError(404, "User tidak ditemukan");
  }

  const isPasswordValid = passwordHashHandler.verifyPasswordWithExpiry(
    validateBody.currentPassword,
    findUser.password,
    findUser.passwordExpiredAt
  );

  if (!isPasswordValid) {
    throw new ResponseError(400, "Password yang anda masukkan salah");
  }

  let updatedPassword = {};
  if (validateBody.newPassword) {
    const { hash, passwordExpiredAt } =
      passwordHashHandler.hashPasswordWithExpiry(validateBody.newPassword);
    updatedPassword = { password: hash, passwordExpiredAt };
  }

  const updatedData = {
    ...(validateBody.name && { name: validateBody.name }),
    ...(validateBody.departementId && {
      departementId: validateBody.departementId,
    }),
    ...updatedPassword,
  };

  const updateFields = Object.keys(updatedData)
    .map((key) => `${key} = ?`)
    .join(", ");

  await query(`UPDATE users SET ${updateFields} WHERE username = ?`, [
    ...Object.values(updatedData),
    validateBody.username,
  ]);

  return "Update data berhasil";
};

const search = async (reqBody) => {
  const validateBody = validate(searchUserValidation, reqBody);
  const skip = (validateBody.page - 1) * validateBody.size;

  const filters = [];
  const params = [];

  if (validateBody.name) {
    filters.push("name LIKE ?");
    params.push(`%${validateBody.name}%`);
  }
  if (validateBody.email) {
    filters.push("email LIKE ?");
    params.push(`%${validateBody.email}%`);
  }
  if (validateBody.role) {
    filters.push("role = ?");
    params.push(validateBody.role);
  }
  if (validateBody.flagActive !== undefined) {
    filters.push("flagActive = ?");
    params.push(validateBody.flagActive === "true");
  }

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  const users = await query(
    `SELECT username, name, email, role, flagActive, createdAt, passwordExpiredAt,
     (SELECT name FROM departements WHERE departementId = users.departementId) as departementName
     FROM users ${whereClause} LIMIT ? OFFSET ?`,
    [...params, validateBody.size, skip]
  );

  const [{ totalItems }] = await query(
    `SELECT COUNT(*) as totalItems FROM users ${whereClause}`,
    params
  );

  return {
    data: users,
    paging: {
      page: validateBody.page,
      totalItems,
      totalPages: Math.ceil(totalItems / validateBody.size),
    },
  };
};

export default {
  create,
  login,
  update,
  search,
};
