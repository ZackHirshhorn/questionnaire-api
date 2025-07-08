import { Question } from "./questions";
export type QuestionCol = {
  name: string;
  questions: Question[];
  id?: string;
};
