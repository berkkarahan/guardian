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
  passportConfig.authenticate,
  permissions.isadmin,
  companyCRUD.controllers.create
);
companyRouter.post(
  "/update",
  passportConfig.authenticate,
  permissions.isadmin,
  companyCRUD.controllers.update
);
companyRouter.post(
  "/remove",
  passportConfig.authenticate,
  permissions.isadmin,
  companyCRUD.controllers.delete
);

companyRouter.post(
  "/verify",
  passportConfig.authenticate,
  permissions.isadmin,
  company.verify.company
);

const travelslotsRouter = express.Router();
const travelslotsCRUD = initBase(db.models.travelslots);
// admin only routes
travelslotsRouter.post(
  "/create",
  passportConfig.authenticate,
  permissions.isadmin,
  travelslotsCRUD.controllers.create
);
travelslotsRouter.post(
  "/update",
  passportConfig.authenticate,
  permissions.isadmin,
  travelslotsCRUD.controllers.update
);
travelslotsRouter.post(
  "/remove",
  passportConfig.authenticate,
  permissions.isadmin,
  travelslotsCRUD.controllers.delete
);

travelslotsRouter.post(
  "/verify",
  passportConfig.authenticate,
  permissions.isadmin,
  company.verify.travelslot
);

export default {
  company: companyRouter,
  travelslots: travelslotsRouter
};
