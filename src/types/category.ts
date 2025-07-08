import { SubCategory } from "./subCategory";

export type Category = {
  id?: string;
  name: string;
  questions: string[];
  subCategories?: SubCategory[];
};
