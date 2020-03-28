import express from "express";
import { initBase } from "../../../controllers/crud";
import company from "../../../controllers/company";
import db from "../../../db";
import permissions from "../../../utils/permissions";
import jwtAuth from "../../../config/jwtAuth";

const companyRouter = express.Router();
const companyCRUD = initBase(db.models.company);

// change passportConfig.isAuthenticated to passportConfig.utils.verified
// admin only routes
companyRouter.post(
  "/create",
  jwtAuth.authVerified,
  permissions.isadmin,
  company.create.company
);
companyRouter.post(
  "/update",
  jwtAuth.authVerified,
  permissions.isadmin,
  company.update.company
);
companyRouter.post(
  "/remove",
  jwtAuth.authVerified,
  permissions.isadmin,
  companyCRUD.controllers.delete
);

companyRouter.post(
  "/verify",
  jwtAuth.authVerified,
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
  jwtAuth.authVerified,
  company.create.travelslot
);
travelslotsRouter.post(
  "/update",
  jwtAuth.authVerified,
  permissions.isadmin,
  company.update.travelslot
);
travelslotsRouter.post(
  "/remove",
  jwtAuth.authVerified,
  permissions.isadmin,
  travelslotsCRUD.controllers.delete
);

travelslotsRouter.post(
  "/verify",
  jwtAuth.authVerified,
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
