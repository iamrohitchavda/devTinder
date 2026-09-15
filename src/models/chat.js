import mongoose from "mongoose";

const messageSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      default: "",
      trim: true,
      maxlength: 2000,
    },
    imageData: {
      type: String,
      default: null,
      maxlength: 2100000,
    },
    mediaUrl: {
      type: String,
      default: null,
      maxlength: 2048,
    },
    readAt: {
      type: Date,
      default: null,
    },
    deliveredAt: {
      type: Date,
      default: null,
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const chatSchema = new mongoose.Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  ],
  messages: [messageSchema],
  clearedAtBy: [
    {
      userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      clearedAt: {
        type: Date,
        required: true,
      },
    },
  ],
});

const Chat = new mongoose.model("Chat", chatSchema);

export default Chat;
