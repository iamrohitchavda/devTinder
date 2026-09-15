import mongoose from "mongoose";
import ConnectionRequest from "../models/connectionRequest.js";
import { AppError } from "../utils/appError.js";

export const isUserAlreadyFriendForChat = async (req, res, next) => {
  const { receiverId } = req.params;

  if (!receiverId || !mongoose.isValidObjectId(receiverId)) {
    return next(new AppError("Invalid receiver ID", 400));
  }

  try {
    const isFriend = await ConnectionRequest.findOne({
      $or: [
        { fromUserId: req.user._id, toUserId: receiverId, status: "accepted" },
        { fromUserId: receiverId, toUserId: req.user._id, status: "accepted" },
      ],
    });

    if (!isFriend) {
      return next(new AppError("You are not friends with this user.", 403));
    }

    next();
  } catch (error) {
    next(error);
  }
};
