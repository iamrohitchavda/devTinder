import bcrypt from "bcrypt";
import User from "../models/user.js";
import { signUpValidator, loginValidator } from "../validators/auth.js";
import { failure, success } from "../utils/appError.js";

const tokenCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  maxAge: 24 * 60 * 60 * 1000,
};

const tokenClearCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
};

export const signUp = async (req, res) => {
  try {
    signUpValidator(req.body);
  } catch (error) {
    return failure(res, 400, error.message);
  }
  const {
    firstName,
    lastName,
    email,
    password,
    age,
    gender,
    photoUrl,
    skills,
    bio
  } = req.body;

  const userObject = new User({
    firstName,
    lastName,
    email,
    password,
    age,
    gender,
    photoUrl,
    skills,
    bio
  });
  const passwordHash = await bcrypt.hash(req.body.password, 10);
  userObject.password = passwordHash;
  const saveUser = await userObject.save();

  const token = await saveUser.getJWT();
  res.cookie("token", token, tokenCookieOptions);
  return success(res, 201, "User signed up successfully", saveUser);
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    loginValidator(req.body);
  } catch (error) {
    return failure(res, 400, error.message);
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return failure(res, 401, "Invalid email or password");
  }

  const token = await user.getJWT();
  res.cookie("token", token, tokenCookieOptions);
  return success(res, 200, "User logged in successfully", user);
};

export const logout = (req, res) => {
  res.clearCookie("token", tokenClearCookieOptions);
  return success(res, 200, "User logged out successfully");
};
