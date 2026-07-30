import {
  NotFoundError,
  ValidationError,
  AuthenticationError,
  AuthorizationError,
} from "../errors.js";

export default function errorHandler(err, req, res, next) {
  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: err.message });
  }

  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.message });
  }

  if (err instanceof AuthenticationError) {
    return res.status(401).json({ error: err.message });
  }

  if (err instanceof AuthorizationError) {
    return res.status(403).json({ error: err.message });
  }

  console.error(err);
  return res.status(500).json({ error: "Internal Server Error" });
}
