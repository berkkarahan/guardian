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
  return {
    from: fromHour,
    to: fromHourLimit,
    fromCity: reqFiltersQuery.fromCity,
    toCity: reqFiltersQuery.toCity
  };
};

const buildMongooseQuery = (queryObject, parsedQuery) => {
  // fromHour filter
  if (parsedQuery.to > parsedQuery.from) {
    queryObject.where("fromHour").gte(parsedQuery.from);
    queryObject.where("fromHour").lte(parsedQuery.to);
  } else {
    queryObject.where("fromHour").gte(parsedQuery.to);
    queryObject.where("fromHour").lte(parsedQuery.from);
  }

  if (parsedQuery.fromCity && parsedQuery.toCity) {
    queryObject
      .where("fromCity")
      .eq(parsedQuery.fromCity.toLowerCase())
      .collation({ locale: "en", strength: 2 });

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
