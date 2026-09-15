import User from "../models/user.js";
import validator from "validator";
import { PASSWORD_MESSAGE, PASSWORD_OPTIONS } from "../constants/auth.js";
export const validateEditProfile = (req) => {
  const data = req.body || {};
  const allowedFields = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "photoUrl",
    "skills",
    "bio",
    "githubUrl",
    "portfolioUrl",
    "projects",
    "collaborationRoles",
    "availability",
    "profilePrompts"
  ];

  const isEditAllowed = Object.keys(data).every((key) =>
    allowedFields.includes(key)
  );

  return isEditAllowed ? null : "Invalid fields in profile update";
};

export const validatePasswordUpdate = async (req) => {
  const { existingPassword, newPassword } = req.body || {};
  const user = req.user;
  if (
    !existingPassword ||
    (existingPassword && typeof existingPassword !== "string") ||
    existingPassword.trim() === ""
  ) {
    return "Existing password is required";
  }
  if (!newPassword) {
    return "New password is required";
  }

  if (existingPassword === newPassword) {
    return "New password must be different from the existing password";
  }

  const loggedInUser = await User.findOne({ email: user.email }).select(
    "+password",
  );

  const isExisistingPasswordValid = await loggedInUser.comparePassword(
    existingPassword
  );

  if (!isExisistingPasswordValid) {
    return "Existing password is incorrect";
  }

  if (!validator.isStrongPassword(newPassword, PASSWORD_OPTIONS)) {
    return PASSWORD_MESSAGE;
  }

  return null;
};
