import { Question } from "./questions";
import { SubCategory } from "./subCategory";

export type Category = {
  name: string;
  questions: Question[];
  subCategory?: SubCategory;
};
