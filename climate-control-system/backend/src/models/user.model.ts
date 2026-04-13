import { ResultSetHeader, RowDataPacket } from "mysql2";
import { pool } from "../config/db";

export interface User {
  id: number;
  name: string;
  email: string;
  password_hash: string;
  role: "admin" | "user";
  reset_token: string | null;
  reset_token_expiry: string | null;
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
    `SELECT id, name, email, password_hash, role, reset_token, reset_token_expiry
     FROM users WHERE email = ? LIMIT 1`,
    [email]
  );

  return rows[0] || null;
}

export async function findUserById(id: number) {
  const [rows] = await pool.execute<(User & RowDataPacket)[]>(
    `SELECT id, name, email, password_hash, role, reset_token, reset_token_expiry
     FROM users WHERE id = ? LIMIT 1`,
    [id]
  );

  return rows[0] || null;
}

export async function savePasswordResetToken(userId: number, tokenHash: string, expiresAt: Date) {
  await pool.execute<ResultSetHeader>(
    `UPDATE users
     SET reset_token = ?, reset_token_expiry = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [tokenHash, expiresAt, userId]
  );
}

export async function clearPasswordResetToken(userId: number) {
  await pool.execute<ResultSetHeader>(
    `UPDATE users
     SET reset_token = NULL, reset_token_expiry = NULL, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [userId]
  );
}

export async function findUserByValidResetToken(tokenHash: string) {
  const [rows] = await pool.execute<(User & RowDataPacket)[]>(
    `SELECT id, name, email, password_hash, role, reset_token, reset_token_expiry
     FROM users
     WHERE reset_token = ?
       AND reset_token_expiry IS NOT NULL
       AND reset_token_expiry > CURRENT_TIMESTAMP
     LIMIT 1`,
    [tokenHash]
  );

  return rows[0] || null;
}

export async function updateUserPassword(userId: number, passwordHash: string) {
  await pool.execute<ResultSetHeader>(
    `UPDATE users
     SET password_hash = ?, updated_at = CURRENT_TIMESTAMP
     WHERE id = ?`,
    [passwordHash, userId]
  );
}
