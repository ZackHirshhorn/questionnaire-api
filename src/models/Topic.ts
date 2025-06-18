import mongoose from "mongoose";

export interface ITopic extends Document {
  name: string;
}

const topicSchema = new mongoose.Schema<ITopic>(
  {
    name: {
      type: String,
      required: true,
    },
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

topicSchema.index({ name: 1 }, { unique: true });

const Topic = mongoose.model<ITopic>("Topic", topicSchema);

export default Topic;
