import jwt from "jsonwebtoken";

export function createAccessToken(payload?: { id?: number; email?: string; role?: "admin" | "user" }) {
  return jwt.sign(
    {
      id: payload?.id ?? 1,
      email: payload?.email ?? "admin@test.local",
      role: payload?.role ?? "admin"
    },
    process.env.JWT_ACCESS_SECRET as string,
    { expiresIn: "15m" }
  );
}
