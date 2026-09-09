import "./config/env.js";
import express from "express";
import connectDB from "./config/db.js";
import cookieParser from "cookie-parser";
import setupAPI from "./routes/index.js";
import cors from "cors";
import http from "http";
import { initalizeSocket } from "./utils/socket.js";
import errorHandler from "./middlewares/errorHandler.js";

import "./utils/cronJob.js";

const app = express();

console.log(`starting in ${process.env.NODE_ENV} mode`);

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

setupAPI(app);

app.use(errorHandler);

// instead of express creates server and hide it , we manually create the server and attach the express app and socket both in it and listen to that together
const server = http.createServer(app);
initalizeSocket(server);

//! TIP: Connect to the database first and then start the server

connectDB()
  .then(() => {
    console.log("Database connected successfully");
    server.listen(process.env.PORT, () => {
      console.log(`Server is running on port ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database connection error:", err);
  });
