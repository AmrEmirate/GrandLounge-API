import { prisma } from "../config/prisma";
import { BookingStatus } from "../generated/prisma";

export default class ReportRepositori {
    async getAggregateSales(tenantId: number, startDate?: Date, endDate?: Date) {
        let whereClause: any = {
            status: BookingStatus.SELESAI,
            property: { tenantId: tenantId }
        };

        if (startDate && endDate) {
            whereClause.createdAt = {
                gte: startDate,
                lte: endDate
            }
        };

        return prisma.booking.aggregate({
            _sum: { totalPrice: true },
            where: whereClause
        });
    }

    async getSalesByProperty(tenantId: number, startDate?: Date, endDate?: Date) {
        let whereClause: any = {
            status: BookingStatus.SELESAI,
            property: { tenantId: tenantId }
        };

        if (startDate && endDate) {
            whereClause.createdAt = {
                gte: startDate,
                lte: endDate
            }
        };

        return prisma.booking.groupBy({
            by: ['propertyId'],
            _sum: { totalPrice: true },
            where: whereClause,
            orderBy: {
                _sum: {
                    totalPrice: 'desc'
                }
            }
        })
    }

    async getSalesByUser(tenantId: number, startDate?: Date, endDate?: Date) {
        let whereClause: any = {
            status: BookingStatus.SELESAI,
            property: { tenantId: tenantId }
        };

        if (startDate && endDate) {
            whereClause.createdAt = {
                gte: startDate,
                lte: endDate
            }
        };

        return prisma.booking.groupBy({
            by: ['userId'],
            _sum: { totalPrice: true },
            where: whereClause,
            orderBy: {
                _sum: {
                    totalPrice: 'desc'
                }
            }
        });
    }
}