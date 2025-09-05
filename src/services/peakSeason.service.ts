// src/services/peakSeason.service.ts
import { PeakSeasonRepository } from '../repositories/peakSeason.repository';
import { PeakSeason, Prisma } from '../generated/prisma';
import ApiError from '../utils/apiError';

export const PeakSeasonService = {
  createSeason: async (data: Prisma.PeakSeasonUncheckedCreateInput): Promise<PeakSeason> => {
    // Validasi 1: Tanggal mulai harus sebelum tanggal selesai
    if (new Date(data.startDate) >= new Date(data.endDate)) {
      throw new ApiError(400, 'Start date must be before end date.');
    }
    
    // Validasi 2: Nilai penyesuaian harga harus ada dan lebih besar dari 0
    if (data.adjustmentValue === undefined || data.adjustmentValue <= 0) {
        throw new ApiError(400, 'Adjustment value must be a positive number.');
    }

    return PeakSeasonRepository.create(data);
  },

  getSeasonsByRoom: async (roomId: string): Promise<PeakSeason[]> => {
    return PeakSeasonRepository.findByRoomId(roomId);
  },
  
  updateSeason: async (id: string, data: Prisma.PeakSeasonUncheckedUpdateInput): Promise<PeakSeason> => {
    const existing = await PeakSeasonRepository.findById(id);
    if (!existing) {
        throw new ApiError(404, "Peak season not found.");
    }
    return PeakSeasonRepository.update(id, data);
  },

  deleteSeason: async (id: string): Promise<PeakSeason> => {
    const existing = await PeakSeasonRepository.findById(id);
    if (!existing) {
        throw new ApiError(404, "Peak season not found.");
    }
    return PeakSeasonRepository.delete(id);
  },
};