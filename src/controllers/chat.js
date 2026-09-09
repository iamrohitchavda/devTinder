import Chat from "../models/chat.js";
import { success } from "../utils/appError.js";

export const getChats = async (req, res) => {
  const { receiverId } = req.params;

  const senderId = req.user._id;

  let chat = await Chat.findOne({
      participants: { $all: [senderId, receiverId] },
    }).populate({
      path: "messages.senderId",
      select: "firstName lastName",
    });

    if (!chat) {
      chat = new Chat({
        participants: [senderId, receiverId],
        messages: [],
      });
      await chat.save();
    }
  return success(res, 200, "Chat fetched successfully", chat);
};
