import express from "express";
import reviewController from "../../../controllers/review";
import passportConfig from "../../../config/passport";

const reviewRouter = express.Router();

reviewRouter.post(
  "/create",
  passportConfig.utils.verified,
  reviewController.create
);

reviewRouter.post(
  "/:subdoc/like",
  reviewController.parameterChecker,
  passportConfig.utils.verified,
  reviewController.update.likes
);

reviewRouter.post(
  "/:subdoc/dislike",
  reviewController.parameterChecker,
  passportConfig.utils.verified,
  reviewController.update.dislikes
);

reviewRouter.post(
  "/delete",
  passportConfig.utils.verified,
  reviewController.delete
);

export default reviewRouter;
