const buildCompanyAllResponse = async records => {
  const arrayResponse = await Promise.all(
    records.map(async rec => {
      const response = {};

      const avgRating = await rec.calculateAverageRating();
      const cntReview = await rec.calculateReviewCounts();

      response.uuid = rec.uuid;
      response.title = rec.title;
      response.averateRating = avgRating;
      response.reviewCount = cntReview;
      return response;
    })
  );
  return arrayResponse;
};

export default {
  responseBuilders: { company: { all: buildCompanyAllResponse } }
};
