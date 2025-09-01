import { prisma } from "../config/prisma";
import { BookingStatus } from "../generated/prisma";

export default class ReportRepositori {
    async getAggregateSales(tenantId: string, startDate?: Date, endDate?: Date) {
        let whereClause: any = {
            status: BookingStatus.SELESAI,
            property: { tenantId }
        };

        if (startDate && endDate) {
            whereClause.createdAt = { gte: startDate, lte: endDate };
        }

        return prisma.booking.aggregate({
            _sum: { totalPrice: true },
            where: whereClause
        });
    }

    async getSalesByProperty(tenantId: string, startDate?: Date, endDate?: Date, sortBy?: any) {
        let whereClause: any = {
            status: BookingStatus.SELESAI,
            property: { tenantId }
        };
        if (startDate && endDate) {
            whereClause.createdAt = { gte: startDate, lte: endDate };
        }

        const groupedSales = await prisma.booking.groupBy({
            by: ['propertyId'],
            where: whereClause,
            _sum: {
                totalPrice: true,
            },
        });

        const propertyIds = groupedSales.map(g => g.propertyId);
        const properties = await prisma.property.findMany({
            where: { id: { in: propertyIds } },
            select: { id: true, name: true }
        });
        const propertyMap = new Map(properties.map(p => [p.id, p.name]));

        return groupedSales.map(item => ({
            propertyName: propertyMap.get(item.propertyId),
            total: item._sum.totalPrice
        }));
    }

    async getSalesByUser(tenantId: string, startDate?: Date, endDate?: Date, sortBy: string = "total") {
        let whereClause: any = {
            status: BookingStatus.SELESAI,
            property: { tenantId }
        };

        if (startDate && endDate) {
            whereClause.createdAt = { gte: startDate, lte: endDate };
        }

        const groupedSales = await prisma.booking.groupBy({
            by: ['userId'], // Kelompokkan berdasarkan userId
            where: whereClause,
            _sum: {
                totalPrice: true,
            },
        });

        const userIds = groupedSales.map(g => g.userId);

        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, fullName: true }
        });
        const userMap = new Map(users.map(u => [u.id, u.fullName]));

        const result = groupedSales.map(item => ({
            userName: userMap.get(item.userId) || 'Unknown User',
            total: item._sum.totalPrice
        }));

        if (sortBy === 'total') {
            result.sort((a, b) => (b.total || 0) - (a.total || 0));
        }

        return result;
    }
}
