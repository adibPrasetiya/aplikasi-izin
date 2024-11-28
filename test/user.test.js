import supertest from "supertest";
import {
  createActiveTestUser,
  createTestDepartement,
  createTestUser,
  findTestDepartement,
  generateTestuserToken,
  removeTestDepartement,
  removeTestuser,
} from "./test-utils.js";
import { app } from "../src/apps/server.js";
import jwtHandler from "../src/utils/jwt-handler.js";
import { prismaClient } from "../src/apps/database.js";

describe("POST /api/v1/user", function () {
  beforeEach(async () => {
    await createTestDepartement();
  });

  afterEach(async () => {
    await removeTestuser();
    await removeTestDepartement();
  });

  it("should create new user", async () => {
    const departement = await findTestDepartement();
    const result = await supertest(app).post("/api/v1/user").send({
      username: "test.user",
      email: "test@test.com",
      name: "Test user",
      password: "P@ssw0rd",
      departementId: departement.departementId,
    });

    expect(result.status).toBe(201);
    expect(result.body.data.name).toBe("Test user");
    expect(result.body.data.username).toBe("test.user");
    expect(result.body.data.email).toBe("test@test.com");
    expect(result.body.data.departement).toBeDefined();
    expect(result.body.data.password).toBeUndefined();
    expect(result.body.data.passwordExpiredAt).toBeUndefined();
    expect(result.body.errors).toBeUndefined();
  });

  it("should reject if username already exist", async () => {
    await createTestUser();
    const departement = await findTestDepartement();
    const result = await supertest(app).post("/api/v1/user").send({
      username: "test1.user",
      email: "test@test.com",
      name: "Test user",
      password: "P@ssw0rd",
      departementId: departement.departementId,
    });

    expect(result.status).toBe(400);
    expect(result.body.data).toBeUndefined();
    expect(result.body.errors).toBeDefined();
  });

  it("should reject if email already exist", async () => {
    await createTestUser();
    const departement = await findTestDepartement();
    const result = await supertest(app).post("/api/v1/user").send({
      username: "test.user",
      email: "test1@test.com",
      name: "Test user",
      password: "P@ssw0rd",
      departementId: departement.departementId,
    });

    expect(result.status).toBe(400);
    expect(result.body.data).toBeUndefined();
    expect(result.body.errors).toBeDefined();
  });

  it("should reject if password doen't match the requirement", async () => {
    const departement = await findTestDepartement();
    const result = await supertest(app).post("/api/v1/user").send({
      username: "test.user",
      email: "test@test.com",
      name: "Test user",
      password: "password",
      departementId: departement.departementId,
    });

    expect(result.status).toBe(400);
    expect(result.body.data).toBeUndefined();
    expect(result.body.errors).toBeDefined();
  });
});

