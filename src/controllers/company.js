import db from "../db";
import filterParser from "../utils/filters";
import tryCatch from "../utils/catcher";

const Company = db.models.company;
const Travelslots = db.models.travelslots;

const verifyCompany = tryCatch(async (req, res, next) => {
  Company.findByIdAndUpdate(
    { _id: req.body.companyID },
    { recordVerified: true }
  );
  res.status(200).send();
});

const verifyTravelslot = tryCatch(async (req, res, next) => {
  Travelslots.findByIdAndUpdate(
    { _id: req.body.travelslotID },
    { recordVerified: true }
  );
  res.status(200).send();
});

// Needs pagination, limiting or skipping.
const customReadMany = async (Collection, req, res, next) => {
  const { filters } = req.body;
  const parsedFilters = filterParser.parse(filters);
  const queryObject = filterParser.query(Collection.find(), parsedFilters);
  const records = await queryObject.exec();
  await res.status(200).json(records);
};

const companyReadMany = tryCatch(async (req, res, next) => {
  await customReadMany(Company, req, res, next);
});

const travelslotsReadMany = tryCatch(async (req, res, next) => {
  await customReadMany(Company, req, res, next);
});

const customCreate = async (Collection, req, res, next) => {
  const newCollection = new Collection(req.body);
  newCollection.createdBy = req.user;
  await newCollection.save();
  res.status(201).send(newCollection);
};

const travelslotsCreate = tryCatch(async (req, res, next) => {
  await customCreate(Travelslots, req, res, next);
});

const companyCreate = tryCatch(async (req, res, next) => {
  await customCreate(Company, req, res, next);
});

const updateSetVerifiedFalse = tryCatch(async (Collection, req, res, next) => {
  const changedEntry = req.body;
  changedEntry.recordVerified = false;
  await Collection.update({ _id: req.body.id }, { $set: changedEntry }, e => {
    if (e) res.sendStatus(500);
    else res.sendStatus(200);
  });
});

const travelslotsUpdate = tryCatch(async (req, res, next) => {
  await updateSetVerifiedFalse(Travelslots, req, res, next);
});

const companyUpdate = tryCatch(async (req, res, next) => {
  await updateSetVerifiedFalse(Company, req, res, next);
});

export default {
  readMany: { travelslot: travelslotsReadMany, company: companyReadMany },
  verify: { travelslot: verifyTravelslot, company: verifyCompany },
  create: { travelslot: travelslotsCreate, company: companyCreate },
  update: { travelslot: travelslotsUpdate, company: companyUpdate }
};
