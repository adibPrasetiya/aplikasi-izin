import {
  createDepartementValidation,
  getDepartementValidation,
  searchDepartementValidation,
  updateDepartementValidation,
} from "../validations/departement-validation";
import { validate } from "../validations/validator.js";
import { prismaClient } from "../apps/database.js";
import { ResponseError } from "../errors/response-error.js";

const create = async (reqBody) => {
  reqBody = validate(createDepartementValidation, reqBody);

  // pengecekan duplikasi nama dan email departement
  const existingDepartements = await prismaClient.departements.findFirst({
    where: {
      OR: [{ name: reqBody.name }, { email: reqBody.email }],
    },
    select: {
      name: true,
      email: true,
    },
  });

  if (existingDepartements) {
    const errorMessage =
      existingDepartements.name === reqBody.name
        ? "Nama departement sudah terdaftar"
        : "Email departement sudah terdaftar";
    throw new ResponseError(400, errorMessage);
  }

  // buat departement baru
  return prismaClient.departements.create({
    data: {
      name: reqBody.name,
      email: reqBody.email,
    },
    select: {
      departementId: true,
      name: true,
      email: true,
    },
  });
};

const get = async (departementId) => {
  departementId = validate(getDepartementValidation, departementId);

  const departement = await prismaClient.departements.findUnique({
    where: {
      departementId: departementId,
    },
    select: {
      departementId: true,
      name: true,
      email: true,
    },
  });

  if (!departement) {
    throw new ResponseError(404, "Departement tidak ditemukan");
  }

  return departement;
};

const update = async (departementId, reqBody) => {
  // Tambahkan ID ke dalam body
  const validatedBody = validate(updateDepartementValidation, {
    ...reqBody,
    departementId,
  });

  // Gunakan findUnique untuk langsung memeriksa keberadaan departemen
  const existingDepartement = await prismaClient.departements.findUnique({
    where: { departementId },
    select: { departementId: true }, // Hanya ambil data minimum
  });

  if (!existingDepartement) {
    throw new ResponseError(
      404,
      `Departemen dengan ID ${departementId} tidak ditemukan`
    );
  }

  const updatedData = {
    ...(validatedBody.name && { name: validatedBody.name }),
    ...(validatedBody.email && { email: validatedBody.email }),
  };

  // Lakukan update
  return prismaClient.departements.update({
    where: { departementId },
    data: updatedData,
    select: {
      departementId: true,
      name: true,
      email: true,
    },
  });
};

const remove = async (departementId) => {
  // Validasi departementId
  const validatedDepartementId = validate(
    getDepartementValidation,
    departementId
  );

  // Cek keberadaan departemen menggunakan findUnique untuk efisiensi
  const existingDepartement = await prismaClient.departements.findUnique({
    where: { departementId: validatedDepartementId },
    select: { departementId: true },
  });

  if (!existingDepartement) {
    throw new ResponseError(
      404,
      `Departemen dengan ID ${validatedDepartementId} tidak ditemukan`
    );
  }

  // Hapus departemen
  await prismaClient.departements.delete({
    where: { departementId: validatedDepartementId },
  });

  return "OK";
};

const search = async (reqBody) => {
  const validateBody = validate(searchDepartementValidation, reqBody);
  const skip = (validateBody.page - 1) * validateBody.size;

  const filters = Object.entries(validateBody).reduce((acc, [key, value]) => {
    if (value && ["name", "email"].includes(key)) {
      acc.push({ [key]: { contains: value } });
    }
    return acc;
  }, []);

  const [departements, totalItems] = await prismaClient.$transaction([
    prismaClient.departements.findMany({
      where: filters.length ? { AND: filters } : {},
      take: validateBody.size,
      skip: skip,
    }),
    prismaClient.departements.count({
      where: filters.length ? { AND: filters } : {},
    }),
  ]);

  return {
    data: departements,
    paging: {
      page: validateBody.page,
      totalItems: totalItems,
      totalPages: Math.ceil(totalItems / validateBody.size),
    },
  };
};

export default {
  create,
  get,
  update,
  remove,
  search,
};
