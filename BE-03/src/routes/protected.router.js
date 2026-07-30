import express from "express";
import validateUser from "../services/validate.services.js"

const protectedRouter = express.Router();

protectedRouter.get("/profile", async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if(!token) {
            res.status(401).json({error: "Access token required"});
        }
        const user = await validateUser(token);
        if(!user) {
            res.status(401).json({error: "Invalid or expired token"});
        }
        res.status(200).json({id: user.id, email: user.email, account_created_date: user.confirmed_at});

    } catch(error) {
        console.log(error);
        next(error);
    }
})

export default protectedRouter;