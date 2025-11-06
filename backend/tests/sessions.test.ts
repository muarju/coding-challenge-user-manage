import { beforeAll, afterAll, it, expect, describe } from "vitest";
import mongoose from "mongoose";
import request from "supertest";
import { createApp } from "../src/app";

describe("Sessions API", () => {
  const app = createApp();
  let userId: string = "";

  beforeAll(async () => {
    await mongoose.connect("mongodb://127.0.0.1:27017/backoffice_user_manager_test_sessions");
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
  });

  it("signs up a user and creates a session", async () => {
    const res = await request(app).post("/api/sessions/signup").send({
      firstName: "John",
      lastName: "Tester",
      password: "secret123"
    });
    expect(res.status).toBe(201);
    expect(res.body.sessionId).toBeTruthy();
    userId = res.body.user._id;

    // login counter is incremented on session creation
    const list = await request(app).get("/api/users?limit=6&page=1");
    const u = list.body.items.find((x: any) => x._id === userId);
    expect(u).toBeTruthy();
    expect(u.logins).toBeGreaterThan(0);
  });

  it("signs in with correct password and increments logins", async () => {
    const before = await request(app).get("/api/users?limit=100&page=1");
    const prev = (before.body.items.find((x: any) => x._id === userId || (x.firstName === "John" && x.lastName === "Tester")) || { logins: 0 }).logins;

    const res = await request(app).post("/api/sessions/signin").send({
      firstName: "John",
      lastName: "Tester",
      password: "secret123"
    });
    expect(res.status).toBe(200);
    expect(res.body.sessionId).toBeTruthy();

    const after = await request(app).get("/api/users?limit=100&page=1");
    const now = (after.body.items.find((x: any) => x._id === userId || (x.firstName === "John" && x.lastName === "Tester")) || { logins: 0 }).logins;
    expect(now).toBe(prev + 1);
  });

  it("rejects invalid credentials with 401", async () => {
    const res = await request(app).post("/api/sessions/signin").send({
      firstName: "John",
      lastName: "Tester",
      password: "wrongpass"
    });
    expect(res.status).toBe(401);
    expect(res.body.error).toBeDefined();
  });

  it("blocks inactive users from signing in with 403", async () => {
    // deactivate the user first
    await request(app).patch(`/api/users/${userId}`).send({ status: "inactive" });

    const res = await request(app).post("/api/sessions/signin").send({
      firstName: "John",
      lastName: "Tester",
      password: "secret123"
    });
    expect(res.status).toBe(403);
    expect(String(res.body.error || "").toLowerCase()).toContain("inactive");
  });
});
