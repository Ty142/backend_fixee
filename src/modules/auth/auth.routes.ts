import { Router } from "express";
import { AuthController } from "./auth.controller";
import { authenticate } from "../../middlewares/auth.middleware";

const router = Router();
const authController = new AuthController();

router.post("/login", authController.login.bind(authController));
router.post("/register", authController.register.bind(authController));
router.post("/refresh", authController.refresh.bind(authController));
router.post("/logout", authController.logout.bind(authController));
router.post(
  "/forgot-password",
  authController.forgotPassword.bind(authController),
);
router.post("/verify-otp", authController.verifyOtp.bind(authController));
router.post(
  "/reset-password",
  authController.resetPassword.bind(authController),
);
router.post(
  "/change-password",
  authenticate,
  authController.changePassword.bind(authController),
);

export default router;
