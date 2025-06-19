import mongoose from "mongoose";

export interface IAudience extends Document {
  name: string;
}

const audienceSchema = new mongoose.Schema<IAudience>(
  {
    name: {
      type: String,
      required: true,
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
