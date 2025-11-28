import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import { apiLimiter } from "./middlewares/rateLimiter.js";

const app = express();

// Security Middleware
app.use(helmet());
app.use("/api", apiLimiter);

app.use(
  cors({
    origin: process.env.CORS_ORIGIN === "*" ? "http://localhost:5173" : process.env.CORS_ORIGIN || "http://localhost:5173",
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "16kb",
  })
);

app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// NOTE: express-mongo-sanitize removed due to Express 5 compatibility issues
// It conflicts with Express 5's req.query getter-only property
// Input validation is still enforced via express-validator in routes

// Import routes
import userRoutes from "./routes/user.route.js";
import youtubeRoutes from "./routes/youtube.route.js";
import instagramRoutes from "./routes/instagram.route.js";
import proxyRoutes from "./routes/proxy.routes.js";
import aiRoutes from "./routes/ai.route.js";

// Routes declaration
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/youtube", youtubeRoutes);
app.use("/api/v1/instagram", instagramRoutes);
app.use("/api/v1/proxy", proxyRoutes);
app.use("/api/v1/ai", aiRoutes);

import { errorHandler } from "./middlewares/errorHandler.middleware.js";
app.use(errorHandler);

export { app };