import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { createHash, randomBytes } from "node:crypto";
import { env } from "../config/env";
import {
  clearPasswordResetToken,
  createUser,
  findUserByEmail,
  findUserByValidResetToken,
  savePasswordResetToken,
  updateUserPassword
} from "../models/user.model";
import { ApiError } from "../utils/apiError";
import { sendPasswordResetEmail } from "./mail.service";

function hashResetToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

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

export async function requestPasswordReset(payload: { email: string }) {
  const user = await findUserByEmail(payload.email);
  if (!user) {
    return { message: "If that email exists, a reset link has been sent." };
  }

  if (user.reset_token_expiry) {
    const expiryMs = new Date(user.reset_token_expiry).getTime();
    const remainingMs = expiryMs - Date.now();
    const cooldownWindowMs =
      (env.PASSWORD_RESET_TOKEN_TTL_MINUTES * 60 - env.PASSWORD_RESET_COOLDOWN_SECONDS) * 1000;

    if (remainingMs > cooldownWindowMs) {
      if (env.NODE_ENV !== "production") {
        console.info("[auth] Password reset request ignored during cooldown", {
          userId: user.id,
          email: user.email,
          cooldownRemainingMs: Math.max(remainingMs - cooldownWindowMs, 0)
        });
      }

      return { message: "If that email exists, a reset link has been sent." };
    }
  }

  const plainToken = randomBytes(32).toString("hex");
  const tokenHash = hashResetToken(plainToken);
  const expiresAt = new Date(Date.now() + env.PASSWORD_RESET_TOKEN_TTL_MINUTES * 60 * 1000);

  await savePasswordResetToken(user.id, tokenHash, expiresAt);

  const resetUrl = `${env.APP_URL}/reset-password/${plainToken}`;
  try {
    await sendPasswordResetEmail({ toEmail: user.email, resetUrl });
  } catch (error) {
    await clearPasswordResetToken(user.id);

    console.warn("[auth] Reset token cleared after email failure", {
      userId: user.id,
      email: user.email,
      error: error instanceof Error ? error.message : String(error)
    });

    throw error;
  }

  return { message: "If that email exists, a reset link has been sent." };
}

export async function resetPassword(payload: { token: string; password: string }) {
  const tokenHash = hashResetToken(payload.token);
  const user = await findUserByValidResetToken(tokenHash);

  if (!user) {
    throw new ApiError(400, "Invalid or expired reset token");
  }

  const passwordHash = await bcrypt.hash(payload.password, 12);
  await updateUserPassword(user.id, passwordHash);
  await clearPasswordResetToken(user.id);

  return { message: "Password reset successful" };
}
