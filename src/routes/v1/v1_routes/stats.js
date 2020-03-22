import express from "express";
import reviewStats from "../../../controllers/stats/review";
import passportConfig from "../../../config/passport";

const statsRouter = express.Router();

const reviewStatsRouter = express.Router();

reviewStatsRouter.get(
  "/count",
  passportConfig.utils.verified,
  reviewStats.count
);

statsRouter.use("/review", reviewStatsRouter);

export default statsRouter;
