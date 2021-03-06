const buildMongooseQuery = (queryObject, nameSearchStr, minRating) => {
  if (nameSearchStr) {
    queryObject
      .where("name")
      .eq(nameSearchStr.toLowerCase())
      .collation({ locale: "en", strength: 2 });
  }

  if (minRating) {
    queryObject.where("averageRating").gte(minRating);
  }

  return queryObject;
};

export default {
  query: buildMongooseQuery
};
