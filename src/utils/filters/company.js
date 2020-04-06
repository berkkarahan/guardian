const buildMongooseQuery = (queryObject, nameSearchStr) => {
  queryObject
    .where("name")
    .eq(nameSearchStr.toLowerCase())
    .collation({ locale: "en", strength: 2 });
  return queryObject;
};

export default {
  query: buildMongooseQuery
};
