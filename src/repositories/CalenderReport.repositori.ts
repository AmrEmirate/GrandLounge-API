import { prisma } from "../config/prisma";

export default class CalenderReportRepositori {
    async getRoomAvailibity(
        tenantId: number,
        propertyId?: number,
        startDate?: Date,
        endDate?: Date
    ) {
        return prisma.roomAvailability.findMany({
            where: {
                date: startDate && endDate ? {
                    gte: startDate,
                    lte: endDate
                } : undefined,
                room: {
                    property: {
                        tenantId: tenantId,
                        ...(propertyId ? { id: propertyId } : {}), 
                    },
                },
            },
            include: {
                room: {
                    select: {
                        id: true,
                        name: true,
                        property: {
                            select: {
                                id: true,
                                name: true,
                            }
                        }
                    },
                },
            },
            orderBy: {
                date: 'asc'
            },
        });
    }
}
