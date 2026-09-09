import express from "express";
import auth from "../middlewares/auth.js";

import {
  feed,
  userConnections
} from "../controllers/user.js";

const router = express.Router();

router.get("/user/connections", auth, userConnections);

router.get("/feed", auth, feed);

export default router;
