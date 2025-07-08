import mongoose from "mongoose";

export interface IQuestion extends Document {
  q: string;
  choice: string[];
  qType: string;
  required: boolean;
  answer?: string;
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
    answer: {
      type: String,
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

export interface IQuestionsCol extends Document {
  name: string;
  questions: IQuestion[];
}

const questionsColSchema = new mongoose.Schema<IQuestionsCol>(
  {
    name: {
      type: String,
      required: true,
    },
    questions: [questionSchema],
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

questionsColSchema.index({ name: 1 }, { unique: true });

const QuestionsCol = mongoose.model<IQuestionsCol>(
  "QuestionsCol",
  questionsColSchema,
);

export default QuestionsCol;
