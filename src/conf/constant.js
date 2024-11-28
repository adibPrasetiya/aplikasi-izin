import { config } from "dotenv";

config();

export const APP_PORT = process.env.APP_PORT;
export const APP_JWT_SECRET = process.env.APP_JWT_SECRET;
