import express from "express";
import validateUser from "../middleware/validate.middleware.js";

const protectedRouter = express.Router();

protectedRouter.get("/profile", validateUser,  (req, res, next) => {
    try {
        const user = req.user;
        res.status(200).json({id: user.id, email: user.email, account_created_date: user.confirmed_at});
    } catch(error) {
        console.log(error);
        next(error);
    }
})

protectedRouter.get("/dashboard", validateUser, (req, res, next) => {
    try {
        const user = req.user;
        res.status(200).json({id: user.id, email: user.email, account_created_date: user.confirmed_at});
    } catch(error) {
        console.log(error);
        next(error);
    }
})

export default protectedRouter;