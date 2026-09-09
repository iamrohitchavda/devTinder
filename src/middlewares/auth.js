import JWT from "jsonwebtoken";
import User from "../models/user.js";
import { failure } from "../utils/appError.js";

const auth = async (req, res, next) => {
  try {
    const { token } = req.cookies;

    if (!token) {
      return failure(res, 401, "Authentication required");
    }
    const decodedMessage = await JWT.verify(token, process.env.JWT_SECRET);

    if (!decodedMessage) {
      return failure(res, 401, "Authentication failed");
    }

    const { _id } = decodedMessage;

    const user = await User.findById(_id);
    if (!user) {
      return failure(res, 401, "Authentication failed");
    }
    req.user = user;
    next();
  } catch (err) {
    return failure(res, 401, "Authentication failed");
  }
};
export default auth;
