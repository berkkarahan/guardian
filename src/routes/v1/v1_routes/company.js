import express from "express";
import { initBase } from "../../../controllers/crud";
import company from "../../../controllers/company";
import db from "../../../db";
import permissions from "../../../utils/permissions";
import passportConfig from "../../../config/passport";

const companyRouter = express.Router();
const companyCRUD = initBase(db.models.company);

// admin only routes
companyRouter.post(
  "/create",
  passportConfig.isAuthenticated,
  permissions.isadmin,
  company.create.company
);
companyRouter.post(
  "/update",
  passportConfig.isAuthenticated,
  permissions.isadmin,
  company.update.company
);
companyRouter.post(
  "/remove",
  passportConfig.isAuthenticated,
  permissions.isadmin,
  companyCRUD.controllers.delete
);

companyRouter.post(
  "/verify",
  passportConfig.isAuthenticated,
  permissions.isadmin,
  company.verify.company
);

// public routes
companyRouter.post("/", companyCRUD.controllers.selectOne);
companyRouter.post("/all", company.readMany.company);

const travelslotsRouter = express.Router();
const travelslotsCRUD = initBase(db.models.travelslots);

// admin only routes
// travelSlot creatin is not admin only but will still require verification.
travelslotsRouter.post(
  "/create",
  passportConfig.isAuthenticated,
  company.create.travelslot
);
travelslotsRouter.post(
  "/update",
  passportConfig.isAuthenticated,
  permissions.isadmin,
  company.update.travelslot
);
travelslotsRouter.post(
  "/remove",
  passportConfig.isAuthenticated,
  permissions.isadmin,
  travelslotsCRUD.controllers.delete
);

travelslotsRouter.post(
  "/verify",
  passportConfig.isAuthenticated,
  permissions.isadmin,
  company.verify.travelslot
);

// logged in routes
travelslotsRouter.post("/", travelslotsCRUD.controllers.selectOne);
travelslotsRouter.post("/all", company.readMany.travelslot);

export default {
  company: companyRouter,
  travelslots: travelslotsRouter
};
