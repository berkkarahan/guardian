import express from "express";
import reviewStats from "../../../controllers/stats/review";
import companyStats from "../../../controllers/stats/company";
import jwtAuth from "../../../config/jwtAuth";

const statsRouter = express.Router();

const reviewStatsRouter = express.Router();
const companyStatsRouter = express.Router();
const travelslotStatsRouter = express.Router();

// review stats
reviewStatsRouter.get("/count", jwtAuth.authVerified, reviewStats.count);
reviewStatsRouter.post("/average-rating", reviewStats.average);

// company stats
companyStatsRouter.post("/average-rating", companyStats.average.company);
companyStatsRouter.post("/review-counts", companyStats.reviewCounts.company);

// travelslot stats
travelslotStatsRouter.post("/average-rating", companyStats.average.travelslot);
companyStatsRouter.post("/review-counts", companyStats.reviewCounts.travelslot);

statsRouter.use("/review", reviewStatsRouter);
statsRouter.use("/company", companyStatsRouter);
statsRouter.use("/travelslot", companyStatsRouter);

export default statsRouter;
