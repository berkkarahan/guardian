const buildMongooseQuery = (queryObject, companyID) => {
  if (!companyID) {
    throw new Error("Company UUID - > ID find failed.");
  }
  queryObject.where("company").eq(companyID);
  return queryObject;
};

export default {
  query: buildMongooseQuery
};
