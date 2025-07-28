import request from "supertest";
import { app } from "../../../app";

it("return 201 on successful creating questions collection", async () => {
  const agent = request.agent(app);

  // 1) agent logs in, stores the cookie internally
  await agent
    .post("/api/auth")
    .send({
      name: "אדמין",
      email: "admin@admin.com",
      password: "A123456a!",
      role: "ADMIN",
    })
    .expect(201);

  // 2) agent will automatically send that cookie on subsequent calls
  await agent
    .post("/api/questions")
    .send({
      colName: "אסופת שאלות",
      questions: [
        { q: "שאלה 1", qType: "open", required: true },
        {
          q: "שאלה 2",
          qType: "multiple choice",
          choice: ["א", "ב", "ג", "ד"],
          required: true,
        },
      ],
    })
    .expect(201);
});
