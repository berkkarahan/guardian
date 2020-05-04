import { mod } from "mathjs";

const parseFilters = reqFiltersQuery => {
  const parsed = {};
  const { fromHour, timeBetween } = reqFiltersQuery.query;
  let timeHorizon;
  if (!timeBetween) {
    timeHorizon = 5;
  } else {
    timeHorizon = timeBetween;
  }

  const fromHourLimit = mod(fromHour + timeHorizon, 24);

  parsed.from = fromHour;
  parsed.to = fromHourLimit;
  parsed.fromCity = reqFiltersQuery.query.fromCity;
  parsed.toCity = reqFiltersQuery.query.toCity;

  const { isPetAllowed, is3Seater } = reqFiltersQuery.query;
  if (isPetAllowed) {
    switch (isPetAllowed) {
      case 1:
        parsed.isPetAllowed = true;
        break;
      case 0:
        parsed.isPetAllowed = false;
        break;
      default:
        parsed.isPetAllowed = false;
    }
  }

  if (is3Seater) {
    switch (is3Seater) {
      case 1:
        parsed.is3Seater = true;
        break;
      case 0:
        parsed.is3Seater = false;
        break;
      default:
        parsed.is3Seater = false;
    }
  }

  return parsed;
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
  if (typeof parsedQuery.isPetAllowed === "boolean") {
    queryObject.where("petAllowed").eq(parsedQuery.isPetAllowed);
  }

  if (typeof parsedQuery.is3Seater === "boolean") {
    queryObject.where("luxuryCategory").in(["3seater", "lux"]);
  }
  return queryObject;
};

const queryJsonBuilder = parsedQuery => {
  console.log(parsedQuery);
  const query = { $and: [] };
  if (parsedQuery.to > parsedQuery.from) {
    query.$and.push({ fromHour: { $gte: ["$fromHour", parsedQuery.from] } });
    query.$and.push({ fromHour: { $lte: ["$fromHour", parsedQuery.to] } });
  } else {
    query.$and.push({ fromHour: { $gte: ["$fromHour", parsedQuery.to] } });
    query.$and.push({ fromHour: { $lte: ["$fromHour", parsedQuery.from] } });
  }

  if (parsedQuery.fromCity) {
    query.$and.push({ fromCity: parsedQuery.fromCity.toLowerCase() });
  }
  if (parsedQuery.toCity) {
    query.$and.push({ toCity: parsedQuery.toCity.toLowerCase() });
  }
  if (typeof parsedQuery.isPetAllowed === "boolean") {
    query.$and.push({ petAllowed: parsedQuery.isPetAllowed });
  }
  if (typeof parsedQuery.is3Seater === "boolean") {
    query.$and.push({ luxuryCategory: { $in: ["3seater", "lux"] } });
  }
  return query;
};

export default {
  parse: parseFilters,
  query: buildMongooseQuery,
  queryJson: queryJsonBuilder
};
