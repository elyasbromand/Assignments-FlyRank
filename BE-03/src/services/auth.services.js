import { NotFoundError, ValidationError, AuthenticationError } from "../errors.js";
import supabase from "../../db/db.js"

async function signUp(body) {
    try {

        const { email, password} = body;
        if(!email || email.trim() === "") {
            throw new ValidationError("Email is required");
        }
        if(!password || password.trim() === "") {
            throw new ValidationError("Password is required");
        }
        const { data, error } = await supabase.auth.signUp({
            email: email,
            password: password,
          })
        if(error) {
            console.log(error);
            throw new AuthenticationError(error.message);
        }
        console.log(data);
        return data.user;
    } catch (error) {
        throw new Error(error);
    }
}

async function login(body) {
    try{
        const {email, password} = body;
        if(!email || email.trim() === "") {
            throw new ValidationError("Email is required");
        }
        if(!password || password.trim() === "") {
            throw new ValidationError("Password is required");
        }
        const { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password,
          })
          if (error) {
            console.error(error)
            throw new AuthenticationError(error.message);
          }
          return data;
    } catch (error)
    {
       throw error; 
    }
}

export {signUp, login};