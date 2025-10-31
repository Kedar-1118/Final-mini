import express from "express";
import {
  addUsername,
  refreshUserData,
  getUserData,
  getUserComments,
} from "../controllers/instagram.controller.js";

const router = express.Router();

router.post("/add", addUsername);
router.put("/refresh/:username", refreshUserData);
router.get("/user/:username", getUserData);
router.get("/comments/:username", getUserComments);

export default router;
