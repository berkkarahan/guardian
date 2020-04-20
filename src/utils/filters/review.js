const buildMongooseQuery = (queryObject, reviewFilterBody) => {
  const { company, travelslot } = reviewFilterBody;
  if (!company && !travelslot) {
    throw new Error(
      "At least either company or travelslot is necessary to filter reviews."
    );
  }
  if (company) {
    queryObject.where("company").eq(company);
  }

  if (travelslot) {
    queryObject.where("travelslot").eq(travelslot);
  }
  return queryObject;
};

export default { query: buildMongooseQuery };
