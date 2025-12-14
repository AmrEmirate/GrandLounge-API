import { prisma } from "../config/prisma";
import { User, UserRole } from "@prisma/client";
import ApiError from "./apiError";
import { comparePassword } from "./hashing";

export class AuthUtils {
  static async checkIfUserExists(email: string): Promise<void> {
    const existingUser = await prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
    if (existingUser) {
      throw new ApiError(409, "Email sudah terdaftar.");
    }
  }

  static createUserAndTenant(data: any, tx: any) {
    return tx.user.create({
      data: {
        fullName: data.fullName,
        email: data.email,
        role: UserRole.TENANT,
      },
    });
  }

  static createTenantProfile(data: any, userId: string, tx: any) {
    return tx.tenant.create({
      data: {
        userId: userId,
        companyName: data.companyName,
        addressCompany: data.addressCompany,
        phoneNumberCompany: data.phoneNumberCompany,
      },
    });
  }

  static async validateLoginAttempt(
    user: User | null,
    pass: string
  ): Promise<void> {
    if (!user || !user.password)
      throw new ApiError(401, "Email atau password salah.");
    if (!user.verified)
      throw new ApiError(
        403,
        "Akun belum diverifikasi. Silakan cek email Anda."
      );

    const isPasswordValid = await comparePassword(pass, user.password);
    if (!isPasswordValid) throw new ApiError(401, "Email atau password salah.");
  }

  static validateUserRole(loginType: string, userRole: UserRole): void {
    if (loginType === "tenant" && userRole !== UserRole.TENANT) {
      throw new ApiError(
        403,
        "Akses ditolak. Anda bukan tenant. Silakan login sebagai pengguna biasa."
      );
    }
    if (loginType === "user" && userRole !== UserRole.USER) {
      throw new ApiError(
        403,
        "Akses ditolak. Silakan login melalui halaman login untuk tenant."
      );
    }
  }
}
