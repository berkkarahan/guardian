import db from "../../db";
import tryCatch from "../../utils/catcher";

const Review = db.models.review;

const userReviewCount = tryCatch(async (req, res, next) => {
  const userReviews = await Review.find({ user: req.user._id });
  res.status(200).json({ count: userReviews.length });
});

export default { count: userReviewCount };
