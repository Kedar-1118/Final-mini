import express from "express";
import {
  getUserData,
  getUserComments,
} from "../controllers/instagram.controller.js";

const router = express.Router();

router.get("/user/:username", getUserData);
router.get("/comments/:username", getUserComments);

export default router;
