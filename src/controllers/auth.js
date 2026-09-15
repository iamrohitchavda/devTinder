import bcrypt from "bcrypt";
import User from "../models/user.js";
import { AppError, success } from "../utils/appError.js";

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

export const login = async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password");
  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError("Invalid email or password", 401));
  }

  const token = await user.getJWT();
  res.cookie("token", token, tokenCookieOptions);
  return success(res, 200, "User logged in successfully", user);
};

export const logout = (req, res) => {
  res.clearCookie("token", tokenClearCookieOptions);
  return success(res, 200, "User logged out successfully");
};
