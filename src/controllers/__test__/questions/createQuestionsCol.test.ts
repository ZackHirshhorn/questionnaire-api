import request from "supertest";
import { app } from "../../../app";
import User, { Role } from "../../../models/User";

const agent = request.agent(app);

it("returns 201 on successful creating questions collection", async () => {
  // 1) Log in with the agent
  const registerRes = await agent
    .post("/api/auth")
    .send({
      name: "אדמין",
      email: "admin@admin.com",
      password: "A123456a!",
    })
    .expect(201);

  expect(registerRes.get("Set-Cookie")).toBeDefined();

  const user = await User.findOne({ email: "admin@admin.com" });
  if (!user) {
    throw new Error("User not found");
  }
  user.role = Role.Admin;
  await user.save();

  const loginRes = await agent
    .post("/api/auth/login")
    .send({
      email: "admin@admin.com",
      password: "A123456a!",
    })
    .expect(200);
  expect(loginRes.get("Set-Cookie")).toBeDefined();

  await agent
    .post("/api/questions")
    .send({
      colName: "אסופת שאלות",
      questions: [
        { q: "שאלה 1", qType: "open", required: true },
        {
          q: "שאלה 2",
          qType: "multiple choice",
          choice: ["א", "ב", "ג", "ד"],
          required: true,
        },
      ],
    })
    .expect(201);
});
