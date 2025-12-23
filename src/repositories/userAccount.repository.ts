import bcrypt from "bcrypt";
import crypto from "crypto";
import { prisma } from "../config/prisma";

class UserAccountRepository {
  async findOrCreateAccount(userData: {
    email: string;
    name: string;
    password?: string;
  }) {
    const raw = userData.password ?? crypto.randomBytes(8).toString("hex");
    const hashed = await bcrypt.hash(raw, 10);
    return prisma.user.upsert({
      where: { email: userData.email },
      update: { fullName: userData.name },
      create: {
        role: "USER",
        fullName: userData.name,
        email: userData.email,
        password: hashed,
      },
    });
  }
}

export default new UserAccountRepository();
