import type { ErrorRequestHandler } from "express";
import { AppError } from "../utils/errors.js";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: { message: err.message, code: err.code } });
    return;
  }

  console.error("Unhandled error:", err);
  res.status(500).json({ error: { message: "Internal server error", code: "INTERNAL_ERROR" } });
};
