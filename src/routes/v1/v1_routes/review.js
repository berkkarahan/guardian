import express from "express";
import reviewController from "../../../controllers/review";
import jwtAuth from "../../../config/jwtAuth";

const reviewRouter = express.Router();

// Public route
reviewRouter.post("/all", reviewController.readMany);

// Auth required routes
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

reviewRouter.post(
  "/:subdoc/update",
  reviewController.parameterChecker,
  jwtAuth.authVerified,
  reviewController.update.subdoc
);

reviewRouter.post(
  "/:subdoc/delete",
  reviewController.parameterChecker,
  jwtAuth.authVerified,
  reviewController.delete.subdoc
);

reviewRouter.post(
  "/delete",
  jwtAuth.authVerified,
  reviewController.delete.review
);

export default reviewRouter;
