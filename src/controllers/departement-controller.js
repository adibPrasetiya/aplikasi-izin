import departementService from "../services/departement-service.js";

const create = async (req, res, next) => {
  try {
    const result = await departementService.create(req.body);
    res.status(201).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const get = async (req, res, next) => {
  try {
    const result = await departementService.get(req.params.departementId);
    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const update = async (req, res, next) => {
  try {
    const result = await departementService.update(
      req.params.departementId,
      req.body
    );
    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const remove = async (req, res, next) => {
  try {
    const result = await departementService.remove(req.params.departementId);
    res.status(200).json({
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const search = async (req, res, next) => {
  try {
    const reqBody = {
      name: req.query.name,
      email: req.query.email,
      page: req.query.page,
      size: req.query.size,
    };

    const result = await departementService.search(reqBody);
    res.status(200).json({
      data: result.data,
      paging: result.paging,
    });
  } catch (error) {
    next(error);
  }
};

export default {
  create,
  get,
  update,
  remove,
  search,
};
