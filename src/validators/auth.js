import validator from "validator";
import { PASSWORD_MESSAGE, PASSWORD_OPTIONS } from "../constants/auth.js";
export const signUpValidator = (data = {}) => {
  const { email, firstName, lastName, password, age } = data;

  if (!firstName || !lastName) {
    throw new Error("First name and Last name are required");
  } else if (firstName.length > 30 || lastName.length > 30) {
    throw new Error(
      "First name and Last name should be less than 30 characters"
    );
  }

  if (age && typeof age !== "number") {
    throw new Error("Age is required and must be a number");
  }

  if (!email || (email && !validator.isEmail(email))) {
    throw new Error("Invalid email address");
  }

  if (!validator.isStrongPassword(password, PASSWORD_OPTIONS)) {
    throw new Error(PASSWORD_MESSAGE);
  }
};
export const loginValidator = (data) => {
  const { email, password } = data;

  if (!validator.isEmail(email)) {
    throw new Error("Invalid email address");
  }

  if (!password) {
    throw new Error("Password is required");
  }
};
