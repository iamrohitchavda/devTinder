import JWT from "jsonwebtoken";
import User from "../models/user.js";
import { AppError } from "../utils/appError.js";

const auth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return next(new AppError("Authentication required", 401));
    }
    const decodedMessage = await JWT.verify(token, process.env.JWT_SECRET);

    if (!decodedMessage) {
      return next(new AppError("Authentication failed", 401));
    }

    const { _id } = decodedMessage;

    const user = await User.findById(_id);
    if (!user) {
      return next(new AppError("Authentication failed", 401));
    }
    req.user = user;
    next();
  } catch (err) {
    return next(new AppError("Authentication failed", 401));
  }
};
export default auth;
