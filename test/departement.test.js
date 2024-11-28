import supertest from "supertest";
import { app } from "../src/apps/server.js";
import {
  createManyTestDepartement,
  createTestDepartement,
  findTestDepartement,
  generateTestAdminToken,
  generateTestuserToken,
  removeTestDepartement,
} from "./test-utils.js";

describe("POST /api/v1/departement", function () {
  let adminToken;

  beforeEach(async () => {
    adminToken = generateTestAdminToken();
  });

  afterEach(async () => {
    await removeTestDepartement();
  });

  it("should create new departement", async () => {
    const result = await supertest(app)
      .post("/api/v1/departement")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Departement Test",
        email: "test@departement.go.id",
      });

    console.log(result.body);

    expect(result.status).toBe(201);
    expect(result.body.data.departementId).toBeDefined();
    expect(result.body.data.name).toBe("Departement Test");
    expect(result.body.data.email).toBe("test@departement.go.id");
  });

  it("should reject if departement name is existing", async () => {
    await createTestDepartement();

    const result = await supertest(app)
      .post("/api/v1/departement")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Departement Test",
        email: "test1@departement.go.id",
      });

    expect(result.status).toBe(400);
    expect(result.body.data).toBeUndefined();
    expect(result.body.errors).toBeDefined();
  });

  it("should reject if departement email is existing", async () => {
    await createTestDepartement();

    const result = await supertest(app)
      .post("/api/v1/departement")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Departement Test a",
        email: "test@departement.go.id",
      });

    expect(result.status).toBe(400);
    expect(result.body.data).toBeUndefined();
    expect(result.body.errors).toBeDefined();
  });

  it("should reject if departement name is invalid", async () => {
    const result = await supertest(app)
      .post("/api/v1/departement")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Departement Test 123",
        email: "test@departement.go.id",
      });

    expect(result.status).toBe(400);
    expect(result.body.data).toBeUndefined();
    expect(result.body.errors).toBeDefined();
  });

  it("should reject if departement email is invalid", async () => {
    const result = await supertest(app)
      .post("/api/v1/departement")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Departement Test",
        email: "test@departement",
      });

    expect(result.status).toBe(400);
    expect(result.body.data).toBeUndefined();
    expect(result.body.errors).toBeDefined();
  });
});

