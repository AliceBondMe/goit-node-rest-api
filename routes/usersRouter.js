import express from "express";
import {
  changeSubscriptionSchema,
  createUserSchema,
  verificationSchema,
} from "../schemas/usersSchemas.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshUser,
  changeSubscription,
  changeAvatar,
  verifyUser,
  resendVerify,
} from "../controllers/usersControllers.js";
import validateBody from "../middlewares/validateBody.js";
import authenticate from "../middlewares/authenticate.js";
import upload from "../middlewares/upload.js";

const usersRouter = express.Router();

usersRouter.post("/register", validateBody(createUserSchema), registerUser);

usersRouter.get("/verify/:verificationToken", verifyUser);

usersRouter.post("/verify", validateBody(verificationSchema), resendVerify);

usersRouter.post("/login", validateBody(createUserSchema), loginUser);

usersRouter.post("/logout", authenticate, logoutUser);

usersRouter.post("/current", authenticate, refreshUser);

usersRouter.patch(
  "/",
  authenticate,
  validateBody(changeSubscriptionSchema),
  changeSubscription
);

usersRouter.patch(
  "/avatars",
  authenticate,
  upload.single("avatarURL"),
  changeAvatar
);

export default usersRouter;
