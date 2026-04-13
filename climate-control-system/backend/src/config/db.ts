import mysql from "mysql2/promise";
import { env } from "./env";

export const pool = mysql.createPool({
  host: env.MYSQL_HOST,
  port: env.MYSQL_PORT,
  user: env.MYSQL_USER,
  password: env.MYSQL_PASSWORD,
  database: env.MYSQL_DATABASE,
  connectionLimit: 10
});

export async function checkDatabaseConnection() {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
  } catch (error) {
    const details = error as { code?: string; message?: string };
    const reason = details.message || details.code || "Unknown database connection error";
    throw new Error(
      `MySQL connection failed (${env.MYSQL_HOST}:${env.MYSQL_PORT}/${env.MYSQL_DATABASE}) - ${reason}`
    );
  }
}
