import { prismaClient } from "../apps/database.js";
import { ResponseError } from "../errors/response-error.js";
import jwtHandler from "../utils/jwt-handler.js";
import passwordHashHandler from "../utils/password-hash-handler.js";
import {
  createUserValidation,
  getUserValidation,
  loginUserValidation,
  updateUserValidation,
} from "../validations/user-validation.js";
import { validate } from "../validations/validator.js";

const create = async (reqBody) => {
  const validateReqBody = validate(createUserValidation, reqBody);
  // pengecekan duplikasi username dan email pengguna
  const existingUser = await prismaClient.users.findFirst({
    where: {
      OR: [
        { username: validateReqBody.username },
        { email: validateReqBody.email },
      ],
    },
    select: {
      username: true,
      email: true,
    },
  });

  if (existingUser) {
    const errorMessage =
      existingUser.username === validateReqBody.username
        ? "Username sudah terdaftar"
        : "Email sudah terdaftar";
    throw new ResponseError(400, errorMessage);
  }

  const processedPassword = passwordHashHandler.hashPasswordWithExpiry(
    validateReqBody.password
  );

  return prismaClient.users.create({
    data: {
      username: validateReqBody.username,
      name: validateReqBody.name,
      email: validateReqBody.email,
      departementId: validateReqBody.departementId,
      password: processedPassword.hash,
      passwordExpiredAt: processedPassword.passwordExpiredAt,
    },
    select: {
      username: true,
      name: true,
      email: true,
      departement: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });
};

const login = async (reqBody) => {
  // Validasi input
  const validateReqBody = validate(loginUserValidation, reqBody);

  // Ambil user dari database dengan hanya data yang diperlukan
  const findUser = await prismaClient.users.findUnique({
    where: {
      username: validateReqBody.username,
    },
    select: {
      username: true,
      name: true,
      email: true,
      password: true,
      passwordExpiredAt: true,
      flagActive: true,
      role: true,
      departement: {
        select: {
          name: true, // Ambil hanya nama departemen
        },
      },
    },
  });

  // Validasi jika user tidak ditemukan
  if (!findUser || !findUser.flagActive) {
    throw new ResponseError(
      400,
      "Username atau password salah, atau akun belum aktif"
    );
  }

  // Verifikasi password
  const isPasswordValid = passwordHashHandler.verifyPasswordWithExpiry(
    validateReqBody.password,
    findUser.password,
    findUser.passwordExpiredAt
  );

  if (!isPasswordValid) {
    throw new ResponseError(400, "Username atau password salah");
  }

  // Buat JWT untuk user yang berhasil login
  const token = jwtHandler.createJWT({
    username: findUser.username,
    name: findUser.name,
    email: findUser.email,
    role: findUser.role,
    departementName: findUser.departement.name,
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

  const findUser = await prismaClient.users.findUnique({
    where: {
      username: validateBody.username,
    },
  });

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

  console.log(updatedData);

  const updatedUser = await prismaClient.users.update({
    where: {
      username: validateBody.username,
    },
    data: updatedData,
    select: {
      name: true,
      email: true,
      passwordExpiredAt: true,
      role: true,
      departement: {
        select: {
          name: true,
        },
      },
    },
  });

  const newToken = jwtHandler.createJWT({
    username: validateBody.username,
    role: updatedUser.role,
    passwordExpiredAt: updatedUser.passwordExpiredAt,
    departementName: updatedUser.departement.name,
  });

  return {
    token: newToken,
    data: {
      name: updatedUser.name,
      email: updatedUser.email,
    },
  };
};

export default {
  create,
  login,
  update,
};
