import { describe, expect, it } from "vitest";
import request from "supertest";
import Server from "../src/database/models/server";

describe("Express Server", () => {
  it("should respond to GET /health", async () => {
    const server = new Server(false);
    const app = server.getApp();

    const response = await request(app).get("/health");

    expect(response.status).toBe(200);

    expect(response.body).toEqual({
      status: "ok",
      service: "vaqueros-backend",
    });
  });
});
