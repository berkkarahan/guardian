const paginateQuery = (queryObject, pageNumber) => {
  const limit = 10;
  const paginate = (pageNumber - 1) * limit || 0;
  queryObject.limit(limit).skip(paginate);
  return queryObject.sort({ createdAt: -1 });
};

export default paginateQuery;
