const parseFilters = reqFilters => {
  const parsedQuery = {};
  Object.entries(reqFilters).forEach(pairs => {
    const key = pairs[0];
    const value = pairs[1];
    if (key.includes("_")) {
      const [varName, varIdentifier] = key.split("_");
      if (varName in parsedQuery) {
        parsedQuery[varName][varIdentifier] = value;
      } else {
        const filtered = {};
        filtered[varIdentifier] = value;
        parsedQuery[varName] = filtered;
      }
      return;
    }
    parsedQuery[key] = value;
  });
  return parsedQuery;
};

const buildMongooseQuery = (queryObject, parsedQuery) => {
  Object.entries(parsedQuery).forEach(pairs => {
    const key = pairs[0];
    const value = pairs[1];
    const typeOfValue = typeof value;
    if (typeOfValue !== "object") {
      queryObject.where(key, value);
    } else if (typeOfValue === "object") {
      Object.entries(value).forEach(objectPairs => {
        const identifierType = objectPairs[0];
        const identifierValue = objectPairs[1];
        switch (identifierType) {
          case "min":
            queryObject.where(key).gte(identifierValue);
            break;
          case "max":
            queryObject.where(key).lte(identifierValue);
            break;
          default:
            break;
        }
      });
    }
  });
  return queryObject;
};

export default {
  parse: parseFilters,
  query: buildMongooseQuery
};
