import mongoose from "mongoose";
import { merge } from "lodash";
import abstract from "./abstract";
import commentSchemas from "./comments";

const review = merge(
  {
    showuser: { type: Boolean, default: false },
    setdetails: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    travelslot: { type: mongoose.Schema.Types.ObjectId, ref: "Travelslots" },
    driver: commentSchemas.driver,
    hostess: commentSchemas.hostess,
    breaks: commentSchemas.breaks,
    travel: commentSchemas.travel,
    baggage: commentSchemas.baggage,
    pet: commentSchemas.pet,
    comfort: commentSchemas.comfort,
    vehicle: commentSchemas.vehicle
  },
  abstract.baseSchema
);
const reviewSchema = new mongoose.Schema(review, abstract.baseOptions);

const Review = mongoose.model("Review", reviewSchema);

export default Review;
