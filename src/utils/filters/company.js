const buildMongooseQuery = (queryObject, nameSearchStr, pagination) => {
  queryObject
    .where("name")
    .eq(nameSearchStr.toLowerCase())
    .collation({ locale: "en", strength: 2 });
  if (pagination) {
    queryObject.limit(pagination.limit).skip(pagination.skip);
  }
  return queryObject.sort({ createdAt: -1 });
};

export default {
  query: buildMongooseQuery
};
