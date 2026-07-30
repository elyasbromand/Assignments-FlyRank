import { NotFoundError, ValidationError, AuthenticationError } from "../errors.js";
import supabase from "../../db/db.js";

async function validateUser(token) {
    try{
        const { data: { user } } = await supabase.auth.getUser(token)
        if(!user) {
            return null;
        }
        return user;
    } catch (error) {
        throw error;
    }
}

export default validateUser;