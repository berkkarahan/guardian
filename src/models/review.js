/* eslint-disable import/no-cycle */
import mongoose from "mongoose";
import { merge } from "lodash";
import abstract from "./abstract";
import commentSchemas from "./comments";
import company from "./company";

const Travelslot = company.travelslots;
const Company = company.company;

const review = merge(
  {
    title: { type: String },
    showuser: { type: Boolean, default: false },
    details: { type: String },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    travelslot: { type: mongoose.Schema.Types.ObjectId, ref: "Travelslots" },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    averageRating: { type: Number },
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

reviewSchema.pre("save", async function(next) {
  const travelslot = await Travelslot.findById(this.travelslot).populate(
    "company"
  );
  if (travelslot && travelslot.company) {
    this.title = `Review for travelslot: ${travelslot.title} for company: ${travelslot.company.title}`;
  }
  next();
});

reviewSchema.pre("save", async function(next) {
  const currentReview = this;
  const subDocs = [
    "driver",
    "hostess",
    "breaks",
    "travel",
    "baggage",
    "pet",
    "comfort",
    "vehicle"
  ];
  let sumRating = 0;
  let count = 0;
  let average;
  subDocs.forEach(sub => {
    if (currentReview[sub]) {
      const subdoc = currentReview[sub];
      if (subdoc.rating) {
        sumRating += currentReview[sub].rating;
        count += 1;
      }
    }
  });
  if (sumRating && count) {
    average = sumRating / count;
  } else {
    average = 0;
  }
  currentReview.averageRating = average;
  next();
});

// Update company average rating each time a review is made
reviewSchema.post("save", async function() {
  const reviewCompany = await Company.findById(this.company);
  const reviewTravelslot = await Travelslot.findById(this.travelslot);
  await reviewCompany.calculateAverageRating();
  await reviewTravelslot.calculateAverageRating();
});

const Review = mongoose.model("Review", reviewSchema);

export default Review;
