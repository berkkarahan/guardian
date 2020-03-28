import express from "express";
import reviewStats from "../../../controllers/stats/review";
import jwtAuth from "../../../config/jwtAuth";

const statsRouter = express.Router();

const reviewStatsRouter = express.Router();

reviewStatsRouter.get("/count", jwtAuth.authVerified, reviewStats.count);

statsRouter.use("/review", reviewStatsRouter);

export default statsRouter;
