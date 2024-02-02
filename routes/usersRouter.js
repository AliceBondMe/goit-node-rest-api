import express from "express";
import {
  changeSubscriptionSchema,
  createUserSchema,
} from "../schemas/usersSchemas.js";
import {
  registerUser,
  loginUser,
  logoutUser,
  refreshUser,
  changeSubscription,
} from "../controllers/usersControllers.js";
import validateBody from "../middlewares/validateBody.js";
import authenticate from "../middlewares/authenticate.js";

const usersRouter = express.Router();

usersRouter.post("/register", validateBody(createUserSchema), registerUser);

usersRouter.post("/login", validateBody(createUserSchema), loginUser);

usersRouter.post("/logout", authenticate, logoutUser);

usersRouter.post("/current", authenticate, refreshUser);

usersRouter.patch(
  "/",
  authenticate,
  validateBody(changeSubscriptionSchema),
  changeSubscription
);

export default usersRouter;
