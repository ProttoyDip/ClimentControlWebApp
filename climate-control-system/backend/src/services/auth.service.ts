import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { createUser, findUserByEmail } from "../models/user.model";
import { ApiError } from "../utils/apiError";

export async function registerUser(payload: {
  name: string;
  email: string;
  password: string;
  role?: "admin" | "user";
}) {
  const existing = await findUserByEmail(payload.email);
  if (existing) {
    throw new ApiError(409, "Email is already registered");
  }

  const passwordHash = await bcrypt.hash(payload.password, 12);
  const userId = await createUser({
    name: payload.name,
    email: payload.email,
    passwordHash,
    role: payload.role || "user"
  });

  return { id: userId, email: payload.email };
}

export async function loginUser(payload: { email: string; password: string }) {
  const user = await findUserByEmail(payload.email);
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isPasswordValid = await bcrypt.compare(payload.password, user.password_hash);
  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid credentials");
  }

  const accessToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.JWT_ACCESS_SECRET,
    { expiresIn: env.JWT_ACCESS_EXPIRES_IN as jwt.SignOptions["expiresIn"] }
  );

  const refreshToken = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    env.JWT_REFRESH_SECRET,
    { expiresIn: env.JWT_REFRESH_EXPIRES_IN as jwt.SignOptions["expiresIn"] }
  );

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  };
}
