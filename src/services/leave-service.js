import {
  removeDraftValidation,
  saveDraftValidation,
  submitLeavesValidation,
  updateDraftValidation,
  verifyLeavesValidation,
} from "../validations/leaves-validation.js";
import { validate } from "../validations/validator.js";
import { prismaClient } from "../apps/database.js";
import { ResponseError } from "../errors/response-error.js";

// Membuat atau mengupdate izin cuti dalam status DRAFT
const saveDraft = async (user, leaveData) => {
  const validateBody = validate(saveDraftValidation, {
    ...leaveData,
    username: user.username,
  });
  const { startDate, endDate, reason, username } = validateBody;

  // Simpan atau update data DRAFT
  const draft = await prismaClient.leaveRequests.create({
    data: {
      userId: username,
      startDate,
      endDate,
      reason,
      status: "DRAFT",
    },
  });

  return draft;
};

// Mengirim izin cuti
const submitLeave = async (user, leaveId) => {
  const validateBody = validate(submitLeavesValidation, { leaveId: leaveId });

  const draft = await prismaClient.leaveRequests.findFirst({
    where: {
      id: validateBody.leaveId,
      userId: user.username,
      status: "DRAFT",
    },
  });

  if (!draft) {
    throw new ResponseError(404, "Draft izin cuti tidak ditemukan");
  }

  // Perbarui status menjadi TERKIRIM
  const sendDraft = await prismaClient.leaveRequests.update({
    where: {
      id: draft.id,
    },
    data: {
      status: "TERKIRIM",
    },
  });

  return sendDraft;
};

// Verifikasi izin cuti oleh manajer
const verifyLeave = async (managerId, leaveId, action) => {
  const validateBody = validate(verifyLeavesValidation, {
    id: leaveId,
    action: action,
  });

  const leaveRequest = await prismaClient.leaveRequests.findUnique({
    where: { id: validateBody.leaveId },
    include: { user: true },
  });

  if (!leaveRequest || leaveRequest.status !== "TERKIRIM") {
    throw new ResponseError(
      404,
      "Izin cuti tidak ditemukan atau status tidak valid"
    );
  }

  if (leaveRequest.managerId !== managerId) {
    throw new ResponseError(403, "Anda tidak berhak memverifikasi izin ini");
  }

  const validActions = ["DITERIMA", "DITOLAK"];
  if (!validActions.includes(validateBody.action)) {
    throw new ResponseError(400, "Aksi tidak valid");
  }

  await prismaClient.leaveRequests.update({
    where: { id: validateBody.leaveId },
    data: {
      status: validateBody.action,
    },
  });

  return {
    message: `Izin cuti berhasil ${
      validateBody.action === "DITERIMA" ? "diterima" : "ditolak"
    }`,
  };
};

// edit draft izin cuti oleh user
const updateDraft = async (userId, leaveId, updatedData) => {
  const validateBody = validate(updateDraftValidation, {
    ...updatedData,
    leaveId: leaveId,
  });

  const findDraft = await prismaClient.leaveRequests.findUnique({
    where: {
      id: validateBody.leaveId,
      userId: userId,
    },
    select: {
      id: true,
    },
  });

  if (!findDraft) {
    throw new ResponseError(404, "Draft tidak ditemukan");
  }

  return prismaClient.leaveRequests.update({
    where: {
      id: findDraft.id,
      userId: userId,
    },
    data: validateBody.updatedData,
  });
};

//hapus draft oleh cuti
const removeDraft = async (userId, leaveId) => {
  const validateBody = validate(removeDraftValidation, { leaveId: leaveId });
  const findDraft = await prismaClient.leaveRequests.findUnique({
    where: {
      id: validateBody.leaveId,
      userId: userId,
    },
    select: {
      id: true,
    },
  });

  if (!findDraft) {
    throw new ResponseError(404, "Draft tidak ditemukan");
  }

  await prismaClient.leaveRequests.delete({
    where: {
      id: validateBody.leaveId,
      userId: userId,
    },
  });

  return "Draft berhasil dihapus";
};

export default {
  saveDraft,
  submitLeave,
  verifyLeave,
  updateDraft,
  removeDraft,
};
