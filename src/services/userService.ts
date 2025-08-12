import ApiError from '../utils/apiError';
import bcrypt from 'bcrypt';
import { resendVerificationEmail } from './authService';
import * as accountRepo from '../repositories/accountRepository';

export const getProfile = async (accountId: string) => {
  const account = await accountRepo.findAccountById(accountId);
  if (!account) {
    throw new ApiError(404, 'User not found');
  }
  return account;
};

export const updateProfile = async (accountId: string, data: { name?: string; email?: string; password?: string }) => {
  const updateData: { name?: string; email?: string; password?: string; isVerified?: boolean } = { ...data };

  if (data.email) {
    const existingUser = await accountRepo.findAccountByEmail(data.email);
    if (existingUser && existingUser.id !== accountId) {
      throw new ApiError(400, 'Email already in use');
    }
    updateData.isVerified = false;
  }

  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  const updatedAccount = await accountRepo.updateAccount(accountId, updateData);
  
  if (data.email) {
    await resendVerificationEmail(data.email);
  }

  return updatedAccount;
};

export const updateProfilePicture = async (accountId: string, filePath: string) => {
  return accountRepo.updateAccount(accountId, { profilePicture: filePath });
};