import { prisma } from '../config/prisma';
import { PeakSeason, Prisma } from '../../prisma/generated/client';
import ApiError from '../utils/apiError';

class PeakSeasonRepository {
    public async create(data: Prisma.PeakSeasonUncheckedCreateInput): Promise<PeakSeason> {
        const { roomId, ...peakSeasonData } = data;

        if (!roomId) {
            throw new ApiError(400, 'roomId wajib diisi untuk membuat peak season.');
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
    }

    public async findByRoomId(roomId: string): Promise<PeakSeason[]> {
        return prisma.peakSeason.findMany({
            where: { roomId },
            orderBy: { startDate: 'asc' },
        });
    }

    public async findById(id: string): Promise<PeakSeason | null> {
        return prisma.peakSeason.findUnique({ where: { id } });
    }

    public async update(id: string, data: Prisma.PeakSeasonUncheckedUpdateInput): Promise<PeakSeason> {
        return prisma.peakSeason.update({
            where: { id },
            data,
        });
    }

    public async delete(id: string): Promise<PeakSeason> {
        return prisma.peakSeason.delete({ where: { id } });
    }
}

export default new PeakSeasonRepository();