import {
  createDepartementValidation,
  getDepartementValidation,
  searchDepartementValidation,
  updateDepartementValidation,
} from "../validations/departement-validation.js";
import { validate } from "../validations/validator.js";
import { query } from "../apps/database.js";
import { ResponseError } from "../errors/response-error.js";

const create = async (reqBody) => {
  reqBody = validate(createDepartementValidation, reqBody);

  // Pengecekan duplikasi nama dan email departemen
  const existingDepartements = await query(
    `SELECT name, email FROM departements WHERE name = ? OR email = ?`,
    [reqBody.name, reqBody.email]
  );

  if (existingDepartements.length > 0) {
    const errorMessage =
      existingDepartements[0].name === reqBody.name
        ? "Nama departemen sudah terdaftar"
        : "Email departemen sudah terdaftar";
    throw new ResponseError(400, errorMessage);
  }

  // Buat departemen baru
  const result = await query(
    `INSERT INTO departements (name, email) VALUES (?, ?)`,
    [reqBody.name, reqBody.email]
  );

  return {
    departementId: result.insertId,
    name: reqBody.name,
    email: reqBody.email,
  };
};

const get = async (departementId) => {
  departementId = validate(getDepartementValidation, departementId);

  const [departement] = await query(
    `SELECT departementId, name, email FROM departements WHERE departementId = ?`,
    [departementId]
  );

  if (!departement) {
    throw new ResponseError(404, "Departemen tidak ditemukan");
  }

  return departement;
};

const update = async (departementId, reqBody) => {
  const validatedBody = validate(updateDepartementValidation, {
    ...reqBody,
    departementId,
  });

  const [existingDepartement] = await query(
    `SELECT departementId FROM departements WHERE departementId = ?`,
    [departementId]
  );

  if (!existingDepartement) {
    throw new ResponseError(
      404,
      `Departemen dengan ID ${departementId} tidak ditemukan`
    );
  }

  const updatedFields = [];
  const updatedValues = [];

  if (validatedBody.name) {
    updatedFields.push("name = ?");
    updatedValues.push(validatedBody.name);
  }

  if (validatedBody.email) {
    updatedFields.push("email = ?");
    updatedValues.push(validatedBody.email);
  }

  updatedValues.push(departementId);

  await query(
    `UPDATE departements SET ${updatedFields.join(
      ", "
    )} WHERE departementId = ?`,
    updatedValues
  );

  return get(departementId);
};

const remove = async (departementId) => {
  const validatedDepartementId = validate(
    getDepartementValidation,
    departementId
  );

  const [existingDepartement] = await query(
    `SELECT departementId FROM departements WHERE departementId = ?`,
    [validatedDepartementId]
  );

  if (!existingDepartement) {
    throw new ResponseError(
      404,
      `Departemen dengan ID ${validatedDepartementId} tidak ditemukan`
    );
  }

  await query(`DELETE FROM departements WHERE departementId = ?`, [
    validatedDepartementId,
  ]);

  return "OK";
};

const search = async (reqBody) => {
  const validateBody = validate(searchDepartementValidation, reqBody);
  const skip = (validateBody.page - 1) * validateBody.size;

  const filters = [];
  const filterValues = [];

  if (validateBody.name) {
    filters.push("name LIKE ?");
    filterValues.push(`%${validateBody.name}%`);
  }

  if (validateBody.email) {
    filters.push("email LIKE ?");
    filterValues.push(`%${validateBody.email}%`);
  }

  const whereClause = filters.length ? `WHERE ${filters.join(" AND ")}` : "";

  const departements = await query(
    `SELECT departementId, name, email FROM departements ${whereClause} LIMIT ? OFFSET ?`,
    [...filterValues, validateBody.size, skip]
  );

  const [totalItemsRow] = await query(
    `SELECT COUNT(*) as totalItems FROM departements ${whereClause}`,
    filterValues
  );

  const totalItems = totalItemsRow.totalItems;

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
