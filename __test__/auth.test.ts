import { AuthValidator } from "../src/middleware/validators/auth.validator";
import { validationResult } from "express-validator";
import { Request, Response } from "express";

// Mock request factory
const mockRequest = (body: any = {}, params: any = {}, query: any = {}) => {
  return {
    body,
    params,
    query,
    cookies: {},
    headers: {},
  } as unknown as Request;
};

describe("Auth Validators", () => {
  describe("registerUser", () => {
    it("should pass with valid email and fullName", async () => {
      const req = mockRequest({
        email: "test@example.com",
        fullName: "John Doe",
      });

      await Promise.all(
        AuthValidator.registerUser.map((validation) => validation.run(req))
      );
      const errors = validationResult(req);

      expect(errors.isEmpty()).toBe(true);
    });

    it("should fail with invalid email", async () => {
      const req = mockRequest({
        email: "invalid-email",
        fullName: "John Doe",
      });

      await Promise.all(
        AuthValidator.registerUser.map((validation) => validation.run(req))
      );
      const errors = validationResult(req);

      expect(errors.isEmpty()).toBe(false);
      const errorArray = errors.array();
      expect(errorArray.some((err: any) => err.path === "email")).toBe(true);
    });

    it("should fail with empty fullName", async () => {
      const req = mockRequest({
        email: "test@example.com",
        fullName: "",
      });

      await Promise.all(
        AuthValidator.registerUser.map((validation) => validation.run(req))
      );
      const errors = validationResult(req);

      expect(errors.isEmpty()).toBe(false);
      const errorArray = errors.array();
      expect(errorArray.some((err: any) => err.path === "fullName")).toBe(true);
    });
  });

  describe("login", () => {
    it("should pass with valid credentials", async () => {
      const req = mockRequest({
        email: "test@example.com",
        password: "password123",
      });

      await Promise.all(
        AuthValidator.login.map((validation) => validation.run(req))
      );
      const errors = validationResult(req);

      expect(errors.isEmpty()).toBe(true);
    });

    it("should fail with missing password", async () => {
      const req = mockRequest({
        email: "test@example.com",
      });

      await Promise.all(
        AuthValidator.login.map((validation) => validation.run(req))
      );
      const errors = validationResult(req);

      expect(errors.isEmpty()).toBe(false);
    });
  });

  describe("verify", () => {
    it("should fail with short password", async () => {
      const req = mockRequest({
        token: "some-token",
        password: "123",
      });

      await Promise.all(
        AuthValidator.verify.map((validation) => validation.run(req))
      );
      const errors = validationResult(req);

      expect(errors.isEmpty()).toBe(false);
      const errorArray = errors.array();
      expect(errorArray.some((err: any) => err.path === "password")).toBe(true);
    });
  });
});
