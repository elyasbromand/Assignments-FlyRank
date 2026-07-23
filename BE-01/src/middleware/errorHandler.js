import { NotFoundError, ValidationError } from "../errors";

export default function errorHandler(err, req, res, next) {
  if (err instanceof NotFoundError) {
    return res.status(404).json({ error: err.message });
  }

  if (err instanceof ValidationError) {
    return res.status(400).json({ error: err.message });
  }

  // Fallback: log and return 500
  console.error(err);
  return res.status(500).json({ error: "Internal Server Error" });
}
