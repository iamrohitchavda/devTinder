import bcrypt from "bcrypt";
import {
  validateEditProfile,
  validatePasswordUpdate
} from "../validators/profile.js";
import { failure, success } from "../utils/appError.js";

export const profileView = (req, res) =>
  success(res, 200, "Profile fetched successfully", req.user);

export const profileEdit = async (req, res) => {
  if (!validateEditProfile(req.body)) {
    return failure(res, 400, "Invalid fields in profile update");
  }

  Object.assign(req.user, req.body);
  const user = await req.user.save();
  return success(res, 200, "Profile updated successfully", user);
};

export const passwordUpdate = async (req, res) => {
  const { existingPassword, newPassword } = req.body || {};

  try {
    await validatePasswordUpdate(existingPassword, newPassword, req.user);
  } catch (error) {
    return failure(res, 400, error.message);
  }

  req.user.password = await bcrypt.hash(newPassword, 10);
  await req.user.save();
  return success(res, 200, "Password updated successfully");
};
