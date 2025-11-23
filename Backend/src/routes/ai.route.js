import { Router } from "express";
import { getTrendingIdeas } from "../controllers/ai.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/trending", verifyJWT, getTrendingIdeas);

export default router;
