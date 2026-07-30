import supabase from "../../db/db.js";

export default async function validateUser(req, res, next) {
    try{
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];
        if(!token) {
            res.status(401).json({error: "Access token required"});
        }
        const { data: { user } } = await supabase.auth.getUser(token)
        if(!user) {
            res.status(401).json({error: "Invalid or expired token"});
        }
        
        req.user = user;
        next();
    } catch (error) {
        throw error;
    }
}