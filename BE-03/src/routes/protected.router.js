import express from "express";

const protectedRouter = express.Router();

protectedRouter.get("/profile", (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if(!token) {
            res.status(401).json({error: "Access token required"});
        }

    } catch(error) {
        console.log(error);
        next(error);
    }
})

export default protectedRouter;