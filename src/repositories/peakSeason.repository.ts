import { prisma } from '../config/prisma';
import { PeakSeason, Prisma } from '../../prisma/generated/prisma';

export const PeakSeasonRepository = {
  create: async (data: Prisma.PeakSeasonUncheckedCreateInput): Promise<PeakSeason> => {
    const { roomId, ...peakSeasonData } = data;

    if (!roomId) {
      throw new Error('roomId wajib diisi untuk membuat peak season.');
    }

    return prisma.peakSeason.create({
      data: {
        ...peakSeasonData,
        room: {
          connect: {
            id: roomId,
          },
        },
      },
    });
  },

  findByRoomId: async (roomId: string): Promise<PeakSeason[]> => {
    return prisma.peakSeason.findMany({
      where: { roomId },
      orderBy: { startDate: 'asc' },
    });
  },

  findById: async (id: string): Promise<PeakSeason | null> => {
    return prisma.peakSeason.findUnique({ where: { id } });
  },

  update: async (id: string, data: Prisma.PeakSeasonUncheckedUpdateInput): Promise<PeakSeason> => {
    return prisma.peakSeason.update({
      where: { id },
      data,
    });
  },

  delete: async (id: string): Promise<PeakSeason> => {
    return prisma.peakSeason.delete({ where: { id } });
  },
};