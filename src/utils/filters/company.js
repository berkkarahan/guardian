const buildMongooseQuery = (queryObject, nameSearchStr) => {
  queryObject
    .where("name")
    .eq(nameSearchStr.toLowerCase())
    .collation({ locale: "en", strength: 2 });
  return queryObject;
};

const queryJsonBuilder = nameSearchStr => {
  return { name: nameSearchStr.toLowerCase() };
};

export default {
  query: buildMongooseQuery,
  queryJson: queryJsonBuilder
};
