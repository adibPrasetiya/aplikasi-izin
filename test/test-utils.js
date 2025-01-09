import { prismaClient } from "../src/apps/database.js";
import jwtHandler from "../src/utils/jwt-handler.js";
import passwordHashHandler from "../src/utils/password-hash-handler.js";

export const removeTestDepartement = async () => {
  await prismaClient.departements.deleteMany({
    where: {
      name: {
        startsWith: "Departement Test",
      },
    },
  });
};

export const createTestDepartement = async () => {
  return prismaClient.departements.create({
    data: {
      name: "Departement Test",
      email: "test@departement.go.id",
    },
  });
};

// Fungsi untuk memetakan angka ke huruf (0-25 -> A-Z)
const numberToChar = (number) => {
  const charCode = 65 + (number % 26); // A-Z (ASCII 65-90)
  return String.fromCharCode(charCode);
};

export const createManyTestDepartement = async () => {
  for (let i = 0; i < 15; i++) {
    const name = `Departement Test ${i}`
      .split("")
      .map((char) => (/\d/.test(char) ? numberToChar(Number(char)) : char))
      .join("");
    await prismaClient.departements.create({
      data: {
        name: name,
        email: `test${i}@departement.go.id`,
      },
    });
  }
};

export const findTestDepartement = async () => {
  return prismaClient.departements.findFirst({
    where: {
      name: {
        contains: "Test",
      },
    },
  });
};

export const removeTestuser = async () => {
  await prismaClient.users.deleteMany({
    where: {
      username: {
        contains: "test",
      },
    },
  });
};

export const createTestUser = async () => {
  const departement = await findTestDepartement();
  const { hash, passwordExpiredAt } =
    passwordHashHandler.hashPasswordWithExpiry("P@ssw0rd");
  await prismaClient.users.create({
    data: {
      username: "test1.user",
      name: "Test user",
      email: "test1@test.com",
      password: hash,
      passwordExpiredAt: passwordExpiredAt,
      departementId: departement.departementId,
    },
  });
};

export const createActiveTestUser = async () => {
  const departement = await findTestDepartement();
  const { hash, passwordExpiredAt } =
    passwordHashHandler.hashPasswordWithExpiry("P@ssw0rd");
  await prismaClient.users.create({
    data: {
      username: "test.active",
      name: "Test Active",
      email: "test1@test.com",
      password: hash,
      flagActive: true,
      passwordExpiredAt: passwordExpiredAt,
      departementId: departement.departementId,
    },
  });
};

export const generateTestAdminToken = () => {
  return jwtHandler.createJWT({
    username: "test.admin",
    role: "admin",
  });
};

export const generateTestManajerToken = () => {
  return jwtHandler.createJWT({
    username: "test.manajer",
    role: "manajer",
  });
};

export const generateTestuserToken = () => {
  return jwtHandler.createJWT({
    username: "test.active",
    role: "USER",
    departementName: "Departement Test",
  });
};

export const removeTestleaves = async () => {
  await prismaClient.leaveRequests.deleteMany({});
};

export const createTestLeaves = async () => {
  await prismaClient.leaveRequests.create({
    data: {},
  });
};
