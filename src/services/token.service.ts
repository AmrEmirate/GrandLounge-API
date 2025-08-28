import { prisma } from '../config/prisma';
import { PrismaClient, TokenPurpose, User } from '../generated/prisma';
import crypto from 'crypto';
import { addHours } from 'date-fns';
import { sendEmail } from '../utils/mailer';

type PrismaTransactionClient = Omit<PrismaClient, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

export const TokenService = {
  // --- PERUBAHAN DI SINI ---
  // Tipe data userId diubah dari 'number' menjadi 'string'
  createToken: async (userId: string, purpose: TokenPurpose, tx?: PrismaTransactionClient, expiresInHours: number = 1) => {
    const prismaClient = tx || prisma;
    const token = crypto.randomBytes(32).toString('hex');
    
    await prismaClient.token.create({
      data: {
        token,
        purpose,
        expiresAt: addHours(new Date(), expiresInHours),
        userId,
      },
    });

    console.log(`[DEBUG] Token created for ${purpose} for user ${userId}: ${token}`);
    
    return token;
  },

  sendTokenEmail: async (user: User, token: string, purpose: TokenPurpose, extraData?: any) => {
    if (purpose === 'EMAIL_VERIFICATION') {
        const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${token}`;
        await sendEmail({
            to: user.email,
            subject: 'Verifikasi Akun Grand Lodge Anda',
            html: `
                <h1>Selamat Datang di Grand Lodge!</h1>
                <p>Terima kasih telah mendaftar. Silakan klik link di bawah ini untuk memverifikasi akun Anda dan mengatur password:</p>
                <a href="${verificationLink}" target="_blank" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verifikasi Akun Saya</a>
                <p>Link ini hanya berlaku selama 1 jam.</p>
            `
        });
    } else if (purpose === 'PASSWORD_RESET') {
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        await sendEmail({
            to: user.email,
            subject: 'Reset Password Akun Grand Lodge Anda',
            html: `
                <h1>Permintaan Reset Password</h1>
                <p>Anda menerima email ini karena ada permintaan untuk mereset password akun Anda. Silakan klik link di bawah ini:</p>
                <a href="${resetLink}" target="_blank" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password Saya</a>
                <p>Link ini hanya berlaku selama 1 jam. Jika Anda tidak merasa melakukan permintaan ini, silakan abaikan email ini.</p>
            `
        });
    } else if (purpose === 'EMAIL_CHANGE') {
        const encodedNewEmail = encodeURIComponent(extraData.newEmail);
        const confirmationLink = `${process.env.FRONTEND_URL}/confirm-email-change?token=${token}&newEmail=${encodedNewEmail}`;
        await sendEmail({
            to: user.email, // Kirim ke email LAMA
            subject: 'Konfirmasi Perubahan Alamat Email',
            html: `
                <h1>Konfirmasi Perubahan Email</h1>
                <p>Ada permintaan untuk mengubah alamat email Anda menjadi <strong>${extraData.newEmail}</strong>. Silakan klik link di bawah ini untuk mengkonfirmasi:</p>
                <a href="${confirmationLink}" target="_blank" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Konfirmasi Perubahan</a>
                <p>Jika Anda tidak merasa melakukan permintaan ini, abaikan email ini.</p>
            `
        });
    }
  },

  validateAndUseToken: async (token: string, purpose: TokenPurpose) => {
    const dbToken = await prisma.token.findFirst({
      where: {
        token: token,
        purpose: purpose,
        expiresAt: { gt: new Date() },
      },
    });

    if (!dbToken) {
      throw new Error('Token tidak valid atau sudah kedaluwarsa.');
    }

    await prisma.token.delete({ where: { id: dbToken.id } });

    // Fungsi ini sekarang akan mengembalikan userId sebagai string, sesuai skema baru.
    return dbToken.userId;
  },
};