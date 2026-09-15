import Chat from "../models/chat.js";
import mongoose from "mongoose";
import User from "../models/user.js";
import { PUBLIC_USER_FIELDS } from "../constants/user.js";
import { AppError, success } from "../utils/appError.js";
import { emitMessageUnsent } from "../utils/socket.js";

export const getChats = async (req, res) => {
  const { receiverId } = req.params;
  const senderId = req.user._id;
  const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 50, 1), 100);
  const skip = (page - 1) * limit;

  let chat = await Chat.findOne({
    participants: { $all: [senderId, receiverId] },
  }).populate({
    path: "messages.senderId",
    select: "firstName lastName",
  });

  if (!chat) {
    chat = await Chat.create({
      participants: [senderId, receiverId],
      messages: [],
    });
  }

  const clearedAt = (chat.clearedAtBy || []).find(
    ({ userId }) => userId.toString() === senderId.toString(),
  )?.clearedAt;
  const orderedMessages = chat.messages
    .filter((message) => !clearedAt || message.createdAt > clearedAt)
    .sort((first, second) => first.createdAt - second.createdAt);
  const messages = orderedMessages.slice(skip, skip + limit);
  const partner = await User.findById(receiverId).select(PUBLIC_USER_FIELDS);

  return success(res, 200, "Chat fetched successfully", {
    partner,
    messages,
    pagination: {
      page,
      limit,
      total: orderedMessages.length,
      hasMore: skip + messages.length < orderedMessages.length,
    },
  });
};

export const clearChatForCurrentUser = async (req, res) => {
  const { receiverId } = req.params;
  const userId = req.user._id;

  const chat = await Chat.findOne({ participants: { $all: [userId, receiverId] } });

  if (chat) {
    chat.clearedAtBy = (chat.clearedAtBy || []).filter(
      ({ userId: clearedUserId }) => clearedUserId.toString() !== userId.toString(),
    );
    chat.clearedAtBy.push({ userId, clearedAt: new Date() });
    await chat.save();
  }

  return success(res, 200, "Chat deleted for you");
};

export const unsendMessage = async (req, res, next) => {
  const { receiverId, messageId } = req.params;
  const senderId = req.user._id;

  if (!mongoose.isValidObjectId(messageId)) {
    return next(new AppError("Invalid message ID", 400));
  }

  const chat = await Chat.findOne({ participants: { $all: [senderId, receiverId] } });

  const message = chat?.messages.id(messageId);
  if (!message || message.senderId.toString() !== senderId.toString()) {
    return next(new AppError("Message not found", 404));
  }

  message.deleteOne();
  await chat.save();
  emitMessageUnsent(senderId, receiverId, messageId);

  return success(res, 200, "Message unsent");
};