describe("POST /api/v1/user/login", function () {
  beforeEach(async () => {
    await createTestDepartement();
    await createActiveTestUser();
  });

  afterEach(async () => {
    await removeTestuser();
    await removeTestDepartement();
  });

  it("should login successfully and return valid JWT token", async () => {
    const result = await supertest(app).post("/api/v1/user/login").send({
      username: "test.active",
      password: "P@ssw0rd",
    });

    expect(result.status).toBe(200);
    expect(result.body.data).toBe("Berhasil login");
    expect(result.headers.authorization).toMatch(/^Bearer\s.+$/);

    const token = result.headers.authorization.split(" ")[1];
    const decoded = jwtHandler.verifyJWT(token);

    expect(decoded).toHaveProperty("username", "test.active");
    expect(decoded).toHaveProperty("role");
    expect(decoded).toHaveProperty("departementName");
    expect(decoded).toHaveProperty("passwordExpiredAt");
  });

  it("should reject login if username is not found", async () => {
    const result = await supertest(app).post("/api/v1/user/login").send({
      username: "invalid.user",
      password: "P@ssw0rd",
    });

    expect(result.status).toBe(400);
    expect(result.body.data).toBeUndefined();
    expect(result.body.errors).toContain(
      "Username atau password salah, atau akun belum aktif"
    );
  });

  it("should reject login if password is incorrect", async () => {
    const result = await supertest(app).post("/api/v1/user/login").send({
      username: "test.active",
      password: "WrongPassword",
    });

    expect(result.status).toBe(400);
    expect(result.body.data).toBeUndefined();
    expect(result.body.errors).toContain("Username atau password salah");
  });

  it("should reject login if account is not active", async () => {
    // Update user flagActive menjadi false
    await prismaClient.users.update({
      where: { username: "test.active" },
      data: { flagActive: false },
    });

    const result = await supertest(app).post("/api/v1/user/login").send({
      username: "test.active",
      password: "P@ssw0rd",
    });

    expect(result.status).toBe(400);
    expect(result.body.data).toBeUndefined();
    expect(result.body.errors).toContain(
      "Username atau password salah, atau akun belum aktif"
    );
  });

  it("should reject login if password has expired", async () => {
    // Update passwordExpiredAt menjadi tanggal lampau
    await prismaClient.users.update({
      where: { username: "test.active" },
      data: { passwordExpiredAt: new Date(Date.now() - 1000 * 60 * 60 * 24) }, // Expired kemarin
    });

    const result = await supertest(app).post("/api/v1/user/login").send({
      username: "test.user",
      password: "P@ssw0rd",
    });

    expect(result.status).toBe(400);
    expect(result.body.data).toBeUndefined();
    expect(result.body.errors).toContain("Username atau password salah");
  });
});

describe("PUT /api/v1/user/current", function () {
  let userActiveToken;
  beforeEach(async () => {
    await createTestDepartement();
    await createActiveTestUser();
    userActiveToken = generateTestuserToken();
  });

  afterEach(async () => {
    await removeTestuser();
    await removeTestDepartement();
  });

  it("should update user data", async () => {
    const result = await supertest(app)
      .patch("/api/v1/user/current")
      .set("Authorization", `Bearer ${userActiveToken}`)
      .send({
        name: "Test user baru",
        newPassword: "Password",
        currentPassword: "P@ssw0rd",
      });

    expect(result.status).toBe(200);
    expect(result.body.data.name).toBe("Test user baru");
    expect(result.body.data.email).toBe("test1@test.com");
    expect(result.headers.authorization).toMatch(/^Bearer\s.+$/);
    expect(result.headers.authorization).not.toEqual(userActiveToken);

    const token = result.headers.authorization.split(" ")[1];
    const decoded = jwtHandler.verifyJWT(token);

    expect(decoded).toHaveProperty("username", "test.active");
    expect(decoded).toHaveProperty("role", "STAFF");
    expect(decoded).toHaveProperty("departementName");
    expect(decoded).toHaveProperty("passwordExpiredAt");
  });

  it("should update user name only", async () => {
    const result = await supertest(app)
      .patch("/api/v1/user/current")
      .set("Authorization", `Bearer ${userActiveToken}`)
      .send({
        name: "Test user baru",
        currentPassword: "P@ssw0rd",
      });

    console.log(result.body);

    expect(result.status).toBe(200);
    expect(result.body.data.name).toBe("Test user baru");
    expect(result.body.data.email).toBe("test1@test.com");
    expect(result.headers.authorization).toMatch(/^Bearer\s.+$/);
    expect(result.headers.authorization).not.toEqual(userActiveToken);

    const token = result.headers.authorization.split(" ")[1];
    const decoded = jwtHandler.verifyJWT(token);

    expect(decoded).toHaveProperty("username", "test.active");
    expect(decoded).toHaveProperty("role", "STAFF");
    expect(decoded).toHaveProperty("departementName");
    expect(decoded).toHaveProperty("passwordExpiredAt");
  });
});

describe("GET /api/v1/user/current/logout", function () {
  let userActiveToken;

  beforeEach(async () => {
    userActiveToken = generateTestuserToken();
  });

  it("should logout user", async () => {
    const result = await supertest(app)
      .get("/api/v1/user/current/logout")
      .set("Authorization", `Bearer ${userActiveToken}`);

    expect(result.status).toBe(200);
    expect(result.body.data).toBe("Berhasil logout");
    expect(result.headers.authorization).toBe("");
  });
});
