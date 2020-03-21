import { uuid } from "uuidv4";
import { merge } from "lodash";
import mongoose from "mongoose";

const BaseModelSchema = {
  uuid: {
    type: String,
    default: function genUUID() {
      return uuid();
    },
    index: true,
    unique: true
  }
};

const BaseCompanySchema = merge(
  {
    recordVerified: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  BaseModelSchema
);

const _AbstractCommentSchema = {
  comment: { type: String },
  likes: { type: Number, default: 0 },
  dislikes: { type: Number, default: 0 }
};

const _AbstractRatingSchema = { rating: { type: Number, min: 1, max: 5 } };

const BaseRatingSchema = merge(
  {},
  BaseModelSchema,
  _AbstractCommentSchema,
  _AbstractRatingSchema
);

const _AbstractTimestamps = {
  timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }
};

const BaseSchemaOptions = merge({}, _AbstractTimestamps);

export default {
  baseOptions: BaseSchemaOptions,
  baseSchema: BaseModelSchema,
  baseCompanySchema: BaseCompanySchema,
  baseRatingSchema: BaseRatingSchema
};
