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

        const bookings = await prisma.booking.findMany({
            where: whereClause,
            include: { user: true },
            orderBy: sortBy === "date" ? { createdAt: "desc" } : { totalPrice: "desc" }
        });

        // kelompokin manual biar ada userName
        const grouped: Record<string, { userName: string, total: number }> = {};
        for (let b of bookings) {
            if (!grouped[b.userId]) {
                grouped[b.userId] = { userName: b.user.fullName, total: 0 };
            }
            grouped[b.userId].total += b.totalPrice;
        }

        return Object.values(grouped);
    }
}
