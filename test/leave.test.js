import supertest from "supertest";
import { app } from "../src/apps/server.js"; // Pastikan path ini sesuai
import {
  createActiveTestUser,
  createTestDepartement,
  generateTestManajerToken,
  generateTestuserToken,
  removeTestDepartement,
  removeTestleaves,
  removeTestuser,
} from "./test-utils.js";
import { prismaClient } from "../src/apps/database.js";

describe("POST /api/v1/leave/draft", () => {
  let userToken;
  let managerToken;
  let leaveId;

  beforeEach(async () => {
    await createTestDepartement();
    await createActiveTestUser();
    userToken = generateTestuserToken();
    managerToken = generateTestManajerToken();
  });

  afterEach(async () => {
    await removeTestleaves();
    await removeTestuser();
    await removeTestDepartement();
  });

  it("should save a new draft", async () => {
    const result = await supertest(app)
      .post("/api/v1/leave/draft")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        startDate: "2024-12-01",
        endDate: "2024-12-05",
        reason: "Test reason for leave",
      });

    expect(result.status).toBe(200);
    expect(result.body.data.status).toBe("DRAFT");
    leaveId = result.body.data.id;
  });

  it("should fail when required fields are missing", async () => {
    const result = await supertest(app)
      .post("/api/v1/leave/draft")
      .set("Authorization", `Bearer ${userToken}`)
      .send({
        reason: "Missing startDate and endDate",
      });

    expect(result.status).toBe(400);
    expect(result.body.errors).toBeDefined();
  });
});

describe("PUT /api/v1/leave/:leaveId/submit", () => {
  let userToken;
  let managerToken;
  let leaveId;

  beforeEach(async () => {
    await createTestDepartement();
    await createActiveTestUser();
    userToken = generateTestuserToken();
    managerToken = generateTestManajerToken();
  });

  afterEach(async () => {
    await removeTestleaves();
    await removeTestuser();
    await removeTestDepartement();
  });

  it("should submit a leave request", async () => {
    const result = await supertest(app)
      .put(`/api/v1/leave/${leaveId}/submit`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(result.status).toBe(200);
    expect(result.body.data.status).toBe("TERKIRIM");
  });

  it("should fail if leaveId does not exist", async () => {
    const result = await supertest(app)
      .put(`/api/v1/leave/invalid-leave-id/submit`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(result.status).toBe(404);
    expect(result.body.errors).toBeDefined();
  });
});
