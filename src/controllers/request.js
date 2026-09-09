import ConnectionRequest from "../models/connectionRequest.js";
import User from "../models/user.js";
import { sendEmail } from "../utils/sendEmail.js";
import { failure, success } from "../utils/appError.js";

export const requestSend = async (req, res) => {
    const fromUserId = req.user._id;
    const toUserId = req.params.toUserId;
    const status = req.params.status;

    const allowStatuses = ["interested", "ignored"];
    if (!allowStatuses.includes(status)) {
      return failure(res, 400, "Invalid status value");
    }

    const toUser = await User.findById(toUserId);
    if (!toUser) {
      return failure(res, 404, "User not found");
    }

    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId: toUser._id },
        { fromUserId: toUser._id, toUserId: fromUserId },
      ],
    });

    if (existingRequest) {
      return failure(res, 409, "Connection request already exists");
    }

    const connectionRequest = new ConnectionRequest({
      fromUserId,
      toUserId,
      status,
    });
    const data = await connectionRequest.save();

    try {
      status.includes("interested") &&
        (await sendEmail(
          toUser.email,
          "New Connection Request",
          `You got ${status} request from ${req.user.firstName}`,
          `You got ${status} request from ${req.user.firstName}`,
        ));
    } catch (err) {
      console.log("Email Error: ", err.message);
    }

    return success(
      res,
      201,
      status === "interested"
        ? req.user.firstName + " is " + status + " in " + toUser.firstName
        : req.user.firstName + " " + status + " " + toUser.firstName,
      data,
    );
};

export const requestReview = async (req, res) => {
    const loggedInUser = req.user;
    const { status, requestId } = req.params;

    const allowStatuses = ["accepted", "rejected"];
    if (!allowStatuses.includes(status)) {
      return failure(res, 400, "Status not allowed");
    }

    const connectionRequest = await ConnectionRequest.findOne({
      _id: requestId,
      toUserId: loggedInUser._id,
      status: "interested",
    });

    if (!connectionRequest) {
      return failure(res, 404, "Connection request not found or already processed");
    }

    connectionRequest.status = status;
    const updatedRequest = await connectionRequest.save();
    return success(
      res,
      200,
      `Connection request ${status} successfully`,
      updatedRequest,
    );
};
