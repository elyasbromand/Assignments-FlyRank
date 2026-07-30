import express from "express";
import authMiddleware from "../middlewares/auth.middleware.js";

const protectedRouter = express.Router();

protectedRouter.use(authMiddleware);

protectedRouter.get("/profile", (req, res) => {
  const { user } = req;
  res.status(200).json({
    id: user.id,
    email: user.email,
    created_at: user.created_at,
  });
});

protectedRouter.get("/dashboard", (req, res) => {
  const { user } = req;
  res.status(200).json({
    message: `Welcome to your dashboard, ${user.email}`,
    user_id: user.id,
  });
});

export default protectedRouter;
