import express from "express";
import userRouter from "./v1_routes/user";
import companyRouter from "./v1_routes/company";
import authRouter from "./v1_routes/auth";
import statsRouter from "./v1_routes/stats";

const v1Router = express.Router();

v1Router.use("/auth", authRouter);
v1Router.use("/users", userRouter);
v1Router.use("/companies", companyRouter.company);
v1Router.use("/travelslots", companyRouter.travelslots);
v1Router.use("/stats", statsRouter);

export default v1Router;
