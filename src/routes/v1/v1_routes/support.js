import express from "express";
import supportController from "../../../controllers/support";

const supportRouter = express.Router();

supportRouter.post("/contact", supportController.send);

export default supportRouter;
