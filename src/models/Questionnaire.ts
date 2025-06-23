import mongoose from "mongoose";

export interface IQuestionnaire extends Document {
  user?: mongoose.Types.ObjectId;
  userPhone?: string;
  toke?: string;
  school: mongoose.Types.ObjectId;
  categories: mongoose.Types.ObjectId[];
  template: mongoose.Types.ObjectId;
}

const questionnaireSchema = new mongoose.Schema<IQuestionnaire>(
  {
    template: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "QuestionnaireTemp",
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    userPhone: {
      type: String,
      match: [/^[0-9]{9,10}$/, "User's phone number must contain 9-10 digits"],
    },
    toke: {
      type: String,
    },
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
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

questionnaireSchema.index({ name: 1 }, { unique: true });
questionnaireSchema.index({ user: 1 });
questionnaireSchema.index({ school: 1 });

const Questionnaire = mongoose.model<IQuestionnaire>(
  "Questionnaire",
  questionnaireSchema,
);

export default Questionnaire;
