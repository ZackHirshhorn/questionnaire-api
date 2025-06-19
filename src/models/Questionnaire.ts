import mongoose, { Mongoose } from "mongoose";

export interface IQuestionnaire extends Document {
  name: string;
  user?: mongoose.Types.ObjectId;
  userPhone?: string;
  toke?: string;
  school: mongoose.Types.ObjectId;
  topics: mongoose.Types.ObjectId[];
}

const questionnaireSchema = new mongoose.Schema<IQuestionnaire>(
  {
    name: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    userPhone: {
      type: String,
    },
    toke: {
      type: String,
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    topics: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Topic",
        },
      ],
      validate: {
        validator: function (arr: mongoose.Types.ObjectId[]) {
          return arr.length <= 10;
        },
        message: "A questionnaire can have at most 10 topics",
      },
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

questionnaireSchema.index({ name: 1 }, { unique: true });

const Questionnaire = mongoose.model<IQuestionnaire>(
  "Questionnaire",
  questionnaireSchema,
);

export default Questionnaire;
