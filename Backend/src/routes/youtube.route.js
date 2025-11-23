import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import {
  startYoutubeOAuth,
  handleYoutubeOAuthCallback,
  getYoutubeAnalytics,
  getYoutubeComments,
  getYoutubeVideos,
  uploadYoutubeVideo,
  updateYoutubeVideo,
  getChannelDetails,
} from "../controllers/youtube.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Setup upload directory
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// OAuth routes
router.get("/auth", verifyJWT, startYoutubeOAuth);
router.get("/callback", handleYoutubeOAuthCallback);

// Analytics routes
router.get("/analytics", verifyJWT, getYoutubeAnalytics);
router.get("/comments", verifyJWT, getYoutubeComments);
router.get("/channel", verifyJWT, getChannelDetails);

// Video management routes
router.get("/videos", verifyJWT, getYoutubeVideos);
router.post("/upload", verifyJWT, upload.single("videoFile"), uploadYoutubeVideo);
router.put("/videos/:id", verifyJWT, updateYoutubeVideo);

export default router;

