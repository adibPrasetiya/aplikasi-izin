import userService from "../services/user-service.js";

const create = async (req, res, next) => {
  try {
    const result = await userService.create(req.body);
    res.status(201).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const result = await userService.login(req.body);
    res.set("Authorization", `Bearer ${result.token}`).status(200).json({
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const result = await userService.update(req.body, req.user);
    res.set("Authorization", `Bearer ${result.token}`).status(200).json({
      data: result.data,
    });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    res.set("Authorization", "").status(200).json({
      data: "Berhasil logout",
    });
  } catch (error) {
    next(error);
  }
};

export default {
  create,
  login,
  update,
  logout,
};
