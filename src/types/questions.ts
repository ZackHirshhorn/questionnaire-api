export type Question = {
  q: string;
  choice: string[];
  qType: string;
  required: boolean;
  answer?: string;
};
