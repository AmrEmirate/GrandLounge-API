import { UserRole } from '@prisma/client';

import { compileTemplate, transporter } from '../configs/nodemailer';

import prisma from '../config/db';

import ApiError from '../utils/apiError';
import { generateToken } from '../utils/jwt';
import bcrypt from 'bcrypt';
import * as accountRepo from '../repositories/accountRepository';
import * as tokenRepo from '../repositories/tokenRepository';

export const register = async (name: string, email: string, role: UserRole) => {
  const existingUser = await accountRepo.findAccountByEmail(email);
  if (existingUser) {
    throw new ApiError(400, 'Email already registered');
  }

  const account = await accountRepo.createAccount(name, email, role);
  const verificationToken = await tokenRepo.createVerificationToken(account.id, generateToken({ id: account.id }, '1h'));

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
  const verificationToken = await tokenRepo.findVerificationToken(token);
  if (!verificationToken) {
    throw new ApiError(400, 'Invalid or expired token');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await accountRepo.updateAccount(verificationToken.accountId, {
    isVerified: true,
    password: hashedPassword,
  });

  await tokenRepo.deleteVerificationToken(verificationToken.id);
};

export const login = async (email: string, password: string) => {
  const account = await accountRepo.findAccountByEmail(email);
  if (!account || !account.isVerified) {
    throw new ApiError(401, 'Invalid credentials or email not verified');
  }

  const isPasswordMatch = await bcrypt.compare(password, account.password);
  if (!isPasswordMatch) {
    throw new ApiError(401, 'Invalid credentials');
  }

  return {
    token: generateToken({ id: account.id }),
    account: { id: account.id, name: account.name, email: account.email, role: account.role },
  };
};

export const forgotPassword = async (email: string) => {
    const account = await accountRepo.findAccountByEmail(email);
    if (!account) {
      throw new ApiError(404, 'Account not found');
    }

    const resetToken = await tokenRepo.createPasswordResetToken(account.id, generateToken({ id: account.id }, '1h'));
    const resetLink = `http://localhost:3000/reset-password?token=${resetToken.token}`;
    const emailBody = compileTemplate('resetPassword', { name: account.name, resetLink });

    await transporter.sendMail({
        to: email,
        subject: 'Password Reset',
        html: emailBody,
    });
};

export const resetPassword = async (token: string, password: string) => {
    const resetToken = await tokenRepo.findPasswordResetToken(token);
    if (!resetToken) {
      throw new ApiError(400, 'Invalid or expired token');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await accountRepo.updateAccount(resetToken.accountId, { password: hashedPassword });
    await tokenRepo.deletePasswordResetToken(resetToken.id);
};

export const resendVerificationEmail = async (email: string) => {
  const account = await accountRepo.findAccountByEmail(email);
  if (!account) return;
  if (account.isVerified) throw new ApiError(400, 'This account is already verified.');

  const verificationToken = await tokenRepo.createVerificationToken(account.id, generateToken({ id: account.id }, '1h'));
  const verificationLink = `http://localhost:3000/verify?token=${verificationToken.token}`;
  const emailBody = compileTemplate('verification', { name: account.name, verificationLink });

  await transporter.sendMail({
    to: email,
    subject: 'Email Verification',
    html: emailBody,
  });
};