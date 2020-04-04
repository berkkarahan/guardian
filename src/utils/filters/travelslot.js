import { mod } from "mathjs";

const parseFilters = reqFiltersQuery => {
  const { fromHour, timeBetween } = reqFiltersQuery;
  let timeHorizon;
  if (!timeBetween) {
    timeHorizon = 3;
  } else {
    timeHorizon = timeBetween;
  }
  const fromHourLimit = mod(fromHour + timeHorizon, 24);
  return { from: fromHour, to: fromHourLimit };
};

const buildMongooseQuery = (queryObject, parsedQuery, pagination) => {
  if (parsedQuery.to > parsedQuery.from) {
    queryObject.where("fromHour").gte(parsedQuery.from);
    queryObject.where("fromHour").lte(parsedQuery.to);
  } else {
    queryObject.where("fromHour").gte(parsedQuery.to);
    queryObject.where("fromHour").lte(parsedQuery.from);
  }
  if (pagination) {
    queryObject.limit(pagination.limit).skip(pagination.skip);
  }
  return queryObject.sort({ createdAt: -1 });
};

export default {
  parse: parseFilters,
  query: buildMongooseQuery
};
