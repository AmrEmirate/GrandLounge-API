import { prisma } from "../config/prisma";
import { User, UserRole } from "@prisma/client";
import { hashPassword } from "../utils/hashing";
import { generateToken } from "../utils/jwt";
import TokenService from "./token.service";
import ApiError from "../utils/apiError";
import { AuthUtils } from "../utils/auth.utils";

class AuthService {
  public async registerUser(data: any): Promise<User> {
    await AuthUtils.checkIfUserExists(data.email);
    const user = await prisma.user.create({
      data: { fullName: data.fullName, email: data.email, role: UserRole.USER },
    });

    const verificationToken = await TokenService.createToken(
      user.id,
      "EMAIL_VERIFICATION"
    );
    await TokenService.sendTokenEmail(
      user,
      verificationToken,
      "EMAIL_VERIFICATION"
    );

    return user;
  }

  public async registerTenant(data: any): Promise<User> {
    await AuthUtils.checkIfUserExists(data.email);

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await AuthUtils.createUserAndTenant(data, tx);
      await AuthUtils.createTenantProfile(data, newUser.id, tx);
      const token = await TokenService.createToken(
        newUser.id,
        "EMAIL_VERIFICATION",
        tx
      );
      await TokenService.sendTokenEmail(newUser, token, "EMAIL_VERIFICATION");
      return newUser;
    });

    return user;
  }

  public async verifyEmailAndSetPassword(
    token: string,
    password: string
  ): Promise<User> {
    const userId = await TokenService.validateAndUseToken(
      token,
      "EMAIL_VERIFICATION"
    );
    const hashedPassword = await hashPassword(password);
    return await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword, verified: true },
    });
  }

  public async resendVerificationEmail(email: string): Promise<void> {
    const user = await prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
    if (!user) throw new ApiError(404, "User tidak ditemukan.");
    if (user.verified) throw new ApiError(400, "Akun ini sudah terverifikasi.");

    const token = await TokenService.createToken(user.id, "EMAIL_VERIFICATION");
    await TokenService.sendTokenEmail(user, token, "EMAIL_VERIFICATION");
  }

  public async login(data: any): Promise<{ user: User; token: string }> {
    const { email, password, type } = data;
    const loginType = type || "user";
    const user = await prisma.user.findFirst({
      where: { email, deletedAt: null },
    });

    await AuthUtils.validateLoginAttempt(user, password);
    AuthUtils.validateUserRole(loginType, user!.role);

    const token = generateToken({
      id: user!.id,
      role: user!.role,
      fullName: user!.fullName,
      email: user!.email,
      verified: user!.verified,
      createdAt: user!.createdAt,
      profilePicture: user!.profilePicture,
    });

    return { user: user!, token };
  }

  public async requestPasswordReset(email: string): Promise<void> {
    const user = await prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
    if (!user || !user.password) return;

    const token = await TokenService.createToken(user.id, "PASSWORD_RESET");
    await TokenService.sendTokenEmail(user, token, "PASSWORD_RESET");
  }

  public async resetPassword(token: string, password: string): Promise<void> {
    const userId = await TokenService.validateAndUseToken(
      token,
      "PASSWORD_RESET"
    );
    const hashedPassword = await hashPassword(password);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  }

  public async confirmEmailChange(
    token: string,
    newEmail: string
  ): Promise<{ token: string }> {
    const userId = await TokenService.validateAndUseToken(
      token,
      "EMAIL_CHANGE"
    );
    const emailExists = await prisma.user.findFirst({
      where: { email: newEmail, deletedAt: null },
    });
    if (emailExists) {
      throw new ApiError(
        409,
        "Alamat email ini sudah digunakan oleh akun lain."
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { email: newEmail, verified: false },
    });

    const newToken = generateToken({
      id: updatedUser.id,
      role: updatedUser.role,
      fullName: updatedUser.fullName,
      email: updatedUser.email,
      verified: updatedUser.verified,
      createdAt: updatedUser.createdAt,
      profilePicture: updatedUser.profilePicture,
    });

    return { token: newToken };
  }

  public async getProfile(userId: string) {
    return await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        profilePicture: true,
        verified: true,
      },
    });
  }
}

export default new AuthService();
