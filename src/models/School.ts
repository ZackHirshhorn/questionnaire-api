import mongoose from "mongoose";

export interface ISchool extends Document {
  name: string;
}

const schoolSchema = new mongoose.Schema<ISchool>(
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

schoolSchema.index({ name: 1 }, { unique: true });

const School = mongoose.model<ISchool>("School", schoolSchema);

export default School;
