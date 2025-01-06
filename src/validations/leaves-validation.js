import Joi from "joi";

const saveDraftValidation = Joi.object({
  username: Joi.string()
    .required()
    .regex(/^(?=.{3,100}$)(?![_.])(?!.*[_.]{2})[a-zA-Z0-9._]+(?<![_.])$/)
    .messages({
      "string.pattern.base": "Username tidak sesuai format",
    }),
  startDate: Joi.date().iso().required().messages({
    "date.format": "Tanggal mulai harus dalam format ISO",
  }),
  endDate: Joi.date().iso().min(Joi.ref("startDate")).required().messages({
    "date.format": "Tanggal selesai harus dalam format ISO",
    "date.min":
      "Tanggal selesai harus lebih besar atau sama dengan tanggal mulai",
  }),
  reason: Joi.string().min(10).max(500).required().messages({
    "string.min": "Alasan minimal 10 karakter",
    "string.max": "Alasan maksimal 500 karakter",
  }),
});

const submitLeavesValidation = Joi.object({
  leaveId: Joi.string()
    .required()
    .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
    .messages({
      "string.pattern.base": "Leave ID tidak sesuai format UUID",
    }),
});

const verifyLeavesValidation = Joi.object({
  leaveId: Joi.string()
    .required()
    .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
    .messages({
      "string.pattern.base": "Leave ID tidak sesuai format UUID",
    }),
  status: Joi.string().valid("DITOLAK", "DITERIMA").required().messages({
    "any.only": "Status hanya boleh DITOLAK atau DITERIMA",
  }),
});

const updateDraftValidation = Joi.object({
  leaveId: Joi.string()
    .required()
    .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
    .messages({
      "string.pattern.base": "Leave ID tidak sesuai format UUID",
    }),
  startDate: Joi.date().iso().required().messages({
    "date.format": "Tanggal mulai harus dalam format ISO",
  }),
  endDate: Joi.date().iso().min(Joi.ref("startDate")).required().messages({
    "date.format": "Tanggal selesai harus dalam format ISO",
    "date.min":
      "Tanggal selesai harus lebih besar atau sama dengan tanggal mulai",
  }),
  reason: Joi.string().min(10).max(500).required().messages({
    "string.min": "Alasan minimal 10 karakter",
    "string.max": "Alasan maksimal 500 karakter",
  }),
});

const removeDraftValidation = Joi.object({
  leaveId: Joi.string()
    .required()
    .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)
    .messages({
      "string.pattern.base": "Leave ID tidak sesuai format UUID",
    }),
});

const searchLeaveValidation = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    "number.base": "Halaman harus berupa angka",
    "number.min": "Halaman minimal bernilai 1",
  }),
  size: Joi.number().integer().min(1).default(10).messages({
    "number.base": "Ukuran harus berupa angka",
    "number.min": "Ukuran minimal bernilai 1",
  }),
  status: Joi.string()
    .valid("DRAFT", "TERKIRIM", "DITOLAK", "DITERIMA")
    .optional()
    .messages({
      "any.only":
        "Status hanya boleh salah satu dari DRAFT, TERKIRIM, DITOLAK, atau DITERIMA",
    }),
});

export {
  saveDraftValidation,
  submitLeavesValidation,
  updateDraftValidation,
  removeDraftValidation,
  verifyLeavesValidation,
  searchLeaveValidation,
};
