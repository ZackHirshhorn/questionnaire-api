import request from "supertest";
import { app } from "../../../app";

it("return 401 on unsuccessful login by email", async () => {
  await request(app)
    .post("/api/auth/login")
    .send({
      email: "test@test55.com",
      password: "A123456a!",
    })
    .expect(401);
});

it("return 401 on unsuccessful login by password", async () => {
  await request(app)
    .post("/api/auth")
    .send({
      name: "טסט",
      email: "test@test.com",
      password: "A123456a!",
    })
    .expect(201);
  await request(app)
    .post("/api/auth/login")
    .send({
      email: "test@test.com",
      password: "passworD1212!",
    })
    .expect(401);
});

it("set a cookie after successful login", async () => {
  await request(app)
    .post("/api/auth")
    .send({
      name: "טסט",
      email: "test@test.com",
      password: "A123456a!",
    })
    .expect(201);
  const res = await request(app)
    .post("/api/auth/login")
    .send({
      email: "test@test.com",
      password: "A123456a!",
    })
    .expect(200);

  expect(res.get("Set-Cookie")).toBeDefined();
});
