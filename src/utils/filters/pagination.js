import { ceil } from "mathjs";

const defaultLimit = 10;
const paginateWith = (pageNumber, limit) => {
  const _limit = limit || defaultLimit;
  return (pageNumber - 1) * _limit || 0;
};

const paginateWithQueryJson = async (
  Collection,
  queryJson,
  pageNumber,
  limit
) => {
  const _limit = limit || defaultLimit;
  const queryCount = await Collection.count({ $expr: queryJson });
  const pages = ceil(queryCount / defaultLimit);
  const skip =
    paginateWith(pageNumber, _limit) + 10 < queryCount || queryCount < _limit
      ? paginateWith(pageNumber, _limit)
      : queryCount - _limit;
  const queryResponse = await Collection.find({ $expr: queryJson })
    .limit(_limit)
    .skip(skip)
    .sort({ createdAt: -1 });
  return {
    count: queryCount,
    pages: pages,
    response: queryResponse
  };
};

const setPaginationResponseHeaders = (paginateWithQueryJsonResult, res) => {
  res.set("X-Total-Count", paginateWithQueryJsonResult.count);
  res.set("X-Max-Pages", paginateWithQueryJsonResult.pages);
  return res;
};

export default {
  paginate: paginateWithQueryJson,
  setHeaders: setPaginationResponseHeaders
};
