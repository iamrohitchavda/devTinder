import { AppError } from "../utils/appError.js";

export const validate = (validators) => async (req, res, next) => {
  const errors = [];

  for (const validator of validators) {
    const error = await validator(req);
    if (error) errors.push(error);
  }

  if (errors.length > 0) {
    return next(new AppError(errors[0], 400));
  }

  next();
};
