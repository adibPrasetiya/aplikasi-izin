import Joi from "joi";

const createUserValidation = Joi.object({
  username: Joi.string()
    .required()
    .min(3)
    .max(100)
    .regex(/^(?=.{3,100}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/)
    .messages({
      "string.min": "Panjang username minimal 3 karakter",
      "string.max": "Panjang username maksimal 100 karakter",
      "string.pattern.base":
        "Username hanya terdiri karakter huruf, angka, titik dan underscore",
    }),
  name: Joi.string()
    .min(3)
    .max(100)
    .required()
    .regex(/^[a-zA-Z ]+$/)
    .messages({
      "string.min": "Panjang Nama minimal 3 karakter",
      "string.max": "Panjang Nama maksimal 100 karakter",
      "string.pattern.base": "Nama hanya terdiri dari karakter huruf dan spasi",
    }),
  email: Joi.string().min(3).max(100).required().email().messages({
    "string.min": "Panjang email minimal 3 karakter",
    "string.max": "Panjang email maksimal 100 karakter",
  }),
  password: Joi.string()
    .required()
    .min(6)
    .max(100)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,100}$/
    )
    .messages({
      "string.min": "Panjang password minimal 6 karakter",
      "string.max": "Panjang password maksimal 100 karakter",
      "string.pattern.base":
        "Password harus mengandung huruf besar, huruf kecil, angka dan spesial karakter",
    }),
  departementId: Joi.string()
    .required()
    .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
    .messages({
      "string.pattern.base": "Departement ID tidak sesuai format",
    }),
});

const loginUserValidation = Joi.object({
  username: Joi.string()
    .required()
    .min(3)
    .max(100)
    .regex(/^(?=.{3,100}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/)
    .messages({
      "string.min": "Panjang username minimal 3 karakter",
      "string.max": "Panjang username maksimal 100 karakter",
      "string.pattern.base":
        "Username hanya terdiri karakter huruf, angka, titik dan underscore",
    }),
  password: Joi.string().required().min(6).max(100).messages({
    "string.min": "Panjang password minimal 6 karakter",
    "string.max": "Panjang password maksimal 100 karakter",
  }),
});

const updateUserValidation = Joi.object({
  username: Joi.string()
    .required()
    .min(3)
    .max(100)
    .regex(/^(?=.{3,100}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/)
    .messages({
      "string.min": "Panjang username minimal 3 karakter",
      "string.max": "Panjang username maksimal 100 karakter",
      "string.pattern.base":
        "Username hanya terdiri karakter huruf, angka, titik dan underscore",
    }),
  name: Joi.string()
    .min(3)
    .max(100)
    .optional()
    .regex(/^[a-zA-Z ]+$/)
    .messages({
      "string.min": "Panjang Nama minimal 3 karakter",
      "string.max": "Panjang Nama maksimal 100 karakter",
      "string.pattern.base": "Nama hanya terdiri dari karakter huruf dan spasi",
    }),
  newPassword: Joi.string().optional().min(6).max(100).messages({
    "string.min": "Panjang password minimal 6 karakter",
    "string.max": "Panjang password maksimal 100 karakter",
  }),
  departementId: Joi.string()
    .optional()
    .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
    .messages({
      "string.pattern.base": "Departement ID tidak sesuai format",
    }),
  currentPassword: Joi.string().required().min(6).max(100).messages({
    "string.min": "Panjang password minimal 6 karakter",
    "string.max": "Panjang password maksimal 100 karakter",
  }),
});

const searchUserValidation = Joi.object({
  name: Joi.string().optional().max(100).messages({
    "string.max": "Panjang nama maksimal 100 karakter",
  }),
  email: Joi.string().optional().email().messages({
    "string.email": "Format email tidak valid",
  }),
  role: Joi.string().optional().valid("ADMIN", "USER", "MANAJER").messages({
    "any.only": "Role tidak valid",
  }),
  page: Joi.number().integer().min(1).required().messages({
    "number.base": "Halaman harus berupa angka",
    "number.min": "Halaman minimal 1",
  }),
  size: Joi.number().integer().min(1).required().messages({
    "number.base": "Ukuran halaman harus berupa angka",
    "number.min": "Ukuran halaman minimal 1",
  }),
});

const updateUserByAdminValidation = Joi.object({
  name: Joi.string().optional().max(100).messages({
    "string.max": "Panjang nama maksimal 100 karakter",
  }),
  username: Joi.string()
    .required()
    .min(3)
    .max(100)
    .regex(/^(?=.{3,100}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/)
    .messages({
      "string.min": "Panjang username minimal 3 karakter",
      "string.max": "Panjang username maksimal 100 karakter",
      "string.pattern.base":
        "Username hanya terdiri dari huruf, angka, titik, dan underscore",
    }),
  role: Joi.string().optional().valid("ADMIN", "USER", "MANAJER").messages({
    "any.only": "Role tidak valid",
  }),
  flagActive: Joi.boolean().optional().messages({
    any: "Flag active harus boolean",
  }),
  password: Joi.string().optional().min(6).max(100).messages({
    "string.min": "Panjang password minimal 6 karakter",
    "string.max": "Panjang password maksimal 100 karakter",
  }),
  currentPassword: Joi.string().required().messages({
    "any.required": "Password saat ini wajib diisi",
  }),
});

export {
  createUserValidation,
  loginUserValidation,
  updateUserValidation,
  searchUserValidation,
  updateUserByAdminValidation,
};
