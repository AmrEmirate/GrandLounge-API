// src/services/peakSeason.service.ts
import { PeakSeason } from '../generated/prisma';
import { prisma } from '../config/prisma'; // DIUBAH DI SINI

export const peakSeasonService = {
  async getSeasonsByRoom(roomId: string): Promise<PeakSeason[]> {
    return prisma.peakSeason.findMany({ where: { roomId } });
  },

  async createSeason(data: Omit<PeakSeason, 'id' | 'createdAt' | 'updatedAt'>): Promise<PeakSeason> {
    return prisma.peakSeason.create({ data });
  },

  async updateSeason(id: string, data: Partial<Omit<PeakSeason, 'id' | 'createdAt' | 'updatedAt'>>): Promise<PeakSeason> {
    return prisma.peakSeason.update({ where: { id }, data });
  },

  async deleteSeason(id: string): Promise<PeakSeason> {
    return prisma.peakSeason.delete({ where: { id } });
  }
};