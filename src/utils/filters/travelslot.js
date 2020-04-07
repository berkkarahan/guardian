import { mod } from "mathjs";

const parseFilters = reqFiltersQuery => {
  const { fromHour, timeBetween } = reqFiltersQuery.query;
  let timeHorizon;
  if (!timeBetween) {
    timeHorizon = 3;
  } else {
    timeHorizon = timeBetween;
  }

  const fromHourLimit = mod(fromHour + timeHorizon, 24);

  return {
    from: fromHour,
    to: fromHourLimit,
    fromCity: reqFiltersQuery.query.fromCity,
    toCity: reqFiltersQuery.query.toCity
  };
};

const buildMongooseQuery = (queryObject, parsedQuery) => {
  if (parsedQuery.to > parsedQuery.from) {
    queryObject.where("fromHour").gte(parsedQuery.from);
    queryObject.where("fromHour").lte(parsedQuery.to);
  } else {
    queryObject.where("fromHour").gte(parsedQuery.to);
    queryObject.where("fromHour").lte(parsedQuery.from);
  }

  if (parsedQuery.fromCity) {
    queryObject
      .where("fromCity")
      .eq(parsedQuery.fromCity.toLowerCase())
      .collation({ locale: "en", strength: 2 });
  }
  if (parsedQuery.toCity) {
    queryObject
      .where("toCity")
      .eq(parsedQuery.toCity.toLowerCase())
      .collation({ locale: "en", strength: 2 });
  }
  return queryObject;
};

export default {
  parse: parseFilters,
  query: buildMongooseQuery
};
