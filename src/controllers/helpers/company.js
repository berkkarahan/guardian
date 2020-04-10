import db from "../../db";

const Travelslots = db.models.travelslots;

const buildCompanyAllResponse = async records => {
  const arrayResponse = await Promise.all(
    records.map(async rec => {
      const response = {};

      const [
        avgRating,
        cntReview,
        petAllowedDistinct,
        luxuryCategories
      ] = await Promise.all([
        rec.calculateAverageRating(),
        rec.calculateReviewCounts(),
        Travelslots.find({ company: rec._id }).distinct("petAllowed"),
        Travelslots.find({ company: rec._id }).distinct("luxuryCategory")
      ]);

      let is3Seater;
      // eslint-disable-next-line no-restricted-syntax
      for (const ctg of ["3seater", "lux"]) {
        is3Seater = false;
        if (luxuryCategories.indexOf(ctg) >= 0) {
          is3Seater = true;
          break;
        }
      }

      let petAllowed;
      if (petAllowedDistinct.indexOf(true) >= 0) {
        petAllowed = true;
      } else {
        petAllowed = false;
      }

      response.uuid = rec.uuid;
      response.title = rec.title;
      response.averateRating = avgRating;
      response.reviewCount = cntReview;
      response.information = {
        petAllowed: petAllowed,
        is3Seater: is3Seater
      };
      return response;
    })
  );
  return arrayResponse;
};

export default {
  responseBuilders: { company: { all: buildCompanyAllResponse } }
};
