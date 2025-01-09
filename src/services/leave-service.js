import {
  removeDraftValidation,
  saveDraftValidation,
  submitLeavesValidation,
  updateDraftValidation,
  verifyLeavesValidation,
} from "../validations/leaves-validation.js";
import { validate } from "../validations/validator.js";
import { query } from "../apps/database.js";
import { ResponseError } from "../errors/response-error.js";

const saveDraft = async (user, leaveData) => {
  const validateBody = validate(saveDraftValidation, {
    ...leaveData,
    username: user.username,
  });
  const { startDate, endDate, reason, username } = validateBody;

  // Simpan atau update data DRAFT
  const result = await query(
    `INSERT INTO leaveRequests (userId, startDate, endDate, reason, status) VALUES (?, ?, ?, ?, 'DRAFT')`,
    [username, startDate, endDate, reason]
  );

  return {
    id: result.insertId,
    userId: username,
    startDate,
    endDate,
    reason,
    status: "DRAFT",
  };
};

const submitLeave = async (user, leaveId) => {
  const validateBody = validate(submitLeavesValidation, { leaveId: leaveId });

  const [draft] = await query(
    `SELECT id FROM leaveRequests WHERE id = ? AND userId = ? AND status = 'DRAFT'`,
    [validateBody.leaveId, user.username]
  );

  if (!draft) {
    throw new ResponseError(404, "Draft izin cuti tidak ditemukan");
  }

  await query(`UPDATE leaveRequests SET status = 'TERKIRIM' WHERE id = ?`, [
    draft.id,
  ]);

  return {
    id: draft.id,
    status: "TERKIRIM",
  };
};

const verifyLeave = async (managerId, leaveId, action) => {
  const validateBody = validate(verifyLeavesValidation, {
    id: leaveId,
    action: action,
  });

  const [leaveRequest] = await query(
    `SELECT id, status, managerId FROM leaveRequests WHERE id = ?`,
    [validateBody.id]
  );

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

  await query(`UPDATE leaveRequests SET status = ? WHERE id = ?`, [
    validateBody.action,
    leaveRequest.id,
  ]);

  return {
    message: `Izin cuti berhasil ${
      validateBody.action === "DITERIMA" ? "diterima" : "ditolak"
    }`,
  };
};

const updateDraft = async (userId, leaveId, updatedData) => {
  const validateBody = validate(updateDraftValidation, {
    ...updatedData,
    leaveId: leaveId,
  });

  const [findDraft] = await query(
    `SELECT id FROM leaveRequests WHERE id = ? AND userId = ?`,
    [validateBody.leaveId, userId]
  );

  if (!findDraft) {
    throw new ResponseError(404, "Draft tidak ditemukan");
  }

  const updatedFields = [];
  const updatedValues = [];

  if (validateBody.startDate) {
    updatedFields.push("startDate = ?");
    updatedValues.push(validateBody.startDate);
  }

  if (validateBody.endDate) {
    updatedFields.push("endDate = ?");
    updatedValues.push(validateBody.endDate);
  }

  if (validateBody.reason) {
    updatedFields.push("reason = ?");
    updatedValues.push(validateBody.reason);
  }

  updatedValues.push(findDraft.id);

  await query(
    `UPDATE leaveRequests SET ${updatedFields.join(", ")} WHERE id = ?`,
    updatedValues
  );

  return {
    id: findDraft.id,
    ...updatedData,
  };
};

const removeDraft = async (userId, leaveId) => {
  const validateBody = validate(removeDraftValidation, { leaveId: leaveId });
  const [findDraft] = await query(
    `SELECT id FROM leaveRequests WHERE id = ? AND userId = ?`,
    [validateBody.leaveId, userId]
  );

  if (!findDraft) {
    throw new ResponseError(404, "Draft tidak ditemukan");
  }

  await query(`DELETE FROM leaveRequests WHERE id = ?`, [findDraft.id]);

  return "Draft berhasil dihapus";
};

export default {
  saveDraft,
  submitLeave,
  verifyLeave,
  updateDraft,
  removeDraft,
};
