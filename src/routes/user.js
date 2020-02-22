import express from "express";
import usersController from "../controllers/user";
import passportConfig from "../config/passport";

const authenticateSession = passportConfig.authenticate;
const userRouter = express.Router();

// Routes withot session authentication
userRouter.route("/get-user").post(usersController.preload);
userRouter.post("/login-user", usersController.login);
userRouter.post("/signup-user", usersController.create);

// Routes with session authentication
userRouter
  .route("/get-user-details")
  .post(authenticateSession, usersController.get);

userRouter
  .route("/update-user")
  .post(authenticateSession, usersController.update);

userRouter
  .route("/deactivate-user")
  .post(authenticateSession, usersController.deactivateUser);

export default userRouter;