describe("GET /api/v1/departement/:departementId", function () {
  let userToken;

  beforeEach(async () => {
    userToken = generateTestuserToken();
    await createTestDepartement();
  });

  afterEach(async () => {
    await removeTestDepartement();
  });

  it("should find departement", async () => {
    const departement = await findTestDepartement();

    const result = await supertest(app)
      .get(`/api/v1/departement/${departement.departementId}`)
      .set("Authorization", `Bearer ${userToken}`);

    expect(result.status).toBe(200);
    expect(result.body.data.departementId).toBeDefined();
    expect(result.body.data.name).toBe("Departement Test");
    expect(result.body.data.email).toBe("test@departement.go.id");
  });

  it("should give result 404 if departement is not found", async () => {
    const wrongId = "09ddaa6f-992d-4cee-bbe6-ae43a9813cfc";
    const result = await supertest(app)
      .get(`/api/v1/departement/${wrongId}`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(result.status).toBe(404);
    expect(result.body.data).toBeUndefined();
    expect(result.body.errors).toBeDefined();
  });

  it("should reject request if departement id invalid", async () => {
    const result = await supertest(app)
      .get(`/api/v1/departement/salah`)
      .set("Authorization", `Bearer ${userToken}`);
    expect(result.status).toBe(400);
    expect(result.body.data).toBeUndefined();
    expect(result.body.errors).toBeDefined();
  });
});

describe("PATCH /api/v1/deparetement/:departementId", function () {
  let adminToken;

  beforeEach(async () => {
    adminToken = generateTestAdminToken();
    await createTestDepartement();
  });

  afterEach(async () => {
    await removeTestDepartement();
  });

  it("should update all departement data", async () => {
    const departement = await findTestDepartement();

    const result = await supertest(app)
      .patch(`/api/v1/departement/${departement.departementId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Departement Test Baru",
        email: "test10@departement.go.id",
      });

    expect(result.status).toBe(200);
    expect(result.body.data.departementId).toBe(departement.departementId);
    expect(result.body.data.name).toBe("Departement Test Baru");
    expect(result.body.data.email).toBe("test10@departement.go.id");
    expect(result.body.errors).toBeUndefined();
  });

  it("should update departement name", async () => {
    const departement = await findTestDepartement();

    const result = await supertest(app)
      .patch(`/api/v1/departement/${departement.departementId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Departement Test Baru",
      });

    expect(result.status).toBe(200);
    expect(result.body.data.departementId).toBe(departement.departementId);
    expect(result.body.data.name).toBe("Departement Test Baru");
    expect(result.body.data.email).toBe("test@departement.go.id");
    expect(result.body.errors).toBeUndefined();
  });

  it("should update departement name", async () => {
    const departement = await findTestDepartement();

    const result = await supertest(app)
      .patch(`/api/v1/departement/${departement.departementId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        email: "test10@departement.go.id",
      });

    expect(result.status).toBe(200);
    expect(result.body.data.departementId).toBe(departement.departementId);
    expect(result.body.data.name).toBe("Departement Test");
    expect(result.body.data.email).toBe("test10@departement.go.id");
    expect(result.body.errors).toBeUndefined();
  });

  it("should give 404 response if departement is not found", async () => {
    const wrongId = "09ddaa6f-992d-4cee-bbe6-ae43a9813cfc";
    const result = await supertest(app)
      .patch(`/api/v1/departement/${wrongId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        email: "test10@departement.go.id",
      });

    expect(result.status).toBe(404);
    expect(result.body.data).toBeUndefined();
    expect(result.body.errors).toBeDefined();
  });

  it("should reject request if departement id invalid", async () => {
    const result = await supertest(app)
      .patch(`/api/v1/departement/salah`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        email: "test10@departement.go.id",
      });

    expect(result.status).toBe(400);
    expect(result.body.data).toBeUndefined();
    expect(result.body.errors).toBeDefined();
  });

  it("should reject request if deparetement name invalid", async () => {
    const departement = await findTestDepartement();

    const result = await supertest(app)
      .patch(`/api/v1/departement/${departement.departementId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        name: "Departement Test 10",
      });

    expect(result.status).toBe(400);
    expect(result.body.data).toBeUndefined();
    expect(result.body.errors).toBeDefined();
  });

  it("should reject request if deparetement email invalid", async () => {
    const departement = await findTestDepartement();

    const result = await supertest(app)
      .patch(`/api/v1/departement/${departement.departementId}`)
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        email: "test10@departement",
      });

    expect(result.status).toBe(400);
    expect(result.body.data).toBeUndefined();
    expect(result.body.errors).toBeDefined();
  });
});

describe("DELETE /api/v1/departement/:departementId", function () {
  let adminToken;

  beforeEach(async () => {
    adminToken = await generateTestAdminToken();
    await createTestDepartement();
  });

  afterEach(async () => {
    await removeTestDepartement();
  });

  it("should remove departemenet from db", async () => {
    const departement = await findTestDepartement();

    const result = await supertest(app)
      .delete(`/api/v1/departement/${departement.departementId}`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(result.status).toBe(200);
    expect(result.body.data).toBe("OK");
  });

  it("should give result 404 if departement is not found", async () => {
    const wrongId = "09ddaa6f-992d-4cee-bbe6-ae43a9813cfc";
    const result = await supertest(app)
      .delete(`/api/v1/departement/${wrongId}`)
      .set("Authorization", `Bearer ${adminToken}`);

    expect(result.status).toBe(404);
    expect(result.body.data).toBeUndefined();
    expect(result.body.errors).toBeDefined();
  });

  it("should reject request if departement id invalid", async () => {
    const result = await supertest(app)
      .get(`/api/v1/departement/salah`)
      .set("Authorization", `Bearer ${adminToken}`);
    expect(result.status).toBe(400);
    expect(result.body.data).toBeUndefined();
    expect(result.body.errors).toBeDefined();
  });
});

describe("GET /api/v1/departement", function () {
  beforeEach(async () => {
    await createManyTestDepartement();
  });

  afterEach(async () => {
    await removeTestDepartement();
  });

  it("should can search without params", async () => {
    const result = await supertest(app).get("/api/v1/departement");

    expect(result.status).toBe(200);
    expect(result.body.data.length).toBe(10);
    expect(result.body.paging.page).toBe(1);
    expect(result.body.paging.totalPages).toBe(2);
    expect(result.body.paging.totalItems).toBe(15);
  });

  it("should can search with page params", async () => {
    const result = await supertest(app).get("/api/v1/departement").query({
      page: 2,
    });

    expect(result.status).toBe(200);
    expect(result.body.data.length).toBe(5);
    expect(result.body.paging.page).toBe(2);
    expect(result.body.paging.totalPages).toBe(2);
    expect(result.body.paging.totalItems).toBe(15);
  });

  it("should can search with size params", async () => {
    const result = await supertest(app).get("/api/v1/departement").query({
      size: 3,
      page: 2,
    });

    expect(result.status).toBe(200);
    expect(result.body.data.length).toBe(3);
    expect(result.body.paging.page).toBe(2);
    expect(result.body.paging.totalPages).toBe(5);
    expect(result.body.paging.totalItems).toBe(15);
  });

  it("should can search with name params", async () => {
    const result = await supertest(app).get("/api/v1/departement").query({
      name: "Test B",
    });

    expect(result.status).toBe(200);
    expect(result.body.data.length).toBe(6);
    expect(result.body.paging.page).toBe(1);
    expect(result.body.paging.totalPages).toBe(1);
    expect(result.body.paging.totalItems).toBe(6);
  });

  it("should can search with email params", async () => {
    const result = await supertest(app).get("/api/v1/departement").query({
      email: "test1",
    });

    expect(result.status).toBe(200);
    expect(result.body.data.length).toBe(6);
    expect(result.body.paging.page).toBe(1);
    expect(result.body.paging.totalPages).toBe(1);
    expect(result.body.paging.totalItems).toBe(6);
  });
});
