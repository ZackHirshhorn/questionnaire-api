import request from "supertest";
import { app } from "../../../app";

it("return 201 on successful register", async () => {
  return request(app)
    .post("/api/auth")
    .send({
      name: "טסט",
      email: "test@test.com",
      password: "A123456a!",
    })
    .expect(201);
});

it("return 400 with invalid email", async () => {
  return request(app)
    .post("/api/auth")
    .send({
      name: "טסט",
      email: "testtest.com",
      password: "A123456a!",
    })
    .expect(400);
});

it("return 400 with invalid password", async () => {
  return request(app)
    .post("/api/auth")
    .send({
      name: "טסט",
      email: "test@test.com",
      password: "p",
    })
    .expect(400);
});

it("return 400 with invalid name", async () => {
  return request(app)
    .post("/api/auth")
    .send({
      name: "test",
      email: "test@test.com",
      password: "A123456a!",
    })
    .expect(400);
});

it("return 400 with missing email and/or password and/or name", async () => {
  await request(app)
    .post("/api/auth")
    .send({
      name: "טסט",
      email: "test@test.com",
    })
    .expect(400);
  await request(app)
    .post("/api/auth")
    .send({
      name: "טסט",
      password: "A123456a!",
    })
    .expect(400);
  await request(app)
    .post("/api/auth")
    .send({
      email: "test@test.com",
      password: "A123456a!",
    })
    .expect(400);
  await request(app).post("/api/auth").send({}).expect(400);
});

it("disallows duplicate emails", async () => {
  await request(app)
    .post("/api/auth")
    .send({
      name: "טסט",
      email: "test@test.com",
      password: "A123456a!",
    })
    .expect(201);
  await request(app)
    .post("/api/auth")
    .send({
      name: "טסט",
      email: "test@test.com",
      password: "A123456a!",
    })
    .expect(400);
});

it("set a cookie after successful register", async () => {
  const res = await request(app)
    .post("/api/auth")
    .send({
      name: "טסט",
      email: "test@test.com",
      password: "A123456a!",
    })
    .expect(201);

  expect(res.get("Set-Cookie")).toBeDefined();
});
