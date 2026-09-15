import bcrypt from "bcrypt";
import { success } from "../utils/appError.js";

export const profileView = (req, res) =>
  success(res, 200, "Profile fetched successfully", req.user);

export const profileEdit = async (req, res) => {
  Object.assign(req.user, req.body);
  const user = await req.user.save();
  return success(res, 200, "Profile updated successfully", user);
};

export const passwordUpdate = async (req, res) => {
  const { newPassword } = req.body || {};

  req.user.password = await bcrypt.hash(newPassword, 10);
  await req.user.save();
  return success(res, 200, "Password updated successfully");
};
