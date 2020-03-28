import express from "express";
import usersController from "../../../controllers/user";
import jwtAuth from "../../../config/jwtAuth";

const userRouter = express.Router();

// Routes with session authentication
userRouter.get("/profile", jwtAuth.authVerified, usersController.profile);
userRouter.get("/details", jwtAuth.authVerified, usersController.get);
userRouter.post("/update", jwtAuth.authVerified, usersController.update);
userRouter.post(
  "/deactivate",
  jwtAuth.authVerified,
  usersController.deactivate
);

export default userRouter;
