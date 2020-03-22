import express from "express";
import usersController from "../../../controllers/user";
import passportConfig from "../../../config/passport";

const userRouter = express.Router();

// Routes with session authentication
userRouter.get(
  "/profile",
  passportConfig.utils.verified,
  usersController.profile
);
userRouter.post("/details", passportConfig.utils.verified, usersController.get);
userRouter.post(
  "/update",
  passportConfig.utils.verified,
  usersController.update
);
userRouter.post(
  "/deactivate",
  passportConfig.utils.verified,
  usersController.deactivate
);

export default userRouter;
