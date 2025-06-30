import { Topic } from "./topic";
import { Question } from "./questions";

export type SubCategory = {
  name: string;
  questions: Question[];
  topics?: Topic[];
  id?: string;
};
