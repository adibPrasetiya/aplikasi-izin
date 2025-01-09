import { config } from "dotenv";

config();

export const APP_PORT = process.env.APP_PORT;
export const APP_JWT_SECRET = process.env.APP_JWT_SECRET;
export const DB_HOST = process.env.DB_HOST;
export const DB_USER = process.env.DB_USER;
export const DB_PASSWORD = process.env.DB_PASSWORD;
export const DB_NAME = process.env.DB_NAME;
