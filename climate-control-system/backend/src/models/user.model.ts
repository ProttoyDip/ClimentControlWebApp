import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../config/db";

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: "admin" | "user";
}

export async function createUser(data: {
  name: string;
  email: string;
  passwordHash: string;
  role: "admin" | "user";
}) {
  const [result] = await pool.execute<ResultSetHeader>(
    `INSERT INTO users (name, email, password_hash, role) VALUES (?, ?, ?, ?)`,
    [data.name, data.email, data.passwordHash, data.role]
  );

  return result.insertId;
}

export async function findUserByEmail(email: string) {
  const [rows] = await pool.execute<(User & RowDataPacket)[]>(
    `SELECT id, name, email, password_hash, role FROM users WHERE email = ? LIMIT 1`,
    [email]
  );

  return rows[0] || null;
}

export async function findUserById(id: number) {
  const [rows] = await pool.execute<(User & RowDataPacket)[]>(
    `SELECT id, name, email, password_hash, role FROM users WHERE id = ? LIMIT 1`,
    [id]
  );

  return rows[0] || null;
}
