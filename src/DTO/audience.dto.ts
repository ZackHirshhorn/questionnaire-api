import { z } from "zod";

export const audienceSchema = z.object({
  name: z
    .string({ message: "Audience's name is required" })
    .min(2, "Audience's name must be at least 2 characters")
    .max(50, "Audience's name must be less than 50 characters")
    .regex(
      /^[\u0590-\u05FFA-Z]+(?:[ '"\u0590-\u05FFa-z]*[\u0590-\u05FFa-z]+)*$/,
      "Audience's name is not valid",
    ),
});
export type AudienceDTO = z.infer<typeof audienceSchema>;
