import PeakSeasonRepository from '../repositories/peakSeason.repository';
import { PeakSeason, Prisma } from '../../prisma/generated/client';
import ApiError from '../utils/apiError';
import { isBefore, startOfDay, endOfDay } from 'date-fns';

class PeakSeasonService {
    public async createSeason(data: Prisma.PeakSeasonUncheckedCreateInput): Promise<PeakSeason> {
        const startDate = startOfDay(new Date(data.startDate as string));
        const endDate = endOfDay(new Date(data.endDate as string));

        if (isBefore(endDate, startDate)) {
            throw new ApiError(400, 'End date must be after start date.');
        }

        if (data.adjustmentValue === undefined || data.adjustmentValue <= 0) {
            throw new ApiError(400, 'Adjustment value must be a positive number.');
        }

        const adjustedData = {
            ...data,
            startDate,
            endDate,
        };

        return PeakSeasonRepository.create(adjustedData);
    }

    public async getSeasonsByRoom(roomId: string): Promise<PeakSeason[]> {
        return PeakSeasonRepository.findByRoomId(roomId);
    }

    public async updateSeason(id: string, data: Prisma.PeakSeasonUncheckedUpdateInput): Promise<PeakSeason> {
        const existing = await PeakSeasonRepository.findById(id);
        if (!existing) {
            throw new ApiError(404, "Peak season not found.");
        }

        const adjustedUpdateData = { ...data };

        if (data.startDate) {
            adjustedUpdateData.startDate = startOfDay(new Date(data.startDate as string));
        }

        if (data.endDate) {
            adjustedUpdateData.endDate = endOfDay(new Date(data.endDate as string));
        }

        if (adjustedUpdateData.startDate && adjustedUpdateData.endDate && isBefore(new Date(adjustedUpdateData.endDate as string), new Date(adjustedUpdateData.startDate as string))) {
            throw new ApiError(400, 'Start date must be before end date.');
        }
        
        return PeakSeasonRepository.update(id, adjustedUpdateData);
    }

    public async deleteSeason(id: string): Promise<PeakSeason> {
        const existing = await PeakSeasonRepository.findById(id);
        if (!existing) {
            throw new ApiError(404, "Peak season not found.");
        }
        return PeakSeasonRepository.delete(id);
    }
}

export default new PeakSeasonService();