import express from "express";
import usersController from "../../../controllers/user";
import passportConfig from "../../../config/passport";

const userRouter = express.Router();

// Routes with session authentication
userRouter.post(
  "/details",
  passportConfig.isAuthenticated,
  usersController.get
);
userRouter.post(
  "/update",
  passportConfig.isAuthenticated,
  usersController.update
);
userRouter.post(
  "/deactivate",
  passportConfig.isAuthenticated,
  usersController.deactivate
);

export default userRouter;
