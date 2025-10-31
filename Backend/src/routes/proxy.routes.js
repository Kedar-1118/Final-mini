import express from "express";
import { getImage } from "../controllers/proxy.controller.js";

const router = express.Router();

router.get("/image", getImage);

export default router;
