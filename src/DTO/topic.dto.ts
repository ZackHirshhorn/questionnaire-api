import { z } from "zod";

export const topicSchema = z.object({
  name: z
    .string({ message: "שם הנושא הוא חובה" })
    .min(2, "שם הנושא חייב להכיל לפחות 2 תווים")
    .max(50, "שם הנושא יכול להכיל עד 50 תווים")
    .regex(
      /^[\u0590-\u05FFA-Z]+(?:[ '"\u0590-\u05FFa-z0-9]*[\u0590-\u05FFa-z0-9]+)*$/,
      "שם הנושא לא תקין",
    ),
});
export type TopicDTO = z.infer<typeof topicSchema>;
