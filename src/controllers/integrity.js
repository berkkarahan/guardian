import db from "../db";
import tryCatch from "../utils/catcher";

const Company = db.models.company;
const Travelslot = db.models.travelslots;

const updateCompanyTitles = tryCatch(async (req, res, next) => {
  const companies = await Company.find().exec();
  await Promise.all(
    companies.map(async rec => {
      rec.updateTitle();
    })
  );
  res.status(200).send();
});

const updateTravelslotTitles = tryCatch(async (req, res, next) => {
  const travelslots = await Travelslot.find().exec();
  await Promise.all(
    travelslots.map(async rec => {
      rec.updateTitle();
    })
  );
  res.status(200).send();
});

const updateCompanyAverageRating = tryCatch(async (req, res, next) => {
  const companies = await Company.find().exec();
  await Promise.all(
    companies.map(async rec => {
      rec.calculateAverageRating();
    })
  );
  res.status(200).send();
});

const updateTravelslotAverageRating = tryCatch(async (req, res, next) => {
  const travelslots = await Company.find().exec();
  await Promise.all(
    travelslots.map(async rec => {
      rec.calculateAverageRating();
    })
  );
  res.status(200).send();
});

export default {
  title: { company: updateCompanyTitles, travelslot: updateTravelslotTitles },
  averageRating: {
    company: updateCompanyAverageRating,
    travelslot: updateTravelslotAverageRating
  }
};
