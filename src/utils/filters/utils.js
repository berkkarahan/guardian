import { ceil, max } from "mathjs";

const defaultLimit = 10;

const parsePaginatedQueryParameters = requestBody => {
  const { filters } = requestBody;
  if (!filters) {
    throw new Error("request.body.filters must exist for a paginated query.");
  }
  const pageNumber = filters.pageNumber || 1;
  const { query } = filters;

  return {
    pageNumber: pageNumber,
    query: query
  };
};

const paginateQuery = async (queryObject, limit, pageNumber) => {
  const adjLimit = limit || defaultLimit;
  const paginate = (pageNumber - 1) * limit || 0;
  console.log(await queryObject);
  const initialResponse = await queryObject.exec();
  const queryLength = initialResponse.length;

  console.log(`len: ${queryLength}, limit: ${adjLimit}`);

  const pages = ceil(queryLength / adjLimit);
  const adjPaginate =
    paginate + adjLimit < queryLength
      ? paginate
      : max(queryLength - adjLimit, 0);

  queryObject.limit(adjLimit).skip(adjPaginate);
  return {
    paginatedResponse: queryObject.sort({ createdAt: -1 }),
    count: queryLength,
    pages: pages
  };
};

const setHeaders = (paginateQueryResponse, res) => {
  res.set("X-Total-Count", paginateQueryResponse.count);
  res.set("X-Max-Pages", paginateQueryResponse.pages);
  return res;
};

export default {
  paginateQuery: paginateQuery,
  setHeaders: setHeaders,
  parseParameters: parsePaginatedQueryParameters
};
