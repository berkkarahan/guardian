import express from "express";
import reviewController from "../../../controllers/review";
import jwtAuth from "../../../config/jwtAuth";

const reviewRouter = express.Router();

reviewRouter.post("/create", jwtAuth.authVerified, reviewController.create);

reviewRouter.post(
  "/:subdoc/like",
  reviewController.parameterChecker,
  jwtAuth.authVerified,
  reviewController.update.likes
);

reviewRouter.post(
  "/:subdoc/dislike",
  reviewController.parameterChecker,
  jwtAuth.authVerified,
  reviewController.update.dislikes
);

reviewRouter.post("/delete", jwtAuth.authVerified, reviewController.delete);

export default reviewRouter;
