import express from "express";
import {
  getUserData,
  getUserComments,
  getInstagramCommentSentiment,
} from "../controllers/instagram.controller.js";

const router = express.Router();

router.get("/user/:username", getUserData);
router.get("/user/:username/comments", getUserComments);
router.get("/user/:username/sentiment", getInstagramCommentSentiment);

export default router;
