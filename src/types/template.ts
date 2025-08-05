import { Category } from "./category";
import mongoose from "mongoose";

export type Template = {
  name: string;
  categories: Category[];
  questions: mongoose.Types.ObjectId[];
  id?: string;
};
