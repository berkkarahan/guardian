import { initBase } from "../../../controllers/crud";
import company from "../../../controllers/company";
import db from "../../../db";

const companyCRUD = initBase(db.models.company);
const companyRouter = companyCRUD.router;

companyRouter.route("/verify").post(company.verify.company);

const travelslotsCRUD = initBase(db.models.travelslots);
const travelslotsRouter = travelslotsCRUD.router;

travelslotsRouter.route("/verify").post(company.verify.travelslot);

export default {
  company: companyRouter,
  travelslots: travelslotsRouter
};
