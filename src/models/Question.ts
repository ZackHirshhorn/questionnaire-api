import mongoose from "mongoose";

export interface IQuestion extends Document {
  q: string;
  choice: string[];
}

const questionSchema = new mongoose.Schema<IQuestion>(
  {
    q: {
      type: String,
      required: true,
    },
    choice: [
      {
        type: String,
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

questionSchema.index({ name: 1 }, { unique: true });

const Audience = mongoose.model<IQuestion>("Audience", questionSchema);

export default Audience;
