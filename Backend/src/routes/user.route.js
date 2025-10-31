import { Router } from "express";
import { registerUser, loginUser, verifyEmail, logoutUser, resendVerificationOTP } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/verify-otp").post(verifyEmail);
router.route("/resend-otp").post(resendVerificationOTP);

// Secured routes
router.route("/logout").post(verifyJWT, logoutUser);

export default router;
