import express from "express";

import { signUp, login, logout } from "../controllers/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  validateEmail,
  validateLoginPassword,
  validatePassword,
  validateSignUpAge,
  validateSignUpName,
} from "../validators/auth.js";

const router = express.Router();

router.post(
  "/signup",
  validate([validateSignUpName, validateSignUpAge, validateEmail, validatePassword]),
  signUp,
);

router.post("/login", validate([validateEmail, validateLoginPassword]), login);

router.post("/logout", logout);

export default router;
