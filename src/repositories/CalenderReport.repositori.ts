import { prisma } from "../config/prisma";

export default class CalenderReportRepositori {
    async getRoomAvailibity(
        tenantId: string,
        propertyId?: string,
        roomId?: string,
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
                    ...(roomId ? { id: roomId } : {}),  
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
