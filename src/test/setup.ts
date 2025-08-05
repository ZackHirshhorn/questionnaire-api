import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import { app } from "../app";
import request from "supertest";
import User, { Role } from "../models/User";

declare global {
  var register: () => Promise<string[]>;
}

let mongo: MongoMemoryServer;

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
  // Register the user with the default role
  const name = "אדמין";
  const email = "admin@admin.com";
  const password = "A123456a!";
  const res = await request(app)
    .post("/api/auth")
    .send({ name, email, password })
    .expect(201);

  // Grab the cookie
  const cookie = res.get("Set-Cookie");
  if (!cookie) {
    throw new Error("Failed to get cookie from response");
  }

  // Find the just-created user and set role to "ADMIN"
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found after registration");
  }
  user.role = Role.Admin;
  await user.save();

  return cookie;
};
