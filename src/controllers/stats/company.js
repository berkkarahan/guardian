import db from "../../db";
import tryCatch from "../../utils/catcher";

const Company = db.models.company;
const Travelslot = db.models.travelslots;

const companyAverageRating = tryCatch(async (req, res, next) => {
  const { uuid } = req.body;
  const company = await Company.findOne({ uuid: uuid });
  res.status(200).json({ averageRating: company.averageRating });
});

const companyReviewCounts = tryCatch(async (req, res, next) => {
  const { uuid } = req.body;
  const company = await Company.findOne({ uuid: uuid });
  const reviewCounts = await company.calculateReviewCounts();
  res.status(200).json({ reviewCounts: reviewCounts });
});

const travelslotAverageRating = tryCatch(async (req, res, next) => {
  const { uuid } = req.body;
  const travelslot = await Travelslot.findOne({ uuid: uuid });
  res.status(200).json({ averageRating: travelslot.averageRating });
});

const travelslotReviewCounts = tryCatch(async (req, res, next) => {
  const { uuid } = req.body;
  const travelslot = await Travelslot.findOne({ uuid: uuid });
  const reviewCounts = await travelslot.calculateReviewCounts();
  res.status(200).json({ reviewCounts: reviewCounts });
});

export default {
  average: {
    company: companyAverageRating,
    travelslot: travelslotAverageRating
  },
  reviewCounts: {
    company: companyReviewCounts,
    travelslot: travelslotReviewCounts
  }
};
