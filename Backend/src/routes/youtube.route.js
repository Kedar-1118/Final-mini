import { Router } from "express";
import {
  startYoutubeOAuth,
  handleYoutubeOAuthCallback,
  getYoutubeAnalytics,
  getYoutubeComments,
} from "../controllers/youtube.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/auth/youtube", verifyJWT, startYoutubeOAuth);
router.get("/auth/youtube/callback", handleYoutubeOAuthCallback);

router.get("/youtube/analytics", verifyJWT, getYoutubeAnalytics);
router.get("/youtube/comments", verifyJWT, getYoutubeComments);

export default router;
