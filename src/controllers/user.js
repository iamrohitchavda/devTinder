import ConnectionRequest from "../models/connectionRequest.js";
import User from "../models/user.js";
import { success } from "../utils/appError.js";
import { PUBLIC_USER_FIELDS } from "../constants/user.js";

export const userRequestReceived = async (req, res) => {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested"
    }).populate("fromUserId", PUBLIC_USER_FIELDS);

    return success(res, 200, "Requests fetched successfully", connectionRequests);
};

export const userConnections = async (req, res) => {
    const loggedInUser = req.user;

    const connections = await ConnectionRequest.find({
      $or: [
        { fromUserId: loggedInUser._id, status: "accepted" },
        { toUserId: loggedInUser._id, status: "accepted" }
      ]
    })
      .populate("fromUserId toUserId", PUBLIC_USER_FIELDS);

    const data = connections.map((row) => {
      if (row.fromUserId._id.equals(loggedInUser._id)) {
        return row.toUserId;
      } else {
        return row.fromUserId;
      }
    });

    return success(res, 200, "Connections fetched successfully", data);
};

export const feed = async (req, res) => {
    const loggedInUser = req.user;
    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    if (limit > 50) limit = 50;
    const skip = (page - 1) * limit;

    const connectionRequestsSent = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }]
    });

    const hideUserFromFeed = new Set();
    connectionRequestsSent.forEach((request) => {
      hideUserFromFeed.add(request.fromUserId.toString());
      hideUserFromFeed.add(request.toUserId.toString());
    });

    const users = await User.find({
      $and: [
        { _id: { $ne: loggedInUser._id } },
        { _id: { $nin: Array.from(hideUserFromFeed) } }
      ]
    })
      .select(PUBLIC_USER_FIELDS)
      .skip(skip)
      .limit(limit);

    return success(res, 200, "Feed fetched successfully", users);
};
