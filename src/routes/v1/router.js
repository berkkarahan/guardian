import express from "express";
import userRouter from "./v1_routes/user";
import companyRouter from "./v1_routes/company";

const v1Router = express.Router();

v1Router.use("/users", userRouter);
v1Router.use("/companies", companyRouter.company);
v1Router.use("/travelslots", companyRouter.travelslots);

export default v1Router;
