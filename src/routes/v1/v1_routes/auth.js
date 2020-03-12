import express from "express";
import passportConfig from "../../../config/passport";
import usersController from "../../../controllers/user";
import verificationController from "../../../controllers/verification";

const authRouter = express.Router();

authRouter.post("/preload", usersController.preload);
authRouter.post("/login", usersController.login);
authRouter.get("/logout", usersController.logout);
authRouter.post("/signup", usersController.create);

// Route to create and send(not yet implemented) verification token
authRouter.post(
  "/verification",
  passportConfig.isAuthenticated,
  verificationController.create
);

// Route with GET request to validate token from url.
authRouter.get("/verification", verificationController.validate);

export default authRouter;
