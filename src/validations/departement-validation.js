import Joi from "joi";

const createDepartementValidation = Joi.object({
  name: Joi.string()
    .min(3)
    .max(150)
    .required()
    .regex(/^[a-zA-Z ]+$/)
    .messages({
      "string.min": "Panjang Nama Departemen minimal 3 karakter",
      "string.max": "Panjang Nama Departemen maksimal 150 karakter",
      "string.pattern.base":
        "Nama Departemen hanya terdiri dari karakter huruf dan spasi",
    }),
  email: Joi.string().min(3).max(100).required().email().messages({
    "string.min": "Panjang email minimal 3 karakter",
    "string.max": "Panjang email maksimal 100 karakter",
  }),
});

const getDepartementValidation = Joi.string()
  .required()
  .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
  .messages({
    "string.pattern.base": "Departement ID tidak sesuai format",
  });

const updateDepartementValidation = Joi.object({
  departementId: getDepartementValidation,
  name: Joi.string()
    .min(3)
    .max(150)
    .optional()
    .regex(/^[a-zA-Z ]+$/)
    .messages({
      "string.min": "Panjang Nama Departemen minimal 3 karakter",
      "string.max": "Panjang Nama Departemen maksimal 150 karakter",
      "string.pattern.base":
        "Nama Departemen hanya terdiri dari karakter huruf dan spasi",
    }),
  email: Joi.string().min(3).max(100).optional().email().messages({
    "string.min": "Panjang email minimal 3 karakter",
    "string.max": "Panjang email maksimal 100 karakter",
  }),
});

const searchDepartementValidation = Joi.object({
  page: Joi.number().min(1).positive().default(1),
  size: Joi.number().min(1).max(100).default(10),
  name: Joi.string()
    .min(3)
    .max(150)
    .optional()
    .regex(/^[a-zA-Z ]+$/)
    .messages({
      "string.min": "Panjang Nama Departemen minimal 3 karakter",
      "string.max": "Panjang Nama Departemen maksimal 150 karakter",
    }),
  email: Joi.string().min(3).max(100).optional().messages({
    "string.min": "Panjang email minimal 3 karakter",
    "string.max": "Panjang email maksimal 100 karakter",
  }),
});

export {
  createDepartementValidation,
  getDepartementValidation,
  updateDepartementValidation,
  searchDepartementValidation,
};
