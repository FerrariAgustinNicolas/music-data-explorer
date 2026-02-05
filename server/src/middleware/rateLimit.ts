import type { RequestHandler } from "express";

interface RateEntry {
  count: number;
  resetAt: number;
}

const requests = new Map<string, RateEntry>();

export const rateLimit = (options: { windowMs: number; max: number }): RequestHandler => {
  return (req, res, next) => {
    const ip = req.ip || req.headers["x-forwarded-for"]?.toString() || "unknown";
    const now = Date.now();
    const existing = requests.get(ip);

    if (!existing || now > existing.resetAt) {
      requests.set(ip, { count: 1, resetAt: now + options.windowMs });
      return next();
    }

    if (existing.count >= options.max) {
      res.status(429).json({ error: { message: "Rate limit exceeded", code: "RATE_LIMIT" } });
      return;
    }

    existing.count += 1;
    next();
  };
};
