import express from "express";
import auth from "../middlewares/auth.js";
import { validate } from "../middlewares/validate.js";
import {
  validateEditProfile,
  validatePasswordUpdate,
} from "../validators/profile.js";

import {
  passwordUpdate,
  profileEdit,
  profileView
} from "../controllers/profile.js";

const router = express.Router();
router.get("/profile/view", auth, profileView);

router.patch("/profile/edit", auth, validate([validateEditProfile]), profileEdit);

router.patch(
  "/password/update",
  auth,
  validate([validatePasswordUpdate]),
  passwordUpdate,
);

export default router;
