import mongoose from "mongoose";
import db from "../../db";

const Travelslots = db.models.travelslots;
const Review = db.models.review;

const getCompanyReviewCounts = async companyRecords => {
  const finalResponse = await Promise.all(
    companyRecords.map(async doc => {
      const travelslots = await Travelslots.find({ company: doc._id });
      const travelslotIds = travelslots.map(
        tslot => new mongoose.Types.ObjectId(tslot.id)
      );
      const reviews = await Review.find()
        .where("travelslot")
        .in(travelslotIds)
        .exec();
      return { companyID: doc.id, count: reviews.length };
    })
  );
  return finalResponse;
};

const getCompanyAverageRatings = async companyRecords => {
  const finalResponse = await Promise.all(
    companyRecords.map(async doc => {
      const travelslots = await Travelslots.find({ company: doc._id });
      const travelslotIds = travelslots.map(
        tslot => new mongoose.Types.ObjectId(tslot.id)
      );
      const reviews = await Review.find()
        .where("travelslot")
        .in(travelslotIds)
        .exec();
      const reviewRatings = reviews.map(review_ => {
        return review_.averageRating;
      });
      return {
        companyID: doc.id,
        average: reviewRatings.reduce((a, b) => a + b, 0) / reviewRatings.length
      };
    })
  );
  return finalResponse;
};

export default {
  companyReviewCounts: getCompanyReviewCounts,
  companyAverageRatings: getCompanyAverageRatings
};
