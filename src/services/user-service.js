import { prismaClient } from "../apps/database.js";
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

  await prismaClient.users.update({
    where: {
      username: validateBody.username,
    },
    data: updatedData,
  });

  return "Update data berhasil";
};

const search = async (reqBody) => {
  const validateBody = validate(searchUserValidation, reqBody);
  const skip = (validateBody.page - 1) * validateBody.size;

  // Filter berdasarkan field yang diizinkan
  const filters = Object.entries(validateBody).reduce((acc, [key, value]) => {
    if (value) {
      if (key === "role" && ["ADMIN", "MANAJER", "USER"].includes(value)) {
        // Use the exact enum value for role
        acc.push({ [key]: value });
      } else if (["name", "email"].includes(key)) {
        // Use contains for string fields
        acc.push({ [key]: { contains: value } });
      } else if (key === "flagActive") {
        acc.push({ [key]: value === "false" ? false : true });
      }
    }
    return acc;
  }, []);

  // Query pengguna dengan filter
  const [users, totalItems] = await prismaClient.$transaction([
    prismaClient.users.findMany({
      where: filters.length ? { AND: filters } : {},
      take: validateBody.size,
      skip: skip,
      select: {
        username: true,
        name: true,
        email: true,
        role: true,
        flagActive: true,
        createdAt: true,
        passwordExpiredAt: true,
        departement: {
          select: {
            name: true,
          },
        },
      },
    }),
    prismaClient.users.count({
      where: filters.length ? { AND: filters } : {},
    }),
  ]);

  return {
    data: users,
    paging: {
      page: validateBody.page,
      totalItems: totalItems,
      totalPages: Math.ceil(totalItems / validateBody.size),
    },
  };
};

const updateByAdmin = async (reqBody, username, adminUsername) => {
  const validateBody = validate(updateUserByAdminValidation, {
    ...reqBody,
    username: username,
  });

  // Verifikasi currentPassword admin
  const admin = await prismaClient.users.findUnique({
    where: { username: adminUsername },
    select: { password: true, passwordExpiredAt: true, role: true },
  });

  if (!admin) {
    throw new ResponseError(403, "Akses ditolak");
  }

  if (admin.role !== "ADMIN") {
    throw new ResponseError(403, "Akses ditolak");
  }

  const isPasswordValid = passwordHashHandler.verifyPasswordWithExpiry(
    validateBody.currentPassword,
    admin.password,
    admin.passwordExpiredAt
  );

  if (!isPasswordValid) {
    throw new ResponseError(403, "Password saat ini tidak valid");
  }

  // Ambil data user yang ingin diupdate
  const user = await prismaClient.users.findUnique({
    where: { username: validateBody.username },
  });

  if (!user) {
    throw new ResponseError(404, "Pengguna tidak ditemukan");
  }

  // Siapkan data untuk diupdate
  const updatedData = {};
  if (validateBody.name) updatedData.name = validateBody.name;
  if (validateBody.role) updatedData.role = validateBody.role;
  if (validateBody.flagActive) updatedData.flagActive = validateBody.flagActive;
  if (validateBody.password) {
    const { hash, passwordExpiredAt } =
      passwordHashHandler.hashPasswordWithExpiry(validateBody.password);
    updatedData.password = hash;
    updatedData.passwordExpiredAt = passwordExpiredAt; // Reset expired password
  }

  // Update user di database
  const updatedUser = await prismaClient.users.update({
    where: { username: validateBody.username },
    data: updatedData,
    select: {
      username: true,
      email: true,
      role: true,
      flagActive: true,
      passwordExpiredAt: true,
      departement: {
        select: {
          name: true,
        },
      },
    },
  });

  return {
    message: "Data pengguna berhasil diupdate",
    data: {
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      departementName: updatedUser.departement.name,
      passwordExpiredAt: updatedUser.passwordExpiredAt,
      flagActive: updatedUser.flagActive,
    },
  };
};

export default {
  create,
  login,
  update,
  search,
  updateByAdmin,
};
