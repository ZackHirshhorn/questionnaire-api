import mongoose from "mongoose";

export interface IQuestion extends Document {
  q: string;
  choice: string[];
  qType: string;
  required: boolean;
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
    qType: {
      type: String,
      required: true,
    },
    required: {
      type: Boolean,
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

export interface ICategory extends Document {
  name: string;
  questions: IQuestion[];
  subCategory?: mongoose.Schema.Types.ObjectId;
}

const categorySchema = new mongoose.Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      match: [
        /^[\u0590-\u05FFA-Z](?:[\u0590-\u05FF a-z]*[\u0590-\u05FFa-z])?$/,
        "Category's name is not valid",
      ],
    },
    questions: [questionSchema],
    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
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

categorySchema.index({ name: 1 }, { unique: true });

const Category = mongoose.model<ICategory>("Category", categorySchema);

export default Category;
