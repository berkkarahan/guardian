import db from "../db";
import paginateQuery from "../utils/filters/utils";
import companyFilters from "../utils/filters/company";
import travelslotFilters from "../utils/filters/travelslot";
import tryCatch from "../utils/catcher";

const Company = db.models.company;
const Travelslots = db.models.travelslots;

const getByUUID = async (Collection, req, res, next) => {
  const { resourceUUID } = req.params;
  const record = await Collection.findOne({ uuid: resourceUUID });
  res.status(200).json(record);
};

const getCompany = tryCatch(async (req, res, next) => {
  await getByUUID(Company, req, res, next);
});

const getTravelslot = tryCatch(async (req, res, next) => {
  await getByUUID(Travelslots, req, res, next);
});

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

const companyReadMany = tryCatch(async (req, res, next) => {
  // return all if no filters given
  if (!req.body.filters) {
    const records = await Company.find();
    // combine
    const finalResponse = await Promise.all(
      records.map(async rec => {
        const r = { ...rec.toJSON() };
        r.reviewCount = await rec.calculateReviewCounts();
        r.calculatedAverageRating = await rec.calculateAverageRating();
        return r;
      })
    );
    return res.status(200).send(finalResponse);
  }
  const { query, pagination } = req.body.filters;
  const { name } = query;
  if (!name) {
    return res
      .status(404)
      .json({ error: "Name parameter must exist if filtering companies." });
  }
  const queryObject = companyFilters.query(Company.find(), name);
  const paginatedQuery = paginateQuery(queryObject, pagination.pageNumber);
  const records = await paginatedQuery.exec();

  // combine
  const finalResponse = await Promise.all(
    records.map(async rec => {
      const r = { ...rec.toJSON() };
      r.reviewCount = await rec.calculateReviewCounts();
      r.averageCount = await rec.calculateAverageRating();
      return r;
    })
  );
  res.status(200).send(finalResponse);
});

const travelslotsReadMany = tryCatch(async (req, res, next) => {
  if (!req.body.filters) {
    const records = await Travelslots.find();
    return res.status(200).json(records);
  }
  const { query, pagination } = req.body.filters;
  const { fromHour } = query;
  if (!fromHour) {
    return res.status(404).json({
      error: "fromHour parameter must exist if filtering travelslots."
    });
  }

  const queryObject = travelslotFilters.query(
    Travelslots.find(),
    travelslotFilters.parse(req.body.filters)
  );
  const paginatedQuery = paginateQuery(queryObject, pagination.pageNumber);
  const response = await paginatedQuery.exec();
  res.status(200).json(response);
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
  getByUUID: { travelslot: getTravelslot, company: getCompany },
  readMany: { travelslot: travelslotsReadMany, company: companyReadMany },
  verify: { travelslot: verifyTravelslot, company: verifyCompany },
  create: { travelslot: travelslotsCreate, company: companyCreate },
  update: { travelslot: travelslotsUpdate, company: companyUpdate }
};
