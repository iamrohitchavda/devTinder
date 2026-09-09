import mongoose from "mongoose";
import ConnectionRequest from "../models/connectionRequest.js";
import { failure } from "../utils/appError.js";

export const isUserAlreadyFriendForChat = async (req, res, next) => {
  const { receiverId } = req.params;

  if (!receiverId || !mongoose.isValidObjectId(receiverId)) {
    return failure(res, 400, "Invalid receiver ID");
  }

  try {
    const isFriend = await ConnectionRequest.findOne({
      $or: [
        { fromUserId: req.user._id, toUserId: receiverId, status: "accepted" },
        { fromUserId: receiverId, toUserId: req.user._id, status: "accepted" },
      ],
    });

    if (!isFriend) {
      return failure(res, 403, "You are not friends with this user.");
    }

    next();
  } catch (error) {
    next(error);
  }
};
