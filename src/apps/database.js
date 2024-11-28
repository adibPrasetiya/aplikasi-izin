import { PrismaClient } from "@prisma/client";
import { dbLogger } from "./logger.js";

export const prismaClient = new PrismaClient();

// prismaClient.$use(async (params, next) => {
//   const startTime = Date.now();

//   dbLogger.info("DATABASE QUERY STARTED", {
//     query: params.model + "." + params.action,
//     args: params.args,
//   });

//   const result = await next(params);

//   //logging setelah query selesai
//   const duration = Date.now() - startTime;

//   dbLogger.info("DATABASE QUERY COMPLETED", {
//     query: params.model + "." + params.action,
//     duration: `${duration}ms`,
//     result,
//   });

//   return result;
// });
