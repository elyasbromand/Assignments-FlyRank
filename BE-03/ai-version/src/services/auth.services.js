import { createClient } from "@supabase/supabase-js";
import supabase from "../../db/db.js";
import { ValidationError, AuthenticationError } from "../errors.js";

function validateCredentials(email, password) {
  if (!email?.trim()) {
    throw new ValidationError("Email is required");
  }
  if (!password?.trim()) {
    throw new ValidationError("Password is required");
  }
}

async function signUp({ email, password }) {
  validateCredentials(email, password);

  const { data, error } = await supabase.auth.signUp({
    email: email.trim(),
    password,
  });

  if (error) {
    throw new AuthenticationError(error.message);
  }

  return {
    user: data.user,
    session: data.session,
  };
}

async function signIn({ email, password }) {
  validateCredentials(email, password);

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim(),
    password,
  });

  if (error) {
    throw new AuthenticationError(error.message);
  }

  return {
    user: data.user,
    session: data.session,
  };
}

async function logout(accessToken) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;

  const userClient = createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  });

  const { error } = await userClient.auth.signOut();

  if (error) {
    throw new AuthenticationError(error.message);
  }

  return { message: "Logged out successfully" };
}

export { signUp, signIn, logout };
