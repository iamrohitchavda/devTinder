import authRouter from "./auth.js";
import profileRouter from "./profile.js";
import swipeRouter from "./swipe.js";
import userRouter from "./user.js";
import chatRouter from "./chat.js";

const routers = [
  authRouter,
  profileRouter,
  swipeRouter,
  userRouter,
  chatRouter,
];

export default (app) =>
  routers.forEach((router) => {
    app.use("/", router);
  });
