import express from "express";
import {signUp, login} from "../services/auth.services.js"

const authRouter = express.Router();

authRouter.post("/signup", async(req, res, next) => {
    try {
        const user = await signUp(req.body);
        if(!user) {
            throw new Error("Failed to sign up");
        }
        res.status(201).json(user);
    } catch (error) {
        console.log(error);
        next(error);
    }
});
authRouter.post("/login", async(req, res, next) => {
    try {
        const user = await login(req.body);
        if(!user) {
            throw new Error("Failed to login");
        }
        res.status(200).json(user);
    } catch (error) {
        console.log(error);
        next(error);
    }
})

export default authRouter;