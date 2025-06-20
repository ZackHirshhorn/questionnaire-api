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

export interface ISubCategory extends Document {
  name: string;
  questions: IQuestion[];
  topic?: mongoose.Schema.Types.ObjectId[];
}

const subCategorySchema = new mongoose.Schema<ISubCategory>(
  {
    name: {
      type: String,
      required: true,
      match: [
        /^[\u0590-\u05FFA-Z](?:[\u0590-\u05FF a-z]*[\u0590-\u05FFa-z])?$/,
        "Sub-category's name is not valid",
      ],
    },
    questions: [questionSchema],
    topic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Topic",
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

subCategorySchema.index({ name: 1 }, { unique: true });

const Category = mongoose.model<ISubCategory>("Category", subCategorySchema);

export default Category;
