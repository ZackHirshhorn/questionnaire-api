import mongoose from "mongoose";

export interface IAudience extends Document {
  name: string;
}

const audienceSchema = new mongoose.Schema<IAudience>(
  {
    name: {
      type: String,
      required: true,
      match: [
        /^[\u0590-\u05FF]+(?:[ '"\u0590-\u05FF]*[\u0590-\u05FF]+)*$/,
        "Audience's name must contain only Hebrew letters and spaces",
      ],
    },
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  },
);

audienceSchema.index({ name: 1 }, { unique: true });

const Audience = mongoose.model<IAudience>("Audience", audienceSchema);

export default Audience;
