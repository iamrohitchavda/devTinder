import User from "../models/user.js";
import validator from "validator";
export const validateEditProfile = (data = {}) => {
  const allowedFields = [
    "firstName",
    "lastName",
    "age",
    "gender",
    "photoUrl",
    "skills",
    "bio"
  ];

  const isEditAllowed = Object.keys(data).every((key) =>
    allowedFields.includes(key)
  );

  return isEditAllowed;
};

export const validatePasswordUpdate = async (
  existingPassword,
  newPassword,
  user
) => {
  if (
    !existingPassword ||
    (existingPassword && typeof existingPassword !== "string") ||
    existingPassword.trim() === ""
  ) {
    throw new Error("Existing password is required");
  }
  if (!newPassword) {
    throw new Error("New password is required");
  }
  if (!existingPassword && !newPassword) {
    throw new Error("Both existing and new passwords are required");
  }

  if (existingPassword === newPassword) {
    throw new Error(
      "New password must be different from the existing password"
    );
  }

  const loggedInUser = await User.findOne({ email: user.email }).select(
    "+password",
  );

  const isExisistingPasswordValid = await loggedInUser.comparePassword(
    existingPassword
  );

  if (!isExisistingPasswordValid) {
    throw new Error("Existing password is incorrect");
  }

  if (!validator.isStrongPassword(newPassword)) {
    throw new Error("New password is not strong enough");
  }

  return true;
};
