import express from "express";
import dotenv from "dotenv";
import errorHandler from "./middleware/errors.middleware.js";
import authRouter from "./routes/auth.router.js";
import publicRouter from "./routes/public.router.js";
import protectedRouter from "./routes/protected.router.js";
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';


dotenv.config();
const app = express();

app.use(express.json());

const openapiSpec = JSON.parse(fs.readFileSync(new URL('../openapi.json', import.meta.url)));
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec));


app.use("/auth", authRouter);
app.use("/public", publicRouter);
app.use("/protected", protectedRouter);
app.use(errorHandler);
export default app;
