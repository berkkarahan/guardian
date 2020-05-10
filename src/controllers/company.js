import db from "../db";
import paginationUtils from "../utils/filters/utils";
import companyFilters from "../utils/filters/company";
import companyCommentFilters from "../utils/filters/companyComment";
import travelslotFilters from "../utils/filters/travelslot";
import travelslotHelpers from "./helpers/travelslots";
import companyHelpers from "./helpers/company";
import companyCommentHelpers from "./helpers/companyComments";
import tryCatch from "../utils/catcher";

const Company = db.models.company;
const Travelslots = db.models.travelslots;
const CompanyComment = db.models.companyComment;

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
  // req.body.filters is a must now
  const filterParameters = paginationUtils.parseParameters(req.body);
  if (!filterParameters.query) {
    const pageNumber = filterParameters.pageNumber || 1;
    const paginatedQuery = await paginationUtils.paginateQuery(
      Company.find(),
      10,
      pageNumber
    );
    const finalResponse = await companyHelpers.responseBuilders.company.all(
      await paginatedQuery.paginatedResponse.exec()
    );
    const modifiedHeaders = paginationUtils.setHeaders(paginatedQuery, res);
    return modifiedHeaders.status(200).json(finalResponse);
  }
  const { query, pagination } = req.body.filters;
  const { name } = query;
  if (!name) {
    return res
      .status(404)
      .json({ error: "Name parameter must exist if filtering companies." });
  }
  const queryObject = companyFilters.query(Company.find(), name);
  const paginatedQuery = await paginationUtils.paginateQuery(
    queryObject,
    pagination.pageNumber
  );
  const finalResponse = await companyHelpers.responseBuilders.company.all(
    await paginatedQuery.paginatedResponse.exec()
  );
  res.status(200).send(finalResponse);
});

const travelslotsReadMany = tryCatch(async (req, res, next) => {
  // req.body.filters is a must now
  const filterParameters = paginationUtils.parseParameters(req.body);
  if (!filterParameters.query) {
    const pageNumber = filterParameters.pageNumber || 1;
    const paginatedQuery = await paginationUtils.paginateQuery(
      Travelslots.find(),
      10,
      pageNumber
    );
    const jsonResponse = await travelslotHelpers.responseBuilders.travelslots.all(
      await paginatedQuery.paginatedResponse.exec()
    );
    const modifiedHeaders = paginationUtils.setHeaders(paginatedQuery, res);
    return modifiedHeaders.status(200).json(jsonResponse);
  }

  const { fromHour, fromCity } = filterParameters.query;
  if (!fromHour && !fromCity) {
    return res.status(404).json({
      error:
        "fromHour and fromCity parameters must exist if filtering travelslots."
    });
  }

  const queryObject = travelslotFilters.query(
    Travelslots.find(),
    travelslotFilters.parse(req.body.filters)
  );
  const paginatedQuery = await paginationUtils.paginateQuery(
    queryObject,
    10,
    filterParameters.pageNumber
  );
  const jsonResponse = await travelslotHelpers.responseBuilders.travelslots.all(
    await paginatedQuery.paginatedResponse.exec()
  );
  const modifiedHeaders = paginationUtils.setHeaders(paginatedQuery, res);
  modifiedHeaders.status(200).json(jsonResponse);
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

// auth verified controller
const createComment = tryCatch(async (req, res, next) => {
  const { commentBody, companyUUID } = req.body;
  const { user } = req;
  if (!user) {
    return res.status(403).json({ message: "Authentication failed." });
  }
  if (!companyUUID) {
    return res.status(403).json({ message: "Company uuid missing." });
  }
  const company = await Company.findOne({ uuid: companyUUID });
  const newComment = new CompanyComment();
  await newComment.createNewComment(commentBody, company, user);
  res.status(200).json({ companyCommentUUID: newComment.uuid });
});

// public controller
const commentReadMany = tryCatch(async (req, res, next) => {
  // const { companyUUID, pageNumber } = req.body.filters;
  const filterParameters = paginationUtils.parseParameters(req.body);
  const pageNumber = filterParameters.pageNumber || 1;
  const requestUser = req.user;
  let companyUUID;
  try {
    companyUUID = filterParameters.query.companyUUID;
  } catch (e) {
    return res.status(403).json({ message: "Company uuid missing.", error: e });
  }

  const company = await Company.findOne({ uuid: companyUUID });
  const companyID = company ? company._id : undefined;

  const queryObject = companyCommentFilters.query(
    CompanyComment.find(),
    companyID
  );
  const paginatedQuery = await paginationUtils.paginateQuery(
    queryObject,
    10,
    pageNumber
  );
  const jsonResponse = await companyCommentHelpers.responseBuilders.companyComment.all(
    await paginatedQuery.paginatedResponse.exec(),
    requestUser
  );
  const modifiedHeaders = paginationUtils.setHeaders(paginatedQuery, res);
  modifiedHeaders.status(200).json(jsonResponse);
});

// auth verified controller
const updateCompanyComment = tryCatch(async (req, res, next) => {
  const { commentBody, commentUUID } = req.body;
  if (!commentUUID) {
    return res.status(403).json({ message: "CompanyComment uuid missing." });
  }
  const companyComment = await CompanyComment.findOne({ uuid: commentUUID });
  companyComment.comment = commentBody;
  await companyComment.save();
  res.status(200).send();
});

// auth verified controller
const deleteCompanyComment = tryCatch(async (req, res, next) => {
  const { commentUUID } = req.body;
  if (!commentUUID) {
    return res.status(403).json({ message: "CompanyComment uuid missing." });
  }
  await CompanyComment.findOneAndDelete({ uuid: commentUUID });
  res.status(200).send();
});

export default {
  getByUUID: { travelslot: getTravelslot, company: getCompany },
  readMany: {
    travelslot: travelslotsReadMany,
    company: companyReadMany,
    companyComment: commentReadMany
  },
  verify: { travelslot: verifyTravelslot, company: verifyCompany },
  create: {
    travelslot: travelslotsCreate,
    company: companyCreate,
    companyComment: createComment
  },
  update: {
    travelslot: travelslotsUpdate,
    company: companyUpdate,
    companyComment: updateCompanyComment
  },
  delete: { companyComment: deleteCompanyComment },
  top10: { company: top10Companies, travelslot: top10TravelslotsbyCompany }
};
