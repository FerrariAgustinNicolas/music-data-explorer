import express from "express";
import cors from "cors";
import apiRoutes from "./routes/api";
import { rateLimit } from "./middleware/rateLimit";
import { errorHandler } from "./middleware/errorHandler";

export const createApp = () => {
  const app = express();

  app.use(cors());
  app.use(express.json());
  app.use(rateLimit({ windowMs: 60_000, max: 60 }));

  app.use("/api", apiRoutes);

  app.use(errorHandler);
  return app;
};
