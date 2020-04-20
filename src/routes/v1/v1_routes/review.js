import express from "express";
import reviewController from "../../../controllers/review";
import jwtAuth from "../../../config/jwtAuth";

const reviewRouter = express.Router();

// Public route
reviewRouter.post("/all", reviewController.readMany);

// Auth required routes
reviewRouter.post("/create", jwtAuth.authVerified, reviewController.create);

reviewRouter.post(
  "/:subdoc/like/increase",
  reviewController.parameterChecker,
  jwtAuth.authVerified,
  reviewController.update.likes.increase
);

reviewRouter.post(
  "/:subdoc/dislike/increase",
  reviewController.parameterChecker,
  jwtAuth.authVerified,
  reviewController.update.dislikes.increase
);

reviewRouter.post(
  "/:subdoc/like/decrease",
  reviewController.parameterChecker,
  jwtAuth.authVerified,
  reviewController.update.likes.decrease
);

reviewRouter.post(
  "/:subdoc/dislike/decrease",
  reviewController.parameterChecker,
  jwtAuth.authVerified,
  reviewController.update.dislikes.decrease
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
