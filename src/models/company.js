import mongoose from "mongoose";
import { merge } from "lodash";
import abstract from "./abstract";

// title field is required for adminbro to show proper titles at admin references
const company = merge(
  {
    title: { type: String },
    name: { type: String },
    overallrating: { type: Number, min: 1, max: 5 }
  },
  abstract.baseCompanySchema
);
const companySchema = new mongoose.Schema(company, abstract.baseOptions);

companySchema.pre("save", async function(next) {
  this.title = `Title: ${this.name}`;
  next();
});

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
  this.title = `${this.fromCity}-${this.toCity}-${this.fromHour}:${this.fromMinute}-${this.toHour}:${this.toMinute}`;
  next();
});

const Travelslots = mongoose.model("Travelslots", travelSlotsSchema);

export default {
  company: Company,
  travelslots: Travelslots
};
