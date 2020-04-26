import db from "../../db";
import tryCatch from "../../utils/catcher";

const Review = db.models.review;

const userReviewCount = tryCatch(async (req, res, next) => {
  const userReviews = await Review.find({ user: req.user._id });
  res.status(200).json({ count: userReviews.length });
});

const reviewAverageRating = tryCatch(async (req, res, next) => {
  const { uuid } = req.body;
  const company = await Review.findOne({ uuid: uuid });
  res.status(200).json({ averageRating: company.averageRating });
});

export default {
  count: userReviewCount,
  average: reviewAverageRating
};
