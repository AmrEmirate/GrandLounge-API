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
exports.UserService = void 0;
const prisma_1 = require("../config/prisma");
const hashing_1 = require("../utils/hashing");
const cloudinary_1 = require("../utils/cloudinary");
const token_service_1 = require("./token.service");
const _buildUpdateData = (data, file) => __awaiter(void 0, void 0, void 0, function* () {
    const updateData = {};
    if (data.fullName) {
        updateData.fullName = data.fullName;
    }
    if (file) {
        const result = yield (0, cloudinary_1.uploadToCloudinary)(file.buffer, 'profile_pictures');
        updateData.profilePicture = result.secure_url;
    }
    return updateData;
});
const _verifyOldPassword = (userId, oldPass) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield prisma_1.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password) {
        throw new Error('User tidak ditemukan atau tidak menggunakan password.');
    }
    const isPasswordValid = yield (0, hashing_1.comparePassword)(oldPass, user.password);
    if (!isPasswordValid) {
        throw new Error('Password lama salah.');
    }
});
exports.UserService = {
    updateProfile: (userId, data, file) => __awaiter(void 0, void 0, void 0, function* () {
        const updateData = yield _buildUpdateData(data, file);
        return yield prisma_1.prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true, fullName: true, email: true,
                profilePicture: true, verified: true,
            },
        });
    }),
    updatePassword: (userId, data) => __awaiter(void 0, void 0, void 0, function* () {
        const { oldPassword, newPassword } = data;
        yield _verifyOldPassword(userId, oldPassword);
        const hashedPassword = yield (0, hashing_1.hashPassword)(newPassword);
        yield prisma_1.prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });
    }),
    requestEmailChange: (userId, newEmail) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield prisma_1.prisma.user.findUnique({ where: { id: userId } });
        if (!user)
            throw new Error('User tidak ditemukan.');
        const existingEmail = yield prisma_1.prisma.user.findUnique({ where: { email: newEmail } });
        if (existingEmail)
            throw new Error('Email baru sudah terdaftar oleh pengguna lain.');
        const token = yield token_service_1.TokenService.createToken(userId, 'EMAIL_CHANGE');
        yield token_service_1.TokenService.sendTokenEmail(user, token, 'EMAIL_CHANGE', { newEmail });
    }),
    confirmEmailChange: (token, newEmail) => __awaiter(void 0, void 0, void 0, function* () {
        const userId = yield token_service_1.TokenService.validateAndUseToken(token, 'EMAIL_CHANGE');
        const updatedUser = yield prisma_1.prisma.user.update({
            where: { id: userId },
            data: { email: newEmail, verified: false }, // Email diperbarui di sini
        });
        // Membuat token baru untuk verifikasi email BARU
        const verificationToken = yield token_service_1.TokenService.createToken(userId, 'EMAIL_VERIFICATION');
        yield token_service_1.TokenService.sendTokenEmail(updatedUser, verificationToken, 'EMAIL_VERIFICATION');
        return updatedUser;
    }),
};
