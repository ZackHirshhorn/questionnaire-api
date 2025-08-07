import mongoose from "mongoose";

export interface IQuestion extends Document {
  q: string;
  choice: string[];
  qType: string;
  required: boolean;
  answer?: string;
}

export interface IQuestionsCol extends Document {
  name: string;
  questions: IQuestion[];
}

export interface ITopic extends Document {
  name: string;
  questions: mongoose.Types.ObjectId[];
}

const topicSchema = new mongoose.Schema<ITopic>(
  {
    name: {
      type: String,
      required: true,
      match: [
        /^[\u0590-\u05FFA-Z]+(?:[ '"\u0590-\u05FFa-z0-9]*[\u0590-\u05FFa-z0-9]+)*$/,
        "Topic's name is not valid",
      ],
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "QuestionsCol",
      },
    ],
  },
  {
    toJSON: {
      transform(_doc: any, ret: any) {
        const obj = ret as any;
        delete obj._id;
        delete obj.__v;
      },
    },
  },
);

export interface ISubCategory extends Document {
  name: string;
  questions: string[];
  topics?: ITopic[];
}

const subCategorySchema = new mongoose.Schema<ISubCategory>(
  {
    name: {
      type: String,
      required: true,
      match: [
        /^[\u0590-\u05FFA-Z]+(?:[ '"\u0590-\u05FFa-z0-9]*[\u0590-\u05FFa-z0-9]+)*$/,
        "Sub-category's name is not valid",
      ],
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "QuestionsCol",
      },
    ],
    topics: {
      type: [topicSchema],
      validate: {
        validator: function (arr: ITopic[]) {
          return arr.length <= 10;
        },
        message: "A sub category can have at most 10 topics",
      },
    },
  },
  {
    toJSON: {
      transform(_doc: any, ret: any) {
        const obj = ret as any;
        delete obj._id;
        delete obj.__v;
      },
    },
  },
);

export interface ICategory extends Document {
  name: string;
  questions: string[];
  subCategories?: ISubCategory[];
}

const categorySchema = new mongoose.Schema<ICategory>(
  {
    name: {
      type: String,
      required: true,
      match: [
        /^[\u0590-\u05FFA-Z]+(?:[ '"\u0590-\u05FFa-z0-9]*[\u0590-\u05FFa-z0-9]+)*$/,
        "Category's name is not valid",
      ],
    },
    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "QuestionsCol",
      },
    ],
    subCategories: {
      type: [subCategorySchema],
      validate: {
        validator: function (arr: ISubCategory[]) {
          return arr.length <= 10;
        },
        message: "A category can have at most 10 sub-categories",
      },
    },
  },
  {
    toJSON: {
      transform(_doc: any, ret: any) {
        const obj = ret as any;
        delete obj._id;
        delete obj.__v;
      },
    },
  },
);

export interface IQuestionnaireTemp extends Document {
  name: string;
  categories: ICategory[];
}

const questionnaireTempSchema = new mongoose.Schema<IQuestionnaireTemp>(
  {
    name: {
      type: String,
      required: true,
      match: [
        /^[\u0590-\u05FFA-Z](?:[\u0590-\u05FF a-z0-9]*[\u0590-\u05FFa-z0-9])?$/,
        "Questionnaire template name is not valid",
      ],
    },
    categories: {
      type: [categorySchema],
      validate: {
        validator: function (arr: ICategory[]) {
          return arr.length <= 10;
        },
        message: "A questionnaire can have at most 10 categories",
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc: any, ret: any) {
        const obj = ret as any;
        obj.id = obj._id;
        delete obj._id;
        delete obj.__v;
      },
    },
  },
);

const QuestionnaireTemp = mongoose.model<IQuestionnaireTemp>(
  "QuestionnaireTemp",
  questionnaireTempSchema,
);

export default QuestionnaireTemp;
