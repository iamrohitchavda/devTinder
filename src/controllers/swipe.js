import ConnectionRequest from "../models/connectionRequest.js";
import User from "../models/user.js";
import { sendEmail } from "../utils/sendEmail.js";
import { AppError, success } from "../utils/appError.js";
import { PUBLIC_USER_FIELDS } from "../constants/user.js";
import { emitMatchCreated } from "../utils/socket.js";

export const swipeDeveloper = async (req, res, next) => {
    const fromUserId = req.user._id;
    const toUserId = req.params.targetUserId;
    const status = req.params.action;

    const allowStatuses = ["interested", "ignored"];
    if (!allowStatuses.includes(status)) {
      return next(new AppError("Invalid swipe action", 400));
    }

    const toUser = await User.findById(toUserId);
    if (!toUser) {
      return next(new AppError("User not found", 404));
    }

    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        { fromUserId, toUserId: toUser._id },
        { fromUserId: toUser._id, toUserId: fromUserId },
      ],
    });

    if (existingRequest?.fromUserId.toString() === fromUserId.toString()) {
      return next(new AppError("You have already swiped on this developer", 409));
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
      return next(new AppError("You have already swiped on this developer", 409));
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
