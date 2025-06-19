import { z } from "zod";

export const topicSchema = z.object({
  name: z
    .string({ message: "Topic's name is required" })
    .min(2, "Topic's name must be at least 2 characters")
    .max(50, "Topic's name must be less than 50 characters")
    .regex(
      /^[\u0590-\u05FFA-Z]+(?:[ '"\u0590-\u05FFa-z]*[\u0590-\u05FFa-z]+)*$/,
      "Topic's name is not valid",
    ),
});
export type TopicDTO = z.infer<typeof topicSchema>;
