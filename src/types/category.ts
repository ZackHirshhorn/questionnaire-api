import { Question } from "./questions";
import { SubCategory } from "./subCategory";

export type Category = {
  id?: string;
  name: string;
  questions: Question[];
  subCategories: SubCategory[];
};
