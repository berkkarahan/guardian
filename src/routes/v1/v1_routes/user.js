import express from "express";
import usersController from "../../../controllers/user";
import passportConfig from "../../../config/passport";

const authenticateSession = passportConfig.authenticate;
const userRouter = express.Router();

// Routes withot session authentication
userRouter.post("/preload", usersController.preload);
userRouter.post("/login", usersController.login);
userRouter.post("/signup", usersController.create);

// Routes with session authentication
userRouter.post("/details", authenticateSession, usersController.get);

userRouter.post("/update", authenticateSession, usersController.update);

userRouter.post("/deactivate", authenticateSession, usersController.deactivate);

export default userRouter;
