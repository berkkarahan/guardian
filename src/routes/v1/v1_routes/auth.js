import express from "express";
import passport from "passport";
import usersController from "../../../controllers/user";
import verificationController from "../../../controllers/verification";

const localAuthenticate = async (req, res, next) => {
  await passport.authenticate("local", { session: false }, async function(
    err,
    user,
    info
  ) {
    if (err) {
      return await next(err);
    }
    if (user) {
      req.user = user;
      return await next();
    }
    return await res.status(422).json(info);
  })(req, res, next);
};

const authRouter = express.Router();

// Routes without authentication
authRouter.post("/preload", usersController.preload);
authRouter.post("/login", usersController.login);
authRouter.post("/logout", usersController.logout);
authRouter.post("/signup", usersController.create);

// Route to create and send(not yet implemented) verification token
authRouter.post(
  "/verification",
  localAuthenticate,
  verificationController.create
);

// Route with GET request to validate token from url.
authRouter.get("/verification", verificationController.validate);

export default authRouter;
