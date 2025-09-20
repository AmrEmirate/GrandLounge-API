import { prisma } from "../config/prisma";
import { BookingStatus, Prisma } from "../generated/prisma";

export default class ReportRepositori {

    // Helper function untuk membuat klausa 'where' yang konsisten
    private createReportWhereClause(tenantId: string, startDate?: Date, endDate?: Date): Prisma.BookingWhereInput {
        const where: Prisma.BookingWhereInput = {
            status: BookingStatus.SELESAI,
            property: { tenantId }
        };

        if (startDate && endDate) {
            // Menggunakan logika UTC yang sudah terbukti berhasil
            const start = new Date(Date.UTC(
                startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate(), 0, 0, 0, 0
            ));
            const end = new Date(Date.UTC(
                endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate() + 1, 0, 0, 0, 0
            ));

            where.checkIn = {
                gte: start,
                lt: end
            };
        }
        return where;
    }

    async getTenantStats(tenantId: string) {
        // Logika ini sudah benar, jadi tidak perlu diubah
        const totalRevenue = await prisma.booking.aggregate({
            _sum: { totalPrice: true },
            where: {
                property: { tenantId },
                status: BookingStatus.SELESAI,
            },
        });
        const totalBookings = await prisma.booking.count({
            where: {
                property: { tenantId },
                status: { in: [BookingStatus.SELESAI, BookingStatus.DIPROSES] },
            },
        });
        const totalRooms = await prisma.room.count({
            where: { property: { tenantId }, deletedAt: null }
        });
        const occupancyRate = totalRooms > 0 ? (totalBookings / (totalRooms * 30)) * 100 : 0;
        return {
            totalRevenue: totalRevenue._sum?.totalPrice || 0,
            totalBookings: totalBookings,
            occupancyRate: occupancyRate,
            totalRooms: totalRooms,
        };
    }

    async getAggregateSales(tenantId: string, startDate?: Date, endDate?: Date) {
        const whereClause = this.createReportWhereClause(tenantId, startDate, endDate);
        return prisma.booking.aggregate({
            _sum: { totalPrice: true },
            where: whereClause
        });
    }

    async getSalesByProperty(tenantId: string, startDate?: Date, endDate?: Date, sortBy?: any) {
        const whereClause = this.createReportWhereClause(tenantId, startDate, endDate);
        const groupedSales = await prisma.booking.groupBy({
            by: ['propertyId'],
            where: whereClause,
            _sum: { totalPrice: true },
        });

        const propertyIds = groupedSales.map(g => g.propertyId);
        const properties = await prisma.property.findMany({
            where: { id: { in: propertyIds } },
            select: { id: true, name: true }
        });
        const propertyMap = new Map(properties.map(p => [p.id, p.name]));
        return groupedSales.map(item => ({
            name: propertyMap.get(item.propertyId) || 'Unknown Property',
            total: item._sum.totalPrice
        }));
    }

    async getSalesByUser(tenantId: string, startDate?: Date, endDate?: Date, sortBy: string = "total") {
        const whereClause = this.createReportWhereClause(tenantId, startDate, endDate);
        const groupedSales = await prisma.booking.groupBy({
            by: ['userId'],
            where: whereClause,
            _sum: { totalPrice: true },
        });

        const userIds = groupedSales.map(g => g.userId);
        const users = await prisma.user.findMany({
            where: { id: { in: userIds } },
            select: { id: true, fullName: true }
        });
        const userMap = new Map(users.map(u => [u.id, u.fullName]));
        const result = groupedSales.map(item => ({
            name: userMap.get(item.userId) || 'Unknown User',
            total: item._sum.totalPrice
        }));

        if (sortBy === 'total') {
            result.sort((a, b) => (b.total || 0) - (a.total || 0));
        }
        return result;
    }

    async getSalesByDay(tenantId: string, startDate: Date, endDate: Date) {
        const whereClause = this.createReportWhereClause(tenantId, startDate, endDate);

        // Menggunakan query mentah untuk mengelompokkan berdasarkan tanggal dari 'checkIn'
        const result: { day: Date, sum: number }[] = await prisma.$queryRaw`
            SELECT 
                DATE(b."checkIn" AT TIME ZONE 'UTC') as day,
                SUM(b."totalPrice") as sum
            FROM "Booking" b
            WHERE b.id IN (
                SELECT id FROM "Booking"
                WHERE ${Prisma.sql`"propertyId" IN (SELECT id FROM "Property" WHERE "tenantId" = ${tenantId})`}
                AND ${Prisma.sql`"status" = 'SELESAI'::"BookingStatus"`}
                AND ${Prisma.sql`"checkIn" >= ${startDate}`}
                AND ${Prisma.sql`"checkIn" < ${endDate}`}
            )
            GROUP BY day
            ORDER BY day ASC;
        `;

        return result.map(item => ({
            date: item.day,
            total: Number(item.sum) 
        }));
    }
}