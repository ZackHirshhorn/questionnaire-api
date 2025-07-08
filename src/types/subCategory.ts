import { Topic } from "./topic";

export type SubCategory = {
  name: string;
  questions: string[];
  topics?: Topic[];
  id?: string;
};
