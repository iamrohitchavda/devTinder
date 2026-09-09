import bcrypt from "bcrypt";
import User from "../models/user.js";
import { signUpValidator, loginValidator } from "../validators/auth.js";

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
  } catch (err) {
    return res.status(400).send("Validation Error: " + err.message);
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
  try {
    const passwordHash = await bcrypt.hash(req.body.password, 10);
    userObject.password = passwordHash;
    const saveUser = await userObject.save();

    const token = await saveUser.getJWT();
    res.cookie("token", token, tokenCookieOptions);

    res.json({ message: "User signed up successfully", user: saveUser });
  } catch (err) {
    return res.status(400).send("Error signing up user" + err.message);
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    loginValidator(req.body);

    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res.status(401).send("Invalid username or password");
    }

    const isPasswordValid = await user.comparePassword(password);

    if (isPasswordValid) {
      const token = await user.getJWT();
      res.cookie("token", token, tokenCookieOptions);
      res.json({ message: "User logged in successfully", user });
    } else {
      return res.status(401).send("Invalid username or password");
    }
  } catch (err) {
    return res.status(500).send("Error logging in user:- " + err.message);
  }
};

export const logout = (req, res) => {
  res.clearCookie("token", tokenClearCookieOptions);
  res.send("User logged out successfully");
};
