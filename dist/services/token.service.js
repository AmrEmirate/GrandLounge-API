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
exports.TokenService = void 0;
const prisma_1 = require("../config/prisma");
const crypto_1 = __importDefault(require("crypto"));
const date_fns_1 = require("date-fns");
const mailer_1 = require("../utils/mailer");
const _sendVerificationEmail = (user, token) => {
    const verificationLink = `${process.env.FRONTEND_URL}/auth/verify-email?token=${token}`;
    return (0, mailer_1.sendEmail)({
        to: user.email,
        subject: 'Verifikasi Akun Grand Lodge Anda',
        html: `
            <h1>Selamat Datang di Grand Lodge!</h1>
            <p>Terima kasih telah mendaftar. Silakan klik link di bawah ini untuk memverifikasi akun Anda dan mengatur password:</p>
            <a href="${verificationLink}" target="_blank" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verifikasi Akun Saya</a>
            <p>Link ini hanya berlaku selama 1 jam.</p>
        `
    });
};
const _sendPasswordResetEmail = (user, token) => {
    const resetLink = `${process.env.FRONTEND_URL}/auth/reset-password?token=${token}`;
    return (0, mailer_1.sendEmail)({
        to: user.email,
        subject: 'Reset Password Akun Grand Lodge Anda',
        html: `
            <h1>Permintaan Reset Password</h1>
            <p>Anda menerima email ini karena ada permintaan untuk mereset password akun Anda. Silakan klik link di bawah ini:</p>
            <a href="${resetLink}" target="_blank" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password Saya</a>
            <p>Link ini hanya berlaku selama 1 jam. Jika Anda tidak merasa melakukan permintaan ini, silakan abaikan email ini.</p>
        `
    });
};
const _sendEmailChangeConfirmationEmail = (user, token, newEmail) => {
    const encodedNewEmail = encodeURIComponent(newEmail);
    const confirmationLink = `${process.env.FRONTEND_URL}/auth/confirm-email-change?token=${token}&newEmail=${encodedNewEmail}`;
    return (0, mailer_1.sendEmail)({
        to: user.email,
        subject: 'Konfirmasi Perubahan Alamat Email',
        html: `
            <h1>Konfirmasi Perubahan Email</h1>
            <p>Ada permintaan untuk mengubah alamat email Anda menjadi <strong>${newEmail}</strong>. Silakan klik link di bawah ini untuk mengkonfirmasi:</p>
            <a href="${confirmationLink}" target="_blank" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Konfirmasi Perubahan</a>
            <p>Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini.</p>
        `
    });
};
exports.TokenService = {
    createToken: (userId_1, purpose_1, tx_1, ...args_1) => __awaiter(void 0, [userId_1, purpose_1, tx_1, ...args_1], void 0, function* (userId, purpose, tx, expiresInHours = 1) {
        const prismaClient = tx || prisma_1.prisma;
        const token = crypto_1.default.randomBytes(32).toString('hex');
        yield prismaClient.token.create({
            data: {
                token,
                purpose,
                expiresAt: (0, date_fns_1.addHours)(new Date(), expiresInHours),
                userId,
            },
        });
        return token;
    }),
    sendTokenEmail: (user, token, purpose, extraData) => __awaiter(void 0, void 0, void 0, function* () {
        if (purpose === 'EMAIL_VERIFICATION') {
            yield _sendVerificationEmail(user, token);
        }
        else if (purpose === 'PASSWORD_RESET') {
            yield _sendPasswordResetEmail(user, token);
        }
        else if (purpose === 'EMAIL_CHANGE') {
            yield _sendEmailChangeConfirmationEmail(user, token, extraData.newEmail);
        }
    }),
    validateAndUseToken: (token, purpose) => __awaiter(void 0, void 0, void 0, function* () {
        const dbToken = yield prisma_1.prisma.token.findFirst({
            where: {
                token: token,
                purpose: purpose,
                expiresAt: { gt: new Date() },
            },
        });
        if (!dbToken) {
            throw new Error('Token tidak valid atau sudah kedaluwarsa.');
        }
        yield prisma_1.prisma.token.delete({ where: { id: dbToken.id } });
        return dbToken.userId;
    }),
};
