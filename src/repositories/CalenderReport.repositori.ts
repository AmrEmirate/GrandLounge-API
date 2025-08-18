import { prisma } from "../config/prisma";

export default class CalenderReportRepositori {
    async getRoomAvailibity(
        tenantId: number,
        propertyId: number,
        startDate: Date,
        endDate: Date
    ) {
        return prisma.roomAvailability.findMany({
            where: {
                date: {
                    gte: startDate,
                    lte: endDate
                },
                room: {
                    propertyId: propertyId,
                    property: {
                        tenantId: tenantId
                    },
                },
            },
            include: {
                room: {
                    select: {
                        id: true,
                        name: true
                    },
                },
            },
            orderBy: {
                date: 'asc'
            },
        });
    }
}