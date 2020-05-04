const limit = 10;
const paginateWith = pageNumber => {
  return (pageNumber - 1) * limit || 0;
};

const paginateQuery = (queryObject, pageNumber) => {
  const skip = paginateWith(pageNumber);
  queryObject.limit(limit).skip(skip);
  return queryObject.sort({ createdAt: -1 });
};

const paginateWithQueryJson = async (Collection, queryJson, pageNumber) => {
  const skip = paginateWith(pageNumber);
  const queryCount = await Collection.count(queryJson);
  const queryResponse = await Collection.find(queryJson)
    .limit(limit)
    .skip(skip);
  return {
    count: queryCount,
    response: queryResponse
  };
};

export default paginateQuery;
