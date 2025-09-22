import { PeakSeasonRepository } from '../repositories/peakSeason.repository';
import { PeakSeason, Prisma } from '../../prisma/generated/client';
import ApiError from '../utils/apiError';

// Fungsi helper untuk menambahkan 1 hari (menggunakan UTC untuk konsistensi)
const addOneDayUTC = (date: Date): Date => {
  const newDate = new Date(date);
  newDate.setUTCDate(newDate.getUTCDate() + 1);
  newDate.setUTCHours(0, 0, 0, 0); // Pastikan waktunya adalah awal hari
  return newDate;
};

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

    const adjustedData = {
      ...data,
      // endDate sekarang adalah hari berikutnya dari yang dipilih
      endDate: addOneDayUTC(new Date(data.endDate as string)),
    };

    return PeakSeasonRepository.create(adjustedData);
  },

  getSeasonsByRoom: async (roomId: string): Promise<PeakSeason[]> => {
    return PeakSeasonRepository.findByRoomId(roomId);
  },
  
  updateSeason: async (id: string, data: Prisma.PeakSeasonUncheckedUpdateInput): Promise<PeakSeason> => {
    const existing = await PeakSeasonRepository.findById(id);
    if (!existing) {
        throw new ApiError(404, "Peak season not found.");
    }
    
    const adjustedUpdateData = { ...data };
    if (data.endDate) {
      // Terapkan logika yang sama untuk update
      adjustedUpdateData.endDate = addOneDayUTC(new Date(data.endDate as string));
    }

    return PeakSeasonRepository.update(id, adjustedUpdateData);
  },

  deleteSeason: async (id: string): Promise<PeakSeason> => {
    const existing = await PeakSeasonRepository.findById(id);
    if (!existing) {
        throw new ApiError(404, "Peak season not found.");
    }
    return PeakSeasonRepository.delete(id);
  },
};