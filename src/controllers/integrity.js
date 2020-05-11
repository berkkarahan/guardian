import db from "../db";
import tryCatch from "../utils/catcher";

const Company = db.models.company;
const Travelslot = db.models.travelslots;

const fixTitles = tryCatch(async (req, res, next) => {
  const [companies, travelslots] = await Promise.all([
    Company.find({}),
    Travelslot.find({})
  ]);
  await Promise.all([
    Promise.all(
      companies.map(async rec => {
        rec.updateTitle();
      })
    ),
    Promise.all(
      travelslots.map(async rec => {
        rec.updateTitle();
      })
    )
  ]);
});

const fixRatings = tryCatch(async (req, res, next) => {
  const [companies, travelslots] = await Promise.all([
    Company.find({}),
    Travelslot.find({})
  ]);
  await Promise.all([
    Promise.all(
      companies.map(async rec => {
        rec.calculateAverageRating();
      })
    ),
    Promise.all(
      travelslots.map(async rec => {
        rec.calculateAverageRating();
      })
    )
  ]);
  res.status(200).send();
});

export default {
  title: {
    fixAll: fixTitles
  },
  averageRating: {
    fixAll: fixRatings
  }
};
