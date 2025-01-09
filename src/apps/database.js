import mysql from "mysql2/promise";
import { DB_HOST, DB_NAME, DB_PASSWORD, DB_USER } from "../conf/constant.js";
import { dbLogger } from "./logger.js";

const pool = mysql.createPool({
  host: DB_HOST,
  user: DB_USER,
  password: DB_PASSWORD,
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export const query = async (sql, params) => {
  const connection = await pool.getConnection();
  try {
    const startTime = Date.now();

    dbLogger.info("DATABASE QUERY STARTED", {
      query: sql,
      params,
    });

    const [rows] = await connection.query(sql, params);

    const duration = Date.now() - startTime;

    dbLogger.info("DATABASE QUERY COMPLETED", {
      query: sql,
      duration: `${duration}ms`,
      result: rows,
    });

    return rows;
  } catch (error) {
    dbLogger.error("DATABASE QUERY FAILED", {
      query: sql,
      params,
      error: error.message,
    });
    throw error;
  } finally {
    connection.release();
  }
};
