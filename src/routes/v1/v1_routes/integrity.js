import express from "express";
import integrity from "../../../controllers/integrity";

const integrityRouter = express.Router();

integrityRouter.post(
  "/update-average-ratings/company",
  integrity.averageRating.company
);

integrityRouter.post(
  "/update-average-ratings/travelslot",
  integrity.averageRating.travelslot
);

integrityRouter.post("/update-titles/company", integrity.title.company);

integrityRouter.post("/update-titles/travelslot", integrity.title.travelslot);

export default integrityRouter;
