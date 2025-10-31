import { Router } from "express";
import {
  startYoutubeOAuth,
  handleYoutubeOAuthCallback,
  getYoutubeAnalytics,
  getYoutubeComments,
} from "../controllers/youtube.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/auth", startYoutubeOAuth);
router.get("/callback", handleYoutubeOAuthCallback);

router.get("/analytics", verifyJWT, getYoutubeAnalytics);
router.get("/comments", verifyJWT, getYoutubeComments);

export default router;
