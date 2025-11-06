import { beforeAll, afterAll, it, expect, describe } from "vitest";
import mongoose from "mongoose";
import request from "supertest";
import { createApp } from "../src/app";

describe("Users API", () => {
  const app = createApp();
  beforeAll(async () => {
    await mongoose.connect("mongodb://127.0.0.1:27017/backoffice_user_manager_test_users");
  });
  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it("creates and lists users", async () => {
    const create = await request(app).post("/api/users").send({ firstName:"A", lastName:"B", password:"secret123" });
    expect(create.status).toBe(201);
    const list = await request(app).get("/api/users?limit=6&page=1");
    expect(list.status).toBe(200);
    expect(Array.isArray(list.body.items)).toBe(true);
  });

  it("prevents first/last name edits when inactive", async () => {
    const create = await request(app).post("/api/users").send({ firstName:"C", lastName:"D", password:"secret123" });
    const id = create.body._id;
    // set inactive
    await request(app).patch(`/api/users/${id}`).send({ status: "inactive" });
    // attempt to change first name
    const patch = await request(app).patch(`/api/users/${id}`).send({ firstName: "X" });
    expect(patch.status).toBe(400);
  });
});
