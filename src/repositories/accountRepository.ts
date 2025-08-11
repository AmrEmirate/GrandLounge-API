import { Prisma, UserRole } from '@prisma/client';
import prisma from '../configs/db';

export const findAccountByEmail = (email: string) => {
  return prisma.account.findUnique({ where: { email } });
};

export const findAccountById = (id: string) => {
  return prisma.account.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      profilePicture: true,
      role: true,
      isVerified: true,
    },
  });
};

export const createAccount = (name: string, email: string, role: UserRole, password = '') => {
  return prisma.account.create({
    data: { name, email, role, password },
  });
};

export const createSocialAccount = (name: string, email: string, profilePicture: string) => {
    return prisma.account.create({
        data: {
          name,
          email,
          profilePicture,
          password: '',
          isVerified: true,
          role: UserRole.USER,
        },
    });
};

export const updateAccount = (id: string, data: Prisma.AccountUpdateInput) => {
  return prisma.account.update({
    where: { id },
    data,
  });
};