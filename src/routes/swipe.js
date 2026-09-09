import express from "express";
import auth from "../middlewares/auth.js";
const router = express.Router();

import { swipeDeveloper } from "../controllers/swipe.js";

router.post("/swipes/:action/:targetUserId", auth, swipeDeveloper);

export default router;
