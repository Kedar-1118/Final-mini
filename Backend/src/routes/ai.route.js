import { Router } from "express";
import { getTrendingIdeas, getRecommendations } from "../controllers/ai.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/trending", verifyJWT, getTrendingIdeas);
router.post("/recommendations", verifyJWT, getRecommendations);

export default router;
