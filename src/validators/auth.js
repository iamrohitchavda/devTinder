import validator from "validator";
import { PASSWORD_MESSAGE, PASSWORD_OPTIONS } from "../constants/auth.js";
export const validateSignUpName = (req) => {
  const { firstName, lastName } = req.body || {};

  if (!firstName || !lastName) {
    return "First name and last name are required";
  }
  if (firstName.length > 30 || lastName.length > 30) {
    return "First name and last name should be less than 30 characters";
  }

  return null;
};

export const validateSignUpAge = (req) => {
  const { age } = req.body || {};

  if (age && typeof age !== "number") {
    return "Age must be a number";
  }

  return null;
};

export const validateEmail = (req) => {
  const { email } = req.body || {};

  if (!email || !validator.isEmail(email)) {
    return "Invalid email address";
  }

  return null;
};

export const validatePassword = (req) => {
  const { password } = req.body || {};

  if (!validator.isStrongPassword(password || "", PASSWORD_OPTIONS)) {
    return PASSWORD_MESSAGE;
  }

  return null;
};

export const validateLoginPassword = (req) => {
  const { password } = req.body || {};

  if (!password || typeof password !== "string") {
    return "Password is required";
  }

  return null;
};
