import express from "express";
import passport from "passport";
import passportConfig from "../../../config/passport";
import usersController from "../../../controllers/user";
import tokensController from "../../../controllers/tokens";

const authRouter = express.Router();

authRouter.post("/preload", usersController.preload);
authRouter.post(
  "/login",
  passport.authenticate("local", { session: false }),
  usersController.loginHandler.jwt
);
authRouter.get("/logout", usersController.logout.jwt);
authRouter.post("/signup", usersController.create);

// Route to create and send(not yet implemented) verification token
authRouter.post(
  "/verification",
  passportConfig.utils.auth,
  tokensController.verification.create
);

// Route with GET request to validate token from url.
authRouter.get("/verification", tokensController.verification.validate);

// simple route to see if suthenticated
authRouter.get("/session", async (req, res, next) => {
  if (req.user) {
    res.status(200).send();
  } else {
    res.status(403).send();
  }
});

authRouter.get("/u", passportConfig.utils.verified, async (req, res, next) => {
  res.status(200).json({ message: "Verified user." });
});

export default authRouter;
