import express from "express";
import dotenv from "dotenv";
import errorHandler from "./middlewares/errors.middleware.js";
import authRouter from "./routes/auth.routes.js";
import protectedRouter from "./routes/protected.routes.js";

dotenv.config();

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/auth", authRouter);
app.use("/protected", protectedRouter);

app.use((req, res, next) => {
  res.status(404).json({ error: "Route not found" });
});

app.use(errorHandler);

export default app;
