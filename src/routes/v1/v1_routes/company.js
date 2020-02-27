import { initBase } from "../../../controllers/crud";
import company from "../../../controllers/company";
import db from "../../../db";

const companyCRUD = initBase(db.models.company);
const companyRouter = companyCRUD.router;

companyRouter.post("/verify", company.verify.company);

const travelslotsCRUD = initBase(db.models.travelslots);
const travelslotsRouter = travelslotsCRUD.router;

travelslotsRouter.post("/verify", company.verify.travelslot);

export default {
  company: companyRouter,
  travelslots: travelslotsRouter
};
