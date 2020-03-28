import express from "express";
import passport from "passport";
import usersController from "../../../controllers/user";
import authController from "../../../controllers/auth";
import tokensController from "../../../controllers/tokens";
import jwtAuth from "../../../config/jwtAuth";

const authRouter = express.Router();

authRouter.post("/preload", usersController.preload);
authRouter.post(
  "/login",
  passport.authenticate("local", { session: false }),
  authController.loginHandler.jwt
);
authRouter.get("/logout", authController.logout.jwt);
authRouter.post("/signup", usersController.create);

// Route to create and send(not yet implemented) verification token
authRouter.post(
  "/verification",
  jwtAuth.authRequired,
  tokensController.verification.create
);

// Route with GET request to validate token from url.
authRouter.get("/verification", tokensController.verification.validate);

// simple route to see if suthenticated
const checkSession = async (req, res, next) => {
  if (req.user) {
    res.status(200).send();
  } else {
    res.status(403).send();
  }
};
authRouter.get("/session", jwtAuth.authVerified, checkSession);

export default authRouter;
