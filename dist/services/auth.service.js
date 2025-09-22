"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const prisma_1 = require("../config/prisma");
const prisma_2 = require("../generated/prisma");
const hashing_1 = require("../utils/hashing");
const jwt_1 = require("../utils/jwt");
const token_service_1 = require("./token.service");
const _checkIfUserExists = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const existingUser = yield prisma_1.prisma.user.findFirst({
        where: { email, deletedAt: null },
    });
    if (existingUser) {
        throw new Error('Email sudah terdaftar.');
    }
});
const _createUserAndTenant = (data, tx) => {
    return tx.user.create({
        data: {
            fullName: data.fullName,
            email: data.email,
            role: prisma_2.UserRole.TENANT,
        },
    });
};
const _createTenantProfile = (data, userId, tx) => {
    return tx.tenant.create({
        data: {
            userId: userId,
            companyName: data.companyName,
            addressCompany: data.addressCompany,
            phoneNumberCompany: data.phoneNumberCompany,
        },
    });
};
const _validateLoginAttempt = (user, pass) => __awaiter(void 0, void 0, void 0, function* () {
    if (!user || !user.password)
        throw new Error('Email atau password salah.');
    if (!user.verified)
        throw new Error('Akun belum diverifikasi. Silakan cek email Anda.');
    const isPasswordValid = yield (0, hashing_1.comparePassword)(pass, user.password);
    if (!isPasswordValid)
        throw new Error('Email atau password salah.');
});
const _validateUserRole = (loginType, userRole) => {
    if (loginType === 'tenant' && userRole !== prisma_2.UserRole.TENANT) {
        throw new Error('Akses ditolak. Anda bukan tenant. Silakan login sebagai pengguna biasa.');
    }
    if (loginType === 'user' && userRole !== prisma_2.UserRole.USER) {
        throw new Error('Akses ditolak. Silakan login melalui halaman login untuk tenant.');
    }
};
exports.AuthService = {
    registerUser: (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield _checkIfUserExists(data.email);
        const user = yield prisma_1.prisma.user.create({
            data: { fullName: data.fullName, email: data.email, role: prisma_2.UserRole.USER },
        });
        const verificationToken = yield token_service_1.TokenService.createToken(user.id, 'EMAIL_VERIFICATION');
        yield token_service_1.TokenService.sendTokenEmail(user, verificationToken, 'EMAIL_VERIFICATION');
        return user;
    }),
    registerTenant: (data) => __awaiter(void 0, void 0, void 0, function* () {
        yield _checkIfUserExists(data.email);
        const user = yield prisma_1.prisma.$transaction((tx) => __awaiter(void 0, void 0, void 0, function* () {
            const newUser = yield _createUserAndTenant(data, tx);
            yield _createTenantProfile(data, newUser.id, tx);
            const token = yield token_service_1.TokenService.createToken(newUser.id, 'EMAIL_VERIFICATION', tx);
            yield token_service_1.TokenService.sendTokenEmail(newUser, token, 'EMAIL_VERIFICATION');
            return newUser;
        }));
        return user;
    }),
    verifyEmailAndSetPassword: (token, password) => __awaiter(void 0, void 0, void 0, function* () {
        const userId = yield token_service_1.TokenService.validateAndUseToken(token, 'EMAIL_VERIFICATION');
        const hashedPassword = yield (0, hashing_1.hashPassword)(password);
        return yield prisma_1.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword, verified: true },
        });
    }),
    resendVerificationEmail: (email) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield prisma_1.prisma.user.findFirst({ where: { email, deletedAt: null } });
        if (!user)
            throw new Error('User tidak ditemukan.');
        if (user.verified)
            throw new Error('Akun ini sudah terverifikasi.');
        const token = yield token_service_1.TokenService.createToken(user.id, 'EMAIL_VERIFICATION');
        yield token_service_1.TokenService.sendTokenEmail(user, token, 'EMAIL_VERIFICATION');
    }),
    login: (data) => __awaiter(void 0, void 0, void 0, function* () {
        const { email, password, type } = data;
        const loginType = type || 'user';
        const user = yield prisma_1.prisma.user.findFirst({ where: { email, deletedAt: null } });
        yield _validateLoginAttempt(user, password);
        _validateUserRole(loginType, user.role);
        const token = (0, jwt_1.generateToken)({
            id: user.id, role: user.role, fullName: user.fullName,
            email: user.email, verified: user.verified,
            createdAt: user.createdAt, profilePicture: user.profilePicture
        });
        return { user, token };
    }),
    requestPasswordReset: (email) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield prisma_1.prisma.user.findFirst({
            where: { email, deletedAt: null },
        });
        if (!user || !user.password)
            return;
        const token = yield token_service_1.TokenService.createToken(user.id, 'PASSWORD_RESET');
        yield token_service_1.TokenService.sendTokenEmail(user, token, 'PASSWORD_RESET');
    }),
    resetPassword: (token, password) => __awaiter(void 0, void 0, void 0, function* () {
        const userId = yield token_service_1.TokenService.validateAndUseToken(token, 'PASSWORD_RESET');
        const hashedPassword = yield (0, hashing_1.hashPassword)(password);
        yield prisma_1.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
    }),
    confirmEmailChange: (token, newEmail) => __awaiter(void 0, void 0, void 0, function* () {
        const userId = yield token_service_1.TokenService.validateAndUseToken(token, 'EMAIL_CHANGE');
        const emailExists = yield prisma_1.prisma.user.findFirst({
            where: { email: newEmail, deletedAt: null },
        });
        if (emailExists) {
            throw new Error('Alamat email ini sudah digunakan oleh akun lain.');
        }
        const updatedUser = yield prisma_1.prisma.user.update({
            where: { id: userId },
            data: {
                email: newEmail,
                verified: false,
            },
        });
        const newToken = (0, jwt_1.generateToken)({
            id: updatedUser.id,
            role: updatedUser.role,
            fullName: updatedUser.fullName,
            email: updatedUser.email,
            verified: updatedUser.verified, // Akan bernilai false
            createdAt: updatedUser.createdAt,
            profilePicture: updatedUser.profilePicture,
        });
        return { token: newToken };
    }),
    getProfile: (userId) => __awaiter(void 0, void 0, void 0, function* () {
        return yield prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true, fullName: true, email: true, role: true,
                profilePicture: true, verified: true,
            },
        });
    }),
};
