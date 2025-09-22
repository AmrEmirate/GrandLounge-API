import { prisma } from '../config/prisma';
import { User, UserRole } from '../../prisma/generated/prisma';
import { hashPassword, comparePassword } from '../utils/hashing';
import { generateToken } from '../utils/jwt';
import { TokenService } from './token.service';

const _checkIfUserExists = async (email: string) => {
    const existingUser = await prisma.user.findFirst({
        where: { email, deletedAt: null },
    });
    if (existingUser) {
        throw new Error('Email sudah terdaftar.');
    }
};

const _createUserAndTenant = (data: any, tx: any) => {
    return tx.user.create({
        data: {
            fullName: data.fullName,
            email: data.email,
            role: UserRole.TENANT,
        },
    });
};

const _createTenantProfile = (data: any, userId: string, tx: any) => {
    return tx.tenant.create({
        data: {
            userId: userId,
            companyName: data.companyName,
            addressCompany: data.addressCompany,
            phoneNumberCompany: data.phoneNumberCompany,
        },
    });
};

const _validateLoginAttempt = async (user: User | null, pass: string) => {
    if (!user || !user.password) throw new Error('Email atau password salah.');
    if (!user.verified) throw new Error('Akun belum diverifikasi. Silakan cek email Anda.');

    const isPasswordValid = await comparePassword(pass, user.password);
    if (!isPasswordValid) throw new Error('Email atau password salah.');
};

const _validateUserRole = (loginType: string, userRole: UserRole) => {
    if (loginType === 'tenant' && userRole !== UserRole.TENANT) {
        throw new Error('Akses ditolak. Anda bukan tenant. Silakan login sebagai pengguna biasa.');
    }
    if (loginType === 'user' && userRole !== UserRole.USER) {
        throw new Error('Akses ditolak. Silakan login melalui halaman login untuk tenant.');
    }
};

export const AuthService = {
    registerUser: async (data: any) => {
        await _checkIfUserExists(data.email);
        const user = await prisma.user.create({
            data: { fullName: data.fullName, email: data.email, role: UserRole.USER },
        });

        const verificationToken = await TokenService.createToken(user.id, 'EMAIL_VERIFICATION');
        await TokenService.sendTokenEmail(user, verificationToken, 'EMAIL_VERIFICATION');

        return user;
    },

    registerTenant: async (data: any) => {
        await _checkIfUserExists(data.email);

        const user = await prisma.$transaction(async tx => {
            const newUser = await _createUserAndTenant(data, tx);
            await _createTenantProfile(data, newUser.id, tx);
            const token = await TokenService.createToken(newUser.id, 'EMAIL_VERIFICATION', tx);
            await TokenService.sendTokenEmail(newUser, token, 'EMAIL_VERIFICATION');
            return newUser;
        });

        return user;
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
        const user = await prisma.user.findFirst({ where: { email, deletedAt: null } });
        if (!user) throw new Error('User tidak ditemukan.');
        if (user.verified) throw new Error('Akun ini sudah terverifikasi.');

        const token = await TokenService.createToken(user.id, 'EMAIL_VERIFICATION');
        await TokenService.sendTokenEmail(user, token, 'EMAIL_VERIFICATION');
    },

    login: async (data: any) => {
        const { email, password, type } = data;
        const loginType = type || 'user';
        const user = await prisma.user.findFirst({ where: { email, deletedAt: null } });

        await _validateLoginAttempt(user, password);
        _validateUserRole(loginType, user!.role);

        const token = generateToken({
            id: user!.id, role: user!.role, fullName: user!.fullName,
            email: user!.email, verified: user!.verified,
            createdAt: user!.createdAt, profilePicture: user!.profilePicture
        });

        return { user, token };
    },

    requestPasswordReset: async (email: string) => {
        const user = await prisma.user.findFirst({
            where: { email, deletedAt: null },
        });
        if (!user || !user.password) return;

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

    confirmEmailChange: async (token: string, newEmail: string) => {
        const userId = await TokenService.validateAndUseToken(token, 'EMAIL_CHANGE');

        const emailExists = await prisma.user.findFirst({
            where: { email: newEmail, deletedAt: null },
        });

        if (emailExists) {
            throw new Error('Alamat email ini sudah digunakan oleh akun lain.');
        }

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                email: newEmail,
                verified: false,
            },
        });

        const newToken = generateToken({
            id: updatedUser.id,
            role: updatedUser.role,
            fullName: updatedUser.fullName,
            email: updatedUser.email,
            verified: updatedUser.verified, // Akan bernilai false
            createdAt: updatedUser.createdAt,
            profilePicture: updatedUser.profilePicture,
        });

        return { token: newToken };
    },

    getProfile: async (userId: string) => {
        return await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true, fullName: true, email: true, role: true,
                profilePicture: true, verified: true,
            },
        });
    },
};