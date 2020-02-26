import mongoose from "mongoose";
import { merge } from "lodash";
import abstract from "./abstract";

const company = merge(
  {
    name: { type: String },
    overallrating: { type: Number, min: 1, max: 5 }
  },
  abstract.baseCompanySchema
);
const companySchema = new mongoose.Schema(company, abstract.baseOptions);

const Company = mongoose.model("Company", companySchema);

const travelSlots = merge(
  {
    from_city: { type: String },
    to_city: { type: String },
    from_datetime: { type: Date },
    to_datetime: { type: Date },
    luxury_category: {
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

const Travelslots = mongoose.model("Travelslots", travelSlotsSchema);

export default {
  company: Company,
  travelslots: Travelslots
};
