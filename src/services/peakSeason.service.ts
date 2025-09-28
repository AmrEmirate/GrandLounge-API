import PeakSeasonRepository from '../repositories/peakSeason.repository';
import { PeakSeason, Prisma } from '../../prisma/generated/client';
import ApiError from '../utils/apiError';

class PeakSeasonService {

    private addOneDayUTC(date: Date): Date {
        const newDate = new Date(date);
        newDate.setUTCDate(newDate.getUTCDate() + 1);
        newDate.setUTCHours(0, 0, 0, 0); 
        return newDate;
    }

    public async createSeason(data: Prisma.PeakSeasonUncheckedCreateInput): Promise<PeakSeason> {
        if (new Date(data.startDate) >= new Date(data.endDate)) {
            throw new ApiError(400, 'Start date must be before end date.');
        }
        
        if (data.adjustmentValue === undefined || data.adjustmentValue <= 0) {
            throw new ApiError(400, 'Adjustment value must be a positive number.');
        }

        const adjustedData = {
            ...data,
            endDate: this.addOneDayUTC(new Date(data.endDate as string)),
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
        if (data.endDate) { 
            adjustedUpdateData.endDate = this.addOneDayUTC(new Date(data.endDate as string));
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