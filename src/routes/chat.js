import express from "express";
import auth from "../middlewares/auth.js";
import {
  clearChatForCurrentUser,
  getChats,
  unsendMessage,
} from "../controllers/chat.js";
import { isUserAlreadyFriendForChat } from "../validators/chat.js";

const chatRouter = express.Router();

chatRouter.get("/chat/:receiverId", auth, isUserAlreadyFriendForChat, getChats);
chatRouter.delete(
  "/chat/:receiverId",
  auth,
  isUserAlreadyFriendForChat,
  clearChatForCurrentUser,
);
chatRouter.delete(
  "/chat/:receiverId/messages/:messageId",
  auth,
  isUserAlreadyFriendForChat,
  unsendMessage,
);

export default chatRouter;
