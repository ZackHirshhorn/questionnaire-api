import mongoose from "mongoose";

export enum qType {
  Text = "Text",
  Multiple = "Multiple",
  Single = "Single",
  Number = "Number"
}

export interface IQuestion extends Document {
  q: string;
  choice: string[];
  qType: qType;
  required: boolean;
  answer?: string;
}

const questionSchema = new mongoose.Schema<IQuestion>(
  {
    q: {
      type: String,
      required: true
    },
    choice: [
      {
        type: String
      }
    ],
    qType: {
      type: String,
      enum: Object.values(qType),
      default: qType.Text,
      required: true
    },
    required: {
      type: Boolean,
      required: true
    },
    answer: {
      type: String
    }
  },
  {
    toJSON: {
      transform(_doc: any, ret: any) {
        const obj = ret as any;
        delete obj._id;
        delete obj.__v;
      }
    }
  }
);

export interface IQuestionsCol extends Document {
  name: string;
  questions: IQuestion[];
  description: string;
  user: mongoose.Types.ObjectId;
}

const questionsColSchema = new mongoose.Schema<IQuestionsCol>(
  {
    name: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    questions: [questionSchema]
  },
  {
    toJSON: {
      transform(_doc: any, ret: any) {
        const obj = ret as any;
        obj.id = obj._id;
        delete obj._id;
        delete obj.__v;
      }
    }
  }
);

questionsColSchema.index({ name: 1 }, { unique: true });

const QuestionsCol = mongoose.model<IQuestionsCol>(
  "QuestionsCol",
  questionsColSchema
);

export default QuestionsCol;
