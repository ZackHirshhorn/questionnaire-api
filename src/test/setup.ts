import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { app } from "../app";
import request from "supertest";

declare global {
  var register: () => Promise<string[]>;
}

let mongo: any;

beforeAll(async () => {
  process.env.JWT_SECRET = "asdf";
  mongo = await MongoMemoryServer.create();
  const mongoUri = mongo.getUri();

  await mongoose.connect(mongoUri, {});
});

beforeEach(async () => {
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();
    for (let collection of collections) {
      await collection.deleteMany({});
    }
  }
});

afterAll(async () => {
  if (mongo) {
    await mongo.stop();
  }
  await mongoose.connection.close();
});

globalThis.register = async () => {
  const name = "טסט";
  const email = "test@test.com";
  const password = "A123456a!";
  const res = await request(app)
    .post("/api/auth")
    .send({
      name,
      email,
      password,
    })
    .expect(201);

  const cookie = res.get("Set-Cookie");
  if (!cookie) {
    throw new Error("Failed to get cookie from response");
  }
  return cookie;
};
