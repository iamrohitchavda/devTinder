import { Server } from "socket.io";
import crypto from "crypto";
import Chat from "../models/chat.js";
import JWT from "jsonwebtoken";
import mongoose from "mongoose";
import User from "../models/user.js";
import ConnectionRequest from "../models/connectionRequest.js";

let io;

export const emitMatchCreated = (events) => {
  if (!io) return;

  events.forEach(({ userId, data }) => {
    io.to(`user:${userId}`).emit("match-created", data);
  });
};

const getHashedRoomId = (sender, receiver) => {
  return crypto
    .createHash("sha256")
    .update([sender, receiver].sort().join("&"))
    .digest("hex");
};

const getTokenFromCookies = (cookieHeader = "") =>
  cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith("token="))
    ?.slice("token=".length);

const areAcceptedConnections = async (userId, receiverId) =>
  ConnectionRequest.exists({
    $or: [
      { fromUserId: userId, toUserId: receiverId, status: "accepted" },
      { fromUserId: receiverId, toUserId: userId, status: "accepted" },
    ],
  });

export const initalizeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  const userOnlineList = new Map();

  io.use(async (socket, next) => {
    try {
      const token = getTokenFromCookies(socket.handshake.headers.cookie);
      if (!token) {
        return next(new Error("Authentication required"));
      }

      const { _id } = JWT.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(_id).select("firstName lastName");
      if (!user) {
        return next(new Error("User not found"));
      }

      socket.data.user = {
        id: user._id.toString(),
        name: `${user.firstName} ${user.lastName || ""}`.trim(),
      };
      next();
    } catch {
      next(new Error("Authentication failed"));
    }
  });

  io.on("connection", (socket) => {
    const senderId = socket.data.user.id;
    socket.join(`user:${senderId}`);

    socket.on("goOnline", () => {
      userOnlineList.set(senderId, socket.id);
      // Immediately broadcast to ALL clients that this user has come online!
      io.emit("status-changed", {
        userOnlineList: Object.fromEntries(userOnlineList),
      });
    });

    socket.on("joinChat", async ({ receiverId }) => {
      if (!mongoose.isValidObjectId(receiverId)) {
        return socket.emit("chat-error", { message: "Invalid receiver ID" });
      }

      if (!(await areAcceptedConnections(senderId, receiverId))) {
        return socket.emit("chat-error", {
          message: "You can only chat with accepted connections.",
        });
      }

      const roomId = getHashedRoomId(senderId, receiverId);
      socket.join(roomId);
      userOnlineList.set(senderId, socket.id);

      io.to(roomId).emit("status-changed", {
        userOnlineList: Object.fromEntries(userOnlineList),
      });
    });
    socket.on(
      "sendMessage",
      async ({ text, receiverId }) => {
        try {
          if (
            !mongoose.isValidObjectId(receiverId) ||
            typeof text !== "string" ||
            !text.trim() ||
            text.length > 2000
          ) {
            return socket.emit("chat-error", { message: "Invalid message" });
          }

          if (!(await areAcceptedConnections(senderId, receiverId))) {
            return socket.emit("chat-error", {
              message: "You can only chat with accepted connections.",
            });
          }

          let chat = await Chat.findOne({
            participants: { $all: [senderId, receiverId] },
          });

          if (!chat) {
            chat = new Chat({
              participants: [senderId, receiverId],
              messages: [],
            });
          }

          chat.messages.push({
            text: text.trim(),
            senderId,
            receiverId,
          });

          await chat.save();
          const message = chat.messages.at(-1);

          const roomId = getHashedRoomId(senderId, receiverId);
          io.to(roomId).emit("messageReceived", {
            _id: message._id,
            text: message.text,
            senderId,
            createdAt: message.createdAt,
            receiverId,
            senderName: socket.data.user.name,
          });
        } catch (error) {
          console.log("error while sending message", error.message);
        }
      },
    );

    socket.on("disconnect", (reason) => {
      // Find the user ID by checking which map entry has this socket.id
      let disconnectedUserId = null;

      for (const [key, value] of userOnlineList.entries()) {
        if (value === socket.id) {
          disconnectedUserId = key;
          break;
        }
      }

      if (disconnectedUserId) {
        userOnlineList.delete(disconnectedUserId);

        io.emit("status-changed", {
          userOnlineList: Object.fromEntries(userOnlineList),
        });
      }
    });
  });
};
