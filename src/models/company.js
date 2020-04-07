import mongoose from "mongoose";
import { merge } from "lodash";
import abstract from "./abstract";
import Review from "./review";

// title field is required for adminbro to show proper titles at admin references
const company = merge(
  {
    title: { type: String },
    name: { type: String },
    averageRating: { type: Number, min: 0, max: 5 }
  },
  abstract.baseCompanySchema
);
const companySchema = new mongoose.Schema(company, abstract.baseOptions);

companySchema.pre("save", async function(next) {
  this.title = `Title: ${this.name}`;
  next();
});

companySchema.methods.calculateReviewCounts = async function() {
  const reviews = await Review.find({ company: this });
  return reviews.length;
};

companySchema.methods.calculateAverageRating = async function() {
  const reviews = await Review.find({ company: this });
  const sumReviewAverages = reviews.reduce(
    (r1, r2) => r1.averageRating + r2.averageRating,
    0
  );
  let averageRating;
  if (sumReviewAverages > 0) {
    averageRating = sumReviewAverages / reviews.length;
  } else {
    averageRating = 0;
  }
  this.averageRating = averageRating;
  await this.save();
  return averageRating;
};

companySchema.index({ name: 1 }, { collation: { locale: "en", strength: 2 } });

const Company = mongoose.model("Company", companySchema);

const travelSlots = merge(
  {
    title: { type: String },
    fromCity: { type: String },
    toCity: { type: String },
    fromHour: { type: Number, min: 0, max: 23 },
    fromMinute: { type: Number, min: 0, max: 59 },
    toHour: { type: Number, min: 0, max: 23 },
    toMinute: { type: Number, min: 0, max: 59 },
    luxuryCategory: {
      type: String,
      enum: ["standard", "3seater", "lux", "other"]
    },
    petAllowed: { type: Boolean },
    daytime: { type: String, enum: ["day", "night"] },
    company: { type: mongoose.Schema.Types.ObjectId, ref: "Company" }
  },
  abstract.baseCompanySchema
);
const travelSlotsSchema = new mongoose.Schema(
  travelSlots,
  abstract.baseOptions
);

travelSlotsSchema.pre("save", async function(next) {
  if (!this.company) {
    throw new Error("Can't save a travelslot without a company.");
  }
  this.title = `${this.company.name}-${this.fromCity}-${this.toCity}-${this.fromHour}:${this.fromMinute}-${this.toHour}:${this.toMinute}`;
  next();
});

travelSlotsSchema.virtual("is3Seater").get(function() {
  if (["3seater", "lux"].indexOf(this.luxuryCategory) >= 0) {
    return true;
  }
  return false;
});

travelSlotsSchema.virtual("isPetAllowed").get(function() {
  if (!this.petAllowed) {
    return false;
  }
  return true;
});

travelSlotsSchema.index(
  { fromCity: 1 },
  { collation: { locale: "en", strength: 2 } }
);

travelSlotsSchema.index(
  { toCity: 1 },
  { collation: { locale: "en", strength: 2 } }
);

const Travelslots = mongoose.model("Travelslots", travelSlotsSchema);

export default {
  company: Company,
  travelslots: Travelslots
};
