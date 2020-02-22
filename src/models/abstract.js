import { uuid } from "uuidv4";
import { merge } from "lodash";

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
  timestamps: { createdAt: "created_at", updatedAt: "updated_at" }
};

const BaseSchemaOptions = merge({}, _AbstractTimestamps);

export default {
  baseOptions: BaseSchemaOptions,
  baseSchema: BaseModelSchema,
  baseRatingSchema: BaseRatingSchema
};