import Review from "../../models/review";
import tryCatch from "../../utils/catcher";

const userReviewCount = tryCatch(async (req, res, next) => {
  const userReviews = await Review.find({ user: req.user._id });
  res.status(200).json({ count: userReviews.length });
});

export default { count: userReviewCount };
