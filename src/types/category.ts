import { SubCategory } from "./subCategory";

export type Category = {
  name: string;
  questions: string[];
  subCategories?: SubCategory[];
};
