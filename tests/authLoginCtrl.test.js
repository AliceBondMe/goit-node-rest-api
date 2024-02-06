import request from "supertest";
import { app } from "../app";
import "dotenv/config";

describe("Login Controller", () => {
  it("should return token and user object with email and subscription", async () => {
    // Previously created a test user in the DB
    const testUser = {
      email: "test@example.com",
      password: "testpassword",
    };

    // Sending a request to login test User
    const response = await request(app).post("/api/users/login").send(testUser);

    expect(response.status).toBe(200);

    expect(response.body).toHaveProperty("token");

    expect(response.body).toHaveProperty("user");
    expect(response.body.user).toHaveProperty("email", testUser.email);
  });
});
