import express from "express";
import {signUp, login, logout} from "../services/auth.services.js"
import validateUser from "../middleware/validate.middleware.js";

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
authRouter.post("/logout", validateUser,async(req, res, next) => {
    try{
        const success = await logout();
        if(!success) {
            throw new Error("Failed to logout");
        }
        console.log(success)
        res.status(204).json({message: "Logged out successfully"});
    } catch(error) {
        console.log(error);
        next(error);
    }
})

export default authRouter;