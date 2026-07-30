import express from "express";
import { signUp, signIn, logout } from "../services/auth.services.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const authRouter = express.Router();

authRouter.post("/signup", async (req, res, next) => {
  try {
    const result = await signUp(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

authRouter.post("/signin", async (req, res, next) => {
  try {
    const result = await signIn(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

authRouter.post("/logout", authMiddleware, async (req, res, next) => {
  try {
    const result = await logout(req.accessToken);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
});

export default authRouter;
