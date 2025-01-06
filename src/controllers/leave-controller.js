import leaveService from "../services/leave-service.js";

const saveDraft = async (req, res, next) => {
  try {
    const result = await leaveService.saveDraft(req.user, req.body);
    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const submitLeave = async (req, res, next) => {
  try {
    const result = await leaveService.submitLeave(req.user, req.params.leaveId);
    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const verifyLeave = async (req, res, next) => {
  try {
    const { leaveId } = req.params;
    const { action } = req.body;
    const managerId = req.user.username;
    const result = await leaveService.verifyLeave(managerId, leaveId, action);
    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const updateDraft = async (req, res, next) => {
  try {
    const userId = req.user.username;
    const leaveId = req.params.leaveId;
    const updatedData = req.body;
    const result = await leaveService.updateDraft(userId, leaveId, updatedData);
    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const removeDraft = async (req, res, next) => {
  try {
    const userId = req.user.username;
    const leaveId = req.params.leaveId;
    const result = await leaveService.removeDraft(userId.leaveId);
    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const searchLeave = async (req, res, next) => {
  try {
    const result = await leaveService.searchLeave(req.user, req.query);
    res.status(200).json({
      data: result.data,
      paging: result.paging,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  saveDraft,
  submitLeave,
  verifyLeave,
  updateDraft,
  removeDraft,
  searchLeave,
};
