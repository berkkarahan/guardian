import db from "../../db";
import tryCatch from "../../utils/catcher";

const Travelslots = db.models.travelslots;
const Company = db.models.company;

// Util func to be used.
const zeroPad = (num, places) => String(num).padStart(places, "0");

const getAvailableCities = tryCatch(async (req, res, next) => {
  const [to, from] = await Promise.all([
    Travelslots.find().distinct("toCity"),
    Travelslots.find().distinct("fromCity")
  ]);
  res.status(200).json({
    from: from,
    to: to
  });
});

const buildTravelslotsAllResponse = async travelslots => {
  const arrayResponse = await Promise.all(
    travelslots.map(async rec => {
      const response = {};
      const currentCompany = await Company.findById(rec.company);

      const [cntReviewCompany, cntReviewTravelslot] = await Promise.all([
        currentCompany.calculateReviewCounts(),
        rec.calculateReviewCounts()
      ]);

      response.company = {
        uuid: currentCompany.uuid,
        title: currentCompany.title,
        averageRating: currentCompany.averageRating,
        reviewCount: cntReviewCompany
      };
      response.travelslot = {
        uuid: rec.uuid,
        averageRating: rec.averageRating,
        reviewCount: cntReviewTravelslot,
        fromHour: rec.fromHour,
        fromMinute: rec.fromMinute,
        fromCity: rec.fromCity,
        travelTime: String(rec.fromHour).concat(
          ":",
          zeroPad(rec.fromMinute, 2)
        ),
        toCity: rec.toCity,
        luxuryCategory: rec.luxuryCategory,
        isPetAllowed: rec.isPetAllowed,
        is3Seater: rec.is3Seater
      };
      return response;
    })
  );
  return arrayResponse;
};

export default {
  controllers: { cities: getAvailableCities },
  responseBuilders: { travelslots: { all: buildTravelslotsAllResponse } }
};
