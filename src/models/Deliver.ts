import mongoose from "mongoose";

export interface IDeliver extends Document {
  name: string;
}

const deliverSchema = new mongoose.Schema<IDeliver>(
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

deliverSchema.index({ name: 1 }, { unique: true });

const Deliver = mongoose.model<IDeliver>("Deliver", deliverSchema);

export default Deliver;
