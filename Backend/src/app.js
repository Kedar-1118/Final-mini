import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
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

// Import routes
import userRoutes from "./routes/user.route.js";
import linkedAccountsRoutes from "./routes/linkedAccounts.route.js";
import youtubeRoutes from "./routes/youtube.route.js";
import instagramRoutes from "./routes/instagram.route.js";

// Routes declaration
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/linked-accounts", linkedAccountsRoutes);
app.use("/api/v1/youtube", youtubeRoutes);
app.use("/api/v1/instagram", instagramRoutes);


export { app };