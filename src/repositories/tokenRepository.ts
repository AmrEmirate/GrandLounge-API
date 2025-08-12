import prisma from '../configs/db';

export const createVerificationToken = (accountId: string, token: string) => {
  return prisma.verificationToken.create({
    data: {
      accountId,
      token,
      expires: new Date(Date.now() + 3600000), // 1 jam
    },
  });
};

export const findVerificationToken = (token: string) => {
  return prisma.verificationToken.findFirst({
    where: {
      token,
      expires: { gt: new Date() },
    },
  });
};

export const deleteVerificationToken = (id: string) => {
  return prisma.verificationToken.delete({ where: { id } });
};

export const createPasswordResetToken = (accountId: string, token: string) => {
    return prisma.passwordResetToken.create({
        data: {
            accountId: accountId,
            token: token,
            expires: new Date(Date.now() + 3600000), // 1 jam
        },
    });
};

export const findPasswordResetToken = (token: string) => {
    return prisma.passwordResetToken.findFirst({
        where: {
            token,
            expires: { gt: new Date() },
        },
    });
};

export const deletePasswordResetToken = (id: string) => {
    return prisma.passwordResetToken.delete({ where: { id } });
};