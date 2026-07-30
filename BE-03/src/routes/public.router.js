import express from "express";

const publicRouter = express.Router();

publicRouter.get("/info", (req, res, next)=>{
    try {
        res.status(200).json({message:"Welcome stranger! This info is public."});
    } catch (error) {
        console.log(error);
        next(error);
    }
})

export default publicRouter;