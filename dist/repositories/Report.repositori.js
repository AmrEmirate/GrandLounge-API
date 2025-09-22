"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const prisma_1 = require("../config/prisma");
const prisma_2 = require("../generated/prisma");
class ReportRepositori {
    createReportWhereClause(tenantId, startDate, endDate) {
        const where = {
            status: prisma_2.BookingStatus.SELESAI,
            property: { tenantId }
        };
        if (startDate && endDate) {
            const start = new Date(Date.UTC(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate(), 0, 0, 0, 0));
            const end = new Date(Date.UTC(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate() + 1, 0, 0, 0, 0));
            where.checkIn = {
                gte: start,
                lt: end
            };
        }
        return where;
    }
    getTenantStats(tenantId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            const totalRevenue = yield prisma_1.prisma.booking.aggregate({
                _sum: { totalPrice: true },
                where: {
                    property: { tenantId },
                    status: prisma_2.BookingStatus.SELESAI,
                },
            });
            const totalBookings = yield prisma_1.prisma.booking.count({
                where: {
                    property: { tenantId },
                    status: { in: [prisma_2.BookingStatus.SELESAI, prisma_2.BookingStatus.DIPROSES] },
                },
            });
            const totalRooms = yield prisma_1.prisma.room.count({
                where: { property: { tenantId }, deletedAt: null }
            });
            const occupancyRate = totalRooms > 0 ? (totalBookings / (totalRooms * 30)) * 100 : 0;
            return {
                totalRevenue: ((_a = totalRevenue._sum) === null || _a === void 0 ? void 0 : _a.totalPrice) || 0,
                totalBookings: totalBookings,
                occupancyRate: occupancyRate,
                totalRooms: totalRooms,
            };
        });
    }
    getAggregateSales(tenantId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const whereClause = this.createReportWhereClause(tenantId, startDate, endDate);
            return prisma_1.prisma.booking.aggregate({
                _sum: { totalPrice: true },
                where: whereClause
            });
        });
    }
    getSalesByProperty(tenantId, startDate, endDate, sortBy) {
        return __awaiter(this, void 0, void 0, function* () {
            const whereClause = this.createReportWhereClause(tenantId, startDate, endDate);
            const groupedSales = yield prisma_1.prisma.booking.groupBy({
                by: ['propertyId'],
                where: whereClause,
                _sum: { totalPrice: true },
            });
            const propertyIds = groupedSales.map(g => g.propertyId);
            const properties = yield prisma_1.prisma.property.findMany({
                where: { id: { in: propertyIds } },
                select: { id: true, name: true }
            });
            const propertyMap = new Map(properties.map(p => [p.id, p.name]));
            return groupedSales.map(item => ({
                name: propertyMap.get(item.propertyId) || 'Unknown Property',
                total: item._sum.totalPrice
            }));
        });
    }
    getSalesByUser(tenantId_1, startDate_1, endDate_1) {
        return __awaiter(this, arguments, void 0, function* (tenantId, startDate, endDate, sortBy = "total") {
            const whereClause = this.createReportWhereClause(tenantId, startDate, endDate);
            const groupedSales = yield prisma_1.prisma.booking.groupBy({
                by: ['userId'],
                where: whereClause,
                _sum: { totalPrice: true },
            });
            const userIds = groupedSales.map(g => g.userId);
            const users = yield prisma_1.prisma.user.findMany({
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
        });
    }
    getSalesByDay(tenantId, startDate, endDate) {
        return __awaiter(this, void 0, void 0, function* () {
            const whereClause = this.createReportWhereClause(tenantId, startDate, endDate);
            const result = yield prisma_1.prisma.$queryRaw `
            SELECT 
                DATE(b."checkIn" AT TIME ZONE 'UTC') as day,
                SUM(b."totalPrice") as sum
            FROM "Booking" b
            WHERE b.id IN (
                SELECT id FROM "Booking"
                WHERE ${prisma_2.Prisma.sql `"propertyId" IN (SELECT id FROM "Property" WHERE "tenantId" = ${tenantId})`}
                AND ${prisma_2.Prisma.sql `"status" = 'SELESAI'::"BookingStatus"`}
                AND ${prisma_2.Prisma.sql `"checkIn" >= ${startDate}`}
                AND ${prisma_2.Prisma.sql `"checkIn" < ${endDate}`}
            )
            GROUP BY day
            ORDER BY day ASC;
        `;
            return result.map(item => ({
                date: item.day,
                total: Number(item.sum)
            }));
        });
    }
}
exports.default = ReportRepositori;
