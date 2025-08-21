import { prisma } from "../config/prisma";
import { BookingStatus } from "../generated/prisma";

export default class ReportRepositori {
    async getAggregateSales(tenantId: number, startDate?: Date, endDate?: Date) {
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

    async getSalesByProperty(tenantId: number, startDate?: Date, endDate?: Date, sortBy: string = "total") {
        let whereClause: any = {
            status: BookingStatus.SELESAI,
            property: { tenantId }
        };

        if (startDate && endDate) {
            whereClause.createdAt = { gte: startDate, lte: endDate };
        }

        const bookings = await prisma.booking.findMany({
            where: whereClause,
            include: { property: true },
            orderBy: sortBy === "date" ? { createdAt: "desc" } : { totalPrice: "desc" }
        });

        // kelompokin manual biar ada propertyName
        const grouped: Record<number, { propertyName: string, total: number }> = {};
        for (let b of bookings) {
            if (!grouped[b.propertyId]) {
                grouped[b.propertyId] = { propertyName: b.property.name, total: 0 };
            }
            grouped[b.propertyId].total += b.totalPrice;
        }

        return Object.values(grouped);
    }

    async getSalesByUser(tenantId: number, startDate?: Date, endDate?: Date, sortBy: string = "total") {
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
        const grouped: Record<number, { userName: string, total: number }> = {};
        for (let b of bookings) {
            if (!grouped[b.userId]) {
                grouped[b.userId] = { userName: b.user.fullName, total: 0 };
            }
            grouped[b.userId].total += b.totalPrice;
        }

        return Object.values(grouped);
    }
}
