import supabase from "../../db/db.js";
import { AuthenticationError } from "../errors.js";

function extractBearerToken(req) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.slice(7).trim();
}

export default async function authMiddleware(req, res, next) {
  try {
    const token = extractBearerToken(req);

    if (!token) {
      throw new AuthenticationError("Access token required");
    }

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      throw new AuthenticationError("Invalid or expired token");
    }

    req.user = data.user;
    req.accessToken = token;
    next();
  } catch (error) {
    next(error);
  }
}
