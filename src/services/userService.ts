import prisma from '../configs/db';
import ApiError from '../utils/apiError';
import bcrypt from 'bcrypt';
import { resendVerificationEmail } from './authService'; 

export const getProfile = async (accountId: string) => {
  const account = await prisma.account.findUnique({
    where: { id: accountId },
    select: {
      id: true,
      name: true,
      email: true,
      profilePicture: true,
      role: true,
      isVerified: true,
    },
  });

  if (!account) {
    throw new ApiError(404, 'User not found');
  }
  return account;
};

export const updateProfile = async (accountId: string, data: { name?: string; email?: string; password?: string }) => {
  const updateData: { name?: string; email?: string; password?: string; isVerified?: boolean } = { ...data };

  if (data.email) {
    const existingUser = await prisma.account.findUnique({ where: { email: data.email } });
    if (existingUser && existingUser.id !== accountId) {
      throw new ApiError(400, 'Email already in use');
    }
    updateData.isVerified = false; 
  }

  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  const updatedAccount = await prisma.account.update({
    where: { id: accountId },
    data: updateData,
  });
  
  if (data.email) {
    await resendVerificationEmail(data.email);
  }

  return updatedAccount;
};

export const updateProfilePicture = async (accountId: string, filePath: string) => {
  return prisma.account.update({
    where: { id: accountId },
    data: { profilePicture: filePath },
  });
};
