import { Question } from "./questions";
export type Topic = {
  name: string;
  questions: Question[];
  id?: string;
};
