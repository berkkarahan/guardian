import db from "../db";

const Company = db.models.company;
const Travelslots = db.models.travelslots;

const verifyCompany = async (req, res, next) => {
  Company.findByIdAndUpdate(
    { _id: req.body.companyID },
    { recordVerified: true }
  );
};

const verifyTravelslot = async (req, res, next) => {
  Travelslots.findByIdAndUpdate(
    { _id: req.body.travelslotID },
    { recordVerified: true }
  );
};

export default {
  verify: { travelslot: verifyTravelslot, company: verifyCompany }
};
