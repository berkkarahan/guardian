import express from "express";
import usersController from "../../../controllers/user";
import passportConfig from "../../../config/passport";

const authenticateSession = passportConfig.authenticate;
const userRouter = express.Router();

// Routes withot session authentication
userRouter.route("/preload").post(usersController.preload);
userRouter.route("/login").post(usersController.login);
userRouter.route("/signup").post(usersController.create);

// Routes with session authentication
userRouter.route("/details").post(authenticateSession, usersController.get);

userRouter.route("/update").post(authenticateSession, usersController.update);

userRouter
  .route("/deactivate")
  .post(authenticateSession, usersController.deactivate);

export default userRouter;
