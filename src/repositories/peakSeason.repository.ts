// src/repositories/peakSeason.repository.ts
import { prisma } from '../config/prisma';
import { PeakSeason, Prisma } from '../generated/prisma';

export const PeakSeasonRepository = {
  // Membuat data peak season baru
  create: async (data: Prisma.PeakSeasonUncheckedCreateInput): Promise<PeakSeason> => {
    return prisma.peakSeason.create({ data });
  },

  // Mencari semua peak season untuk satu kamar
  findByRoomId: async (roomId: string): Promise<PeakSeason[]> => {
    return prisma.peakSeason.findMany({
      where: { roomId },
      orderBy: { startDate: 'asc' },
    });
  },

  // Mencari satu peak season berdasarkan ID
  findById: async (id: string): Promise<PeakSeason | null> => {
    return prisma.peakSeason.findUnique({ where: { id } });
  },

  // Memperbarui data peak season
  update: async (id: string, data: Prisma.PeakSeasonUncheckedUpdateInput): Promise<PeakSeason> => {
    return prisma.peakSeason.update({
      where: { id },
      data,
    });
  },

  // Menghapus data peak season
  delete: async (id: string): Promise<PeakSeason> => {
    return prisma.peakSeason.delete({ where: { id } });
  },
};