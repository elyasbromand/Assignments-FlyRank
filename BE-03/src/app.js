import express from "express";
import dotenv from "dotenv";
import errorHandler from "./middleware/errors.middleware.js";
import authRouter from "./routes/auth.router.js";
import publicRouter from "./routes/public.router.js";
import protectedRouter from "./routes/protected.router.js";


dotenv.config();
const app = express();

app.use(express.json());


app.use("/auth", authRouter);
app.use("/public", publicRouter);
app.use("/protected", protectedRouter);
app.use(errorHandler);
export default app;
