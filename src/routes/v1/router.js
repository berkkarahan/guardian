import express from "express";
import userRouter from "./v1_routes/user";
import companyRouter from "./v1_routes/company";

const v1Router = express.Router();

v1Router.use("/users", userRouter);
v1Router.use("/companies", companyRouter.company);
v1Router.use("/travelslots", companyRouter.travelslots);

v1Router.get("/sanity", async (req, res) => {
  res.json({ message: "pass!" });
});

export default v1Router;
