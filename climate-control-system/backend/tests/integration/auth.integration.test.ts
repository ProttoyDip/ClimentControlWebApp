import bcrypt from "bcryptjs";
import request from "supertest";
import { createApp } from "../../src/app";
import * as userModel from "../../src/models/user.model";

jest.mock("../../src/models/user.model", () => ({
  findUserByEmail: jest.fn(),
  createUser: jest.fn()
}));

const findUserByEmailMock = userModel.findUserByEmail as unknown as jest.Mock;
const createUserMock = userModel.createUser as unknown as jest.Mock;

describe("Auth integration", () => {
  const app = createApp();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("registers a new user", async () => {
    findUserByEmailMock.mockResolvedValueOnce(null);
    createUserMock.mockResolvedValueOnce(101);

    const response = await request(app).post("/api/auth/register").send({
      name: "Admin Test",
      email: "admin@test.local",
      password: "StrongPass123",
      role: "admin"
    });

    expect(response.status).toBe(201);
    expect(response.body.data).toEqual({ id: 101, email: "admin@test.local" });
    expect(createUserMock).toHaveBeenCalledTimes(1);
  });

  it("fails login with wrong password", async () => {
    const hash = await bcrypt.hash("CorrectPassword123", 4);

    findUserByEmailMock.mockResolvedValueOnce({
      id: 1,
      name: "User",
      email: "user@test.local",
      password_hash: hash,
      role: "user"
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "user@test.local",
      password: "WrongPassword123"
    });

    expect(response.status).toBe(401);
    expect(response.body.message).toBe("Invalid credentials");
  });

  it("returns access and refresh tokens on successful login", async () => {
    const hash = await bcrypt.hash("CorrectPassword123", 4);

    findUserByEmailMock.mockResolvedValueOnce({
      id: 1,
      name: "User",
      email: "user@test.local",
      password_hash: hash,
      role: "admin"
    });

    const response = await request(app).post("/api/auth/login").send({
      email: "user@test.local",
      password: "CorrectPassword123"
    });

    expect(response.status).toBe(200);
    expect(response.body.data.accessToken).toBeTruthy();
    expect(response.body.data.refreshToken).toBeTruthy();
    expect(response.body.data.user).toEqual({
      id: 1,
      name: "User",
      email: "user@test.local",
      role: "admin"
    });
  });
});
