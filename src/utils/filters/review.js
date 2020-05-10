import db from "../../db";

const buildMongooseQuery = (queryObject, companyID, travelslotID) => {
  if (companyID) {
    queryObject.where("company").equals(companyID);
  }

  if (travelslotID) {
    queryObject.where("travelslot").equals(travelslotID);
  }
  return queryObject;
};

export default { query: buildMongooseQuery };
