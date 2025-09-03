// src/services/auth.service.ts

import { prisma } from '../config/prisma';
import { UserRole } from '../generated/prisma'; // Pastikan UserRole diimpor
import { hashPassword, comparePassword } from '../utils/hashing';
import { generateToken } from '../utils/jwt';
import { TokenService } from './token.service';

export const AuthService = {
  registerUser: async (data: any) => {
    const existingUser = await prisma.user.findFirst({
      where: { email: data.email, deletedAt: null },
    });
    if (existingUser) {
      throw new Error('Email sudah terdaftar.');
    }
    const user = await prisma.user.create({
      data: { fullName: data.fullName, email: data.email, role: UserRole.USER },
    });

    const verificationToken = await TokenService.createToken(user.id, 'EMAIL_VERIFICATION');
    await TokenService.sendTokenEmail(user, verificationToken, 'EMAIL_VERIFICATION');

    return user;
  },

  registerTenant: async (data: any) => {
    const existingUser = await prisma.user.findFirst({
      where: { email: data.email, deletedAt: null },
    });
    if (existingUser) throw new Error('Email sudah terdaftar.');

    let user, token;
    const result = await prisma.$transaction(async tx => {
      user = await tx.user.create({
        data: {
          fullName: data.fullName,
          email: data.email,
          role: UserRole.TENANT,
        },
      });
      await tx.tenant.create({
        data: {
          userId: user.id,
          companyName: data.companyName,
          addressCompany: data.addressCompany,
          phoneNumberCompany: data.phoneNumberCompany,
        },
      });
      token = await TokenService.createToken(user.id, 'EMAIL_VERIFICATION', tx);
      return user;
    });

    if (user && token) {
      await TokenService.sendTokenEmail(user, token, 'EMAIL_VERIFICATION');
    }
    return result;
  },

  verifyEmailAndSetPassword: async (token: string, password: string) => {
    const userId = await TokenService.validateAndUseToken(token, 'EMAIL_VERIFICATION');
    const hashedPassword = await hashPassword(password);
    return await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword, verified: true },
    });
  },

  resendVerificationEmail: async (email: string) => {
    const user = await prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
    if (!user) throw new Error('User tidak ditemukan.');
    if (user.verified) throw new Error('Akun ini sudah terverifikasi.');
    const token = await TokenService.createToken(user.id, 'EMAIL_VERIFICATION');
    await TokenService.sendTokenEmail(user, token, 'EMAIL_VERIFICATION');
  },

  // --- KODE LOGIN YANG DIPERBAIKI ---
  login: async (data: any) => {
    const { email, password, type } = data;
    const loginType = type || 'user'; // Default ke 'user' jika 'type' tidak disediakan

    const user = await prisma.user.findFirst({
      where: {
        email: email,
        deletedAt: null,
      },
    });

    if (!user || !user.password) {
      throw new Error('Email atau password salah.');
    }
    if (!user.verified) {
      throw new Error('Akun belum diverifikasi. Silakan cek email Anda.');
    }

    // **Logika Validasi Peran (Role)**
    if (loginType === 'tenant' && user.role !== UserRole.TENANT) {
      throw new Error('Akses ditolak. Anda bukan tenant. Silakan login sebagai pengguna biasa.');
    }
    if (loginType === 'user' && user.role !== UserRole.USER) {
      throw new Error('Akses ditolak. Silakan login melalui halaman login untuk tenant.');
    }

    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Email atau password salah.');
    }
    
    const jwt = generateToken({ 
        id: user.id, 
        role: user.role,
        fullName: user.fullName, 
        email: user.email,
        verified: user.verified,
        createdAt: user.createdAt,
        profilePicture: user.profilePicture
    });
    
    return { user, token: jwt };
  },
  // --- AKHIR PERBAIKAN ---

  requestPasswordReset: async (email: string) => {
    const user = await prisma.user.findFirst({
      where: { email, deletedAt: null },
    });
    // Jangan beri tahu jika user ada atau tidak untuk keamanan
    if (!user || !user.password) {
      return;
    }
    const token = await TokenService.createToken(user.id, 'PASSWORD_RESET');
    await TokenService.sendTokenEmail(user, token, 'PASSWORD_RESET');
  },

  resetPassword: async (token: string, password: string) => {
    const userId = await TokenService.validateAndUseToken(token, 'PASSWORD_RESET');
    const hashedPassword = await hashPassword(password);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });
  },

  getProfile: async (userId: string) => {
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
  },
};