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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../config/prisma");
const client_1 = require("../../prisma/generated/client");
const hashing_1 = require("../utils/hashing");
const jwt_1 = require("../utils/jwt");
const token_service_1 = require("./token.service");
const apiError_1 = __importDefault(require("../utils/apiError"));
class AuthService {
    checkIfUserExists(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield prisma_1.prisma.user.findFirst({
                where: { email, deletedAt: null },
            });
            if (existingUser) {
                throw new apiError_1.default(409, 'Email sudah terdaftar.');
            }
        });
    }
    createUserAndTenant(data, tx) {
        return tx.user.create({
            data: {
                fullName: data.fullName,
                email: data.email,
                role: client_1.UserRole.TENANT,
            },
        });
    }
    createTenantProfile(data, userId, tx) {
        return tx.tenant.create({
            data: {
                userId: userId,
                companyName: data.companyName,
                addressCompany: data.addressCompany,
                phoneNumberCompany: data.phoneNumberCompany,
            },
        });
    }
    validateLoginAttempt(user, pass) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!user || !user.password)
                throw new apiError_1.default(401, 'Email atau password salah.');
            if (!user.verified)
                throw new apiError_1.default(403, 'Akun belum diverifikasi. Silakan cek email Anda.');
            const isPasswordValid = yield (0, hashing_1.comparePassword)(pass, user.password);
            if (!isPasswordValid)
                throw new apiError_1.default(401, 'Email atau password salah.');
        });
    }
    validateUserRole(loginType, userRole) {
        if (loginType === 'tenant' && userRole !== client_1.UserRole.TENANT) {
            throw new apiError_1.default(403, 'Akses ditolak. Anda bukan tenant. Silakan login sebagai pengguna biasa.');
        }
        if (loginType === 'user' && userRole !== client_1.UserRole.USER) {
            throw new apiError_1.default(403, 'Akses ditolak. Silakan login melalui halaman login untuk tenant.');
        }
    }
    registerUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkIfUserExists(data.email);
            const user = yield prisma_1.prisma.user.create({
                data: { fullName: data.fullName, email: data.email, role: client_1.UserRole.USER },
            });
            const verificationToken = yield token_service_1.TokenService.createToken(user.id, 'EMAIL_VERIFICATION');
            yield token_service_1.TokenService.sendTokenEmail(user, verificationToken, 'EMAIL_VERIFICATION');
            return user;
        });
    }
    registerTenant(data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.checkIfUserExists(data.email);
            const user = yield prisma_1.prisma.$transaction((tx) => __awaiter(this, void 0, void 0, function* () {
                const newUser = yield this.createUserAndTenant(data, tx);
                yield this.createTenantProfile(data, newUser.id, tx);
                const token = yield token_service_1.TokenService.createToken(newUser.id, 'EMAIL_VERIFICATION', tx);
                yield token_service_1.TokenService.sendTokenEmail(newUser, token, 'EMAIL_VERIFICATION');
                return newUser;
            }));
            return user;
        });
    }
    verifyEmailAndSetPassword(token, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = yield token_service_1.TokenService.validateAndUseToken(token, 'EMAIL_VERIFICATION');
            const hashedPassword = yield (0, hashing_1.hashPassword)(password);
            return yield prisma_1.prisma.user.update({
                where: { id: userId },
                data: { password: hashedPassword, verified: true },
            });
        });
    }
    resendVerificationEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma_1.prisma.user.findFirst({ where: { email, deletedAt: null } });
            if (!user)
                throw new apiError_1.default(404, 'User tidak ditemukan.');
            if (user.verified)
                throw new apiError_1.default(400, 'Akun ini sudah terverifikasi.');
            const token = yield token_service_1.TokenService.createToken(user.id, 'EMAIL_VERIFICATION');
            yield token_service_1.TokenService.sendTokenEmail(user, token, 'EMAIL_VERIFICATION');
        });
    }
    login(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const { email, password, type } = data;
            const loginType = type || 'user';
            const user = yield prisma_1.prisma.user.findFirst({ where: { email, deletedAt: null } });
            yield this.validateLoginAttempt(user, password);
            this.validateUserRole(loginType, user.role);
            const token = (0, jwt_1.generateToken)({
                id: user.id, role: user.role, fullName: user.fullName,
                email: user.email, verified: user.verified,
                createdAt: user.createdAt, profilePicture: user.profilePicture
            });
            return { user: user, token };
        });
    }
    requestPasswordReset(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield prisma_1.prisma.user.findFirst({ where: { email, deletedAt: null } });
            if (!user || !user.password)
                return;
            const token = yield token_service_1.TokenService.createToken(user.id, 'PASSWORD_RESET');
            yield token_service_1.TokenService.sendTokenEmail(user, token, 'PASSWORD_RESET');
        });
    }
    resetPassword(token, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = yield token_service_1.TokenService.validateAndUseToken(token, 'PASSWORD_RESET');
            const hashedPassword = yield (0, hashing_1.hashPassword)(password);
            yield prisma_1.prisma.user.update({
                where: { id: userId },
                data: { password: hashedPassword },
            });
        });
    }
    confirmEmailChange(token, newEmail) {
        return __awaiter(this, void 0, void 0, function* () {
            const userId = yield token_service_1.TokenService.validateAndUseToken(token, 'EMAIL_CHANGE');
            const emailExists = yield prisma_1.prisma.user.findFirst({ where: { email: newEmail, deletedAt: null } });
            if (emailExists) {
                throw new apiError_1.default(409, 'Alamat email ini sudah digunakan oleh akun lain.');
            }
            const updatedUser = yield prisma_1.prisma.user.update({
                where: { id: userId },
                data: { email: newEmail, verified: false },
            });
            const newToken = (0, jwt_1.generateToken)({
                id: updatedUser.id, role: updatedUser.role, fullName: updatedUser.fullName,
                email: updatedUser.email, verified: updatedUser.verified,
                createdAt: updatedUser.createdAt, profilePicture: updatedUser.profilePicture,
            });
            return { token: newToken };
        });
    }
    getProfile(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield prisma_1.prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true, fullName: true, email: true, role: true,
                    profilePicture: true, verified: true,
                },
            });
        });
    }
}
exports.default = new AuthService();
