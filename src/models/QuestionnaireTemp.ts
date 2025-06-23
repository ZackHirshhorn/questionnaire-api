import mongoose from "mongoose";

export interface IQuestionnaireTemp extends Document {
  name: string;
  categories: mongoose.Types.ObjectId[];
}

const questionnaireTempSchema = new mongoose.Schema<IQuestionnaireTemp>(
  {
    name: {
      type: String,
      required: true,
      match: [
        /^[\u0590-\u05FFA-Z](?:[\u0590-\u05FF a-z]*[\u0590-\u05FFa-z])?$/,
        "Questionnaire template name is not valid",
      ],
    },
    categories: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category",
        },
      ],
      validate: {
        validator: function (arr: mongoose.Types.ObjectId[]) {
          return arr.length <= 10;
        },
        message: "A questionnaire can have at most 10 categories",
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

questionnaireTempSchema.index({ name: 1 }, { unique: true });

const QuestionnaireTemp = mongoose.model<IQuestionnaireTemp>(
  "QuestionnaireTemp",
  questionnaireTempSchema,
);

export default QuestionnaireTemp;
