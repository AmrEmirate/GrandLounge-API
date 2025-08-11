import { UserRole } from '@prisma/client';
import prisma from '../configs/db';
import { compileTemplate, transporter } from '../configs/nodemailer';
import ApiError from '../utils/apiError';
import { generateToken } from '../utils/jwt';
import bcrypt from 'bcrypt';

export const register = async (name: string, email: string, role: UserRole) => {
  const existingUser = await prisma.account.findUnique({ where: { email } });
  if (existingUser) {
    throw new ApiError(400, 'Email already registered');
  }

  const account = await prisma.account.create({
    data: {
      name,
      email,
      role,
      password: '', 
    },
  });

  const verificationToken = await prisma.verificationToken.create({
    data: {
      accountId: account.id,
      token: generateToken({ id: account.id }, '1h'),
      expires: new Date(Date.now() + 3600000), // 1 hour
    },
  });

  const verificationLink = `http://localhost:3000/verify?token=${verificationToken.token}`;
  const emailBody = compileTemplate('verification', { name, verificationLink });

  await transporter.sendMail({
    to: email,
    subject: 'Email Verification',
    html: emailBody,
  });

  return account;
};

export const verifyEmailAndSetPassword = async (token: string, password: string) => {
  const verificationToken = await prisma.verificationToken.findFirst({
    where: {
      token,
      expires: {
        gt: new Date(),
      },
    },
  });

  if (!verificationToken) {
    throw new ApiError(400, 'Invalid or expired token');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await prisma.account.update({
    where: { id: verificationToken.accountId },
    data: {
      isVerified: true,
      password: hashedPassword,
    },
  });

  await prisma.verificationToken.delete({ where: { id: verificationToken.id } });
};

export const login = async (email: string, password: string) => {
  const account = await prisma.account.findUnique({ where: { email } });
  if (!account || !account.isVerified) {
    throw new ApiError(401, 'Invalid credentials or email not verified');
  }

  const isPasswordMatch = await bcrypt.compare(password, account.password);
  if (!isPasswordMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  return {
    token: generateToken({ id: account.id }),
    account: {
      id: account.id,
      name: account.name,
      email: account.email,
      role: account.role,
    },
  };
};

export const forgotPassword = async (email: string) => {
    const account = await prisma.account.findUnique({ where: { email } });
    if (!account) {
        throw new ApiError(404, 'Account not found');
    }
    const resetToken = await prisma.passwordResetToken.create({
        data: {
            accountId: account.id,
            token: generateToken({ id: account.id }, '1h'),
            expires: new Date(Date.now() + 3600000), // 1 hour
        },
    });

    const resetLink = `http://localhost:3000/reset-password?token=${resetToken.token}`;
    const emailBody = compileTemplate('resetPassword', { name: account.name, resetLink });
    await transporter.sendMail({
        to: email,
        subject: 'Password Reset',
        html: emailBody,
    });
};

export const resetPassword = async (token: string, password: string) => {
    const resetToken = await prisma.passwordResetToken.findFirst({
        where: {
            token,
            expires: {
                gt: new Date(),
            },
        },
    });

    if (!resetToken) {
        throw new ApiError(400, 'Invalid or expired token');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await prisma.account.update({
        where: { id: resetToken.accountId },
        data: {
            password: hashedPassword,
        },
    });

    await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
};

export const resendVerificationEmail = async (email: string) => {
  const account = await prisma.account.findUnique({ where: { email } });

  if (!account) {
    return;
  }

  if (account.isVerified) {
    throw new ApiError(400, 'This account is already verified.');
  }

  const verificationToken = await prisma.verificationToken.create({
    data: {
      accountId: account.id,
      token: generateToken({ id: account.id }, '1h'),
      expires: new Date(Date.now() + 3600000),
    },
  });

  const verificationLink = `http://localhost:3000/verify?token=${verificationToken.token}`;
  const emailBody = compileTemplate('verification', { name: account.name, verificationLink });

  await transporter.sendMail({
    to: email,
    subject: 'Email Verification',
    html: emailBody,
  });
};