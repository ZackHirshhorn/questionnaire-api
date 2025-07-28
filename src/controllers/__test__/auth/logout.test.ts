import request from "supertest";
import { app } from "../../../app";

it("return 200 on successful logout", async () => {
  await request(app)
    .post("/api/auth")
    .send({
      name: "טסט",
      email: "test@test.com",
      password: "A123456a!",
    })
    .expect(201);
  await request(app).post("/api/auth/logout").expect(200);
});
