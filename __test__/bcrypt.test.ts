import { hashPassword, comparePassword } from "../src/utils/hashing";

describe("Bcrypt Hashing", () => {
  const testPassword = "testPassword123";

  describe("hashPassword", () => {
    it("should hash a password", async () => {
      const hashedPassword = await hashPassword(testPassword);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(testPassword);
      expect(hashedPassword.length).toBeGreaterThan(0);
    });

    it("should generate different hashes for the same password", async () => {
      const hash1 = await hashPassword(testPassword);
      const hash2 = await hashPassword(testPassword);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe("comparePassword", () => {
    it("should return true for matching password", async () => {
      const hashedPassword = await hashPassword(testPassword);
      const isMatch = await comparePassword(testPassword, hashedPassword);

      expect(isMatch).toBe(true);
    });

    it("should return false for non-matching password", async () => {
      const hashedPassword = await hashPassword(testPassword);
      const isMatch = await comparePassword("wrongPassword", hashedPassword);

      expect(isMatch).toBe(false);
    });
  });
});
