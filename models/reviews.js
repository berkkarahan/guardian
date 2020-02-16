import mongoose from "mongoose";
import { merge } from "lodash";
import abstract from "./abstract";

const driverReview = merge({}, abstract.baseRatingSchema);
const driverReviewSchema = new mongoose.Schema(
  driverReview,
  abstract.baseOptions
);

const hostessReview = merge(
  {
    treatreview: { type: Number, min: 1, max: 5 }
  },
  abstract.baseRatingSchema
);
const hostessReviewSchema = new mongoose.Schema(
  hostessReview,
  abstract.baseOptions
);

const breakReview = merge(
  {
    totalBreaks: { type: Number }
  },
  abstract.baseRatingSchema
);
const breakReviewSchema = new mongoose.Schema(
  breakReview,
  abstract.baseOptions
);

const traveltimeReviewSchema = new mongoose.Schema(
  abstract.baseRatingSchema,
  abstract.baseOptions
);

const baggageReview = merge(
  {
    totalBaggages: { type: Number }
  },
  abstract.baseRatingSchema
);
const baggageReviewSchema = new mongoose.Schema(
  baggageReview,
  abstract.baseOptions
);

const petReview = merge(
  {
    petAllowed: { type: Boolean, required: true },
    petType: {
      type: String,
      enum: [
        "small", // smaller animals
        "medium", // cats or smaller dogs
        "big" // bigger dogs
      ]
    }
  },
  abstract.baseRatingSchema
);
const petReviewSchema = new mongoose.Schema(petReview, abstract.baseOptions);

const comfortReviewSchema = new mongoose.Schema(
  abstract.baseRatingSchema,
  abstract.baseOptions
);

const vehicleReviewSchema = new mongoose.Schema(
  abstract.baseRatingSchema,
  abstract.baseOptions
);

const DriverReview = mongoose.model("DriverReview", driverReviewSchema);
const HostessRevew = mongoose.model("HostessReview", hostessReviewSchema);
const BreakReview = mongoose.model("BrewkReview", breakReviewSchema);
const TravelReview = mongoose.model("TravelReview", traveltimeReviewSchema);
const BaggageReview = mongoose.model("BaggageReview", baggageReviewSchema);
const PetReview = mongoose.model("PetReview", petReviewSchema);
const VehicleReview = mongoose.model("VehicleReview", vehicleReviewSchema);

export default {
  driver: DriverReview,
  hostess: HostessRevew,
  break: BreakReview,
  travel: TravelReview,
  baggage: BaggageReview,
  pet: PetReview,
  vehicle: VehicleReview
};
