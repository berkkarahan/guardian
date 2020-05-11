import express from "express";
import integrity from "../../../controllers/integrity";

const integrityRouter = express.Router();

integrityRouter.post("/fix-all-ratings", integrity.averageRating.fixAll);

integrityRouter.post("/fix-all-titles", integrity.title.fixAll);

export default integrityRouter;
