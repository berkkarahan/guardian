import db from "../../db";
import tryCatch from "../../utils/catcher";

const Travelslots = db.models.travelslots;
const Company = db.models.company;

const getAvailableCitiesForCompany = tryCatch(async (req, res, next) => {
  const { resourceUUID } = req.params;
  if (!resourceUUID) {
    return res.status(403).json({
      error: {
        message: "/cities/:UUID is required for this endpoint."
      }
    });
  }
  const company = await Company.findOne({ uuid: resourceUUID });
  const [to, from] = await Promise.all([
    Travelslots.find({ company: company._id }).distinct("toCity"),
    Travelslots.find({ company: company._id }).distinct("fromCity")
  ]);
  res.status(200).json({
    from: from,
    to: to
  });
});

const buildCompanyAllResponse = async records => {
  const arrayResponse = await Promise.all(
    records.map(async rec => {
      const response = {};

      const [
        cntReview,
        petAllowedDistinct,
        luxuryCategories
      ] = await Promise.all([
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
      response.averateRating = rec.averateRating;
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
  controllers: { cities: getAvailableCitiesForCompany },
  responseBuilders: { company: { all: buildCompanyAllResponse } }
};
