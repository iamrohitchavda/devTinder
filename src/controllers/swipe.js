import ConnectionRequest from "../models/connectionRequest.js";
import User from "../models/user.js";
import { sendEmail } from "../utils/sendEmail.js";
import { failure, success } from "../utils/appError.js";
import { PUBLIC_USER_FIELDS } from "../constants/user.js";
import { emitMatchCreated } from "../utils/socket.js";

export const swipeDeveloper = async (req, res) => {
    const fromUserId = req.user._id;
    const toUserId = req.params.targetUserId;
    const status = req.params.action;

    const allowStatuses = ["interested", "ignored"];
    if (!allowStatuses.includes(status)) {
      return failure(res, 400, "Invalid swipe action");
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

    if (existingRequest?.fromUserId.toString() === fromUserId.toString()) {
      return failure(res, 409, "You have already swiped on this developer");
    }

    if (existingRequest?.status === "interested") {
      if (status === "ignored") {
        existingRequest.status = "ignored";
        const connection = await existingRequest.save();
        return success(res, 200, "Interest ignored", {
          isMatch: false,
          connection,
        });
      }

      existingRequest.status = "accepted";
      const connection = await existingRequest.save();
      const [matchedUser, currentUser] = await Promise.all([
        User.findById(toUserId).select(PUBLIC_USER_FIELDS),
        User.findById(fromUserId).select(PUBLIC_USER_FIELDS),
      ]);
      const matchForSender = { isMatch: true, matchedUser, connection };

      emitMatchCreated([
        { userId: fromUserId, data: matchForSender },
        {
          userId: toUserId,
          data: { isMatch: true, matchedUser: currentUser, connection },
        },
      ]);

      return success(res, 200, "Collaboration channel unlocked!", matchForSender);
    }

    if (existingRequest) {
      return failure(res, 409, "You have already swiped on this developer");
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
      { isMatch: false, connection: data },
    );
};
