import db from "../db";
import companyFilters from "../utils/filters/company";
import travelslotFilters from "../utils/filters/travelslot";
import travelslotHelpers from "./helpers/travelslots";
import companyHelpers from "./helpers/company";
import tryCatch from "../utils/catcher";
import paginate_v2 from "../utils/filters/pagination";

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
  // req.body.filters is a must even if empty now.
  if (!req.body.filters.query) {
    const pageNumber = req.body.filters.pageNumber || 1;
    const paginated = await paginate_v2.paginate(Company, {}, pageNumber);
    const modifiedResponse = paginate_v2.setHeaders(paginated, res);
    const finalResponse = await companyHelpers.responseBuilders.company.all(
      paginated.response
    );
    return modifiedResponse.status(200).send(finalResponse);
  }
  const { query, pageNumber } = req.body.filters;
  const adjPageNumber = pageNumber || 1;
  const { name } = query;
  if (!name) {
    return res
      .status(404)
      .json({ error: "Name parameter must exist if filtering companies." });
  }

  const queryJson = companyFilters.queryJson(name);

  const paginated = await paginate_v2.paginate(
    Company,
    queryJson,
    adjPageNumber
  );

  const finalResponse = await companyHelpers.responseBuilders.company.all(
    paginated.response
  );

  const modifiedResponse = paginate_v2.setHeaders(paginated, res);
  modifiedResponse.status(200).send(finalResponse);
});

const travelslotsReadMany = tryCatch(async (req, res, next) => {
  // req.body.filters is a must even if empty now.
  if (!req.body.filters.query) {
    const records = await Travelslots.find();
    const jsonResponse = await travelslotHelpers.responseBuilders.travelslots.all(
      records
    );
    return res.status(200).json(jsonResponse);
  }
  const { query, pageNumber } = req.body.filters;
  const adjPageNumber = pageNumber || 1;
  const { fromHour, fromCity } = query;
  if (!fromHour && !fromCity) {
    return res.status(404).json({
      error:
        "fromHour and fromCity parameters must exist if filtering travelslots."
    });
  }

  const queryJson = travelslotFilters.queryJson(
    travelslotFilters.parse(req.body.filters)
  );

  const paginated = await paginate_v2.paginate(
    Travelslots,
    queryJson,
    adjPageNumber
  );

  const jsonResponse = await travelslotHelpers.responseBuilders.travelslots.all(
    paginated.response
  );

  const modifiedResponse = paginate_v2.setHeaders(paginated, res);
  modifiedResponse.status(200).json(jsonResponse);
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

const top10Companies = tryCatch(async (req, res, next) => {
  const top10 = await Company.find(
    {},
    {
      limit: 10,
      sort: {
        averageRating: -1
      }
    }
  );
  res.status(200).json(top10);
});

const top10TravelslotsbyCompany = tryCatch(async (req, res, next) => {
  const { companyUUID } = req.params;
  const company = await Company.findOne({ uuid: companyUUID });
  const top10 = await Travelslots.find(
    { company: company._id },
    {
      limit: 10,
      sort: {
        averageRating: -1
      }
    }
  );
  res.status(200).json(top10);
});

export default {
  getByUUID: { travelslot: getTravelslot, company: getCompany },
  readMany: { travelslot: travelslotsReadMany, company: companyReadMany },
  verify: { travelslot: verifyTravelslot, company: verifyCompany },
  create: { travelslot: travelslotsCreate, company: companyCreate },
  update: { travelslot: travelslotsUpdate, company: companyUpdate },
  top10: { company: top10Companies, travelslot: top10TravelslotsbyCompany }
};
