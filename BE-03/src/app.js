import express from "express";
import dotenv from "dotenv";
import errorHandler from "./middleware/errors.middleware.js";
import authRouter from "./routes/auth.router.js";


dotenv.config();
const app = express();

app.use(express.json());


app.use("/auth", authRouter);
app.use(errorHandler);
export default app;
