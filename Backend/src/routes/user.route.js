import { Router } from "express";
import { registerUser, loginUser, verifyEmail, logoutUser, resendVerificationOTP, getCurrentUser, updateAccountDetails, forgotPassword, resetPassword } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/verify-otp").post(verifyEmail);
router.route("/resend-otp").post(resendVerificationOTP);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password").post(resetPassword);

// Secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/current-user").get(verifyJWT, getCurrentUser);
router.route("/update-account").patch(verifyJWT, updateAccountDetails);

export default router;
