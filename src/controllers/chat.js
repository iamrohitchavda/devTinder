import Chat from "../models/chat.js";
import { success } from "../utils/appError.js";

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

  const orderedMessages = [...chat.messages].sort(
    (first, second) => first.createdAt - second.createdAt,
  );
  const messages = orderedMessages.slice(skip, skip + limit);

  return success(res, 200, "Chat fetched successfully", {
    messages,
    pagination: {
      page,
      limit,
      total: orderedMessages.length,
      hasMore: skip + messages.length < orderedMessages.length,
    },
  });
};
