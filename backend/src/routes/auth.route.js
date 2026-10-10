import express from "express";
import {
  register,
  login,
  refreshToken,
  getCurrentUser,
  logout,
  googleAuthCallback,
  changePassword,
  updateProfile,
  forgotPassword,
  resetPassword,
  updateAvatar,
  removeAvatar,
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { uploadAvatar } from "../middleware/multer.middleware.js";
import passport from "../config/passport.js";

const router = express.Router();

// Public Authentication
router.route("/register").post(uploadAvatar, register);
router.route("/login").post(login);
router.route("/refresh-token").post(refreshToken);

// Password Recovery
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:token").post(resetPassword);

// Protected Account Management
router.route("/current-user").get(protect, getCurrentUser);
router.route("/logout").post(protect, logout);
router.route("/change-password").put(protect, changePassword);
router.route("/update-profile").put(protect, updateProfile);
router.route("/avatar").put(protect, uploadAvatar, updateAvatar).delete(protect, removeAvatar);

// Google OAuth
router.route("/google").get(
  passport.authenticate("google", {
    scope: ["profile", "email"],
    session: false,
  })
);

router.route("/google/callback").get(
  passport.authenticate("google", {
    session: false,
    failureRedirect: `${process.env.CORS_ORIGIN || "http://localhost:5173"}/login?error=google_auth_failed`,
  }),
  googleAuthCallback
);

export default router;
