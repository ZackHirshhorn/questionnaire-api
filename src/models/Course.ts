import mongoose from "mongoose";

export interface ICourse extends Document {
  name: string;
  serialNumber: number;
  audiences: mongoose.Schema.Types.ObjectId[];
  deliver: mongoose.Schema.Types.ObjectId;
  topics: mongoose.Schema.Types.ObjectId[];
  mandatory: boolean;
}

const courseSchema = new mongoose.Schema<ICourse>(
  {
    name: {
      type: String,
      required: true,
    },
    serialNumber: {
      type: Number,
    },
    mandatory: {
      type: Boolean,
      required: true,
    },
    audiences: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Audience",
        required: true,
      },
    ],
    deliver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Deliver",
      required: true,
    },
    topics: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Topic",
        required: true,
      },
    ],
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        ret.id = ret._id;
        delete ret._id;
        delete ret.__v;
      },
    },
  },
);

courseSchema.index({ name: 1 }, { unique: true });

const Course = mongoose.model<ICourse>("Course", courseSchema);

export default Course;
