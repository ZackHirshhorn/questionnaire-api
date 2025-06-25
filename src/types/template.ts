import { Category } from "./category";

export type Template = {
  name: string;
  categories: Category[];
  id?: string;
};
