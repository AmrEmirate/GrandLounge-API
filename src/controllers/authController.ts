import { Request, Response } from 'express';
import * as authService from '../services/authService';
import asyncHandler from '../utils/asyncHandler';
import { Account } from '@prisma/client';
import { generateToken } from '../utils/jwt';

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const { name, email, role } = req.body;
  await authService.register(name, email, role);
  res.status(201).json({ message: 'Registration successful, please check your email for verification.' });
});

export const verifyEmail = asyncHandler(async (req: Request, res: Response) => {
  const { token, password } = req.body;
  await authService.verifyEmailAndSetPassword(token, password);
  res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const { email, password } = req.body;
  const data = await authService.login(email, password);
  res.status(200).json(data);
});

export const forgotPasswordUser = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    await authService.forgotPassword(email);
    res.status(200).json({ message: 'Password reset link sent to your email.' });
});

export const resetPasswordUser = asyncHandler(async (req: Request, res: Response) => {
    const { token, password } = req.body;
    await authService.resetPassword(token, password);
    res.status(200).json({ message: 'Password reset successful.' });
});

export const resendVerification = asyncHandler(async (req: Request, res: Response) => {
  const { email } = req.body;
  await authService.resendVerificationEmail(email);
  res.status(200).json({ message: 'If an account with that email exists, a new verification link has been sent.' });
});

export const socialLoginCallback = asyncHandler(async (req: Request, res: Response) => {
    const account = req.user as Account;
    const token = generateToken({ id: account.id });
    res.redirect(`http://localhost:3000/social-login-success?token=${token}`);
});