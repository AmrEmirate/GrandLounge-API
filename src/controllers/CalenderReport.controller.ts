import { Request, Response, NextFunction } from "express";
import { getAggregatedPropertyReport, getCalenderReport } from "../services/CalenderReport.service";
import ApiError from "../utils/apiError";
import { prisma } from "../config/prisma";

export class CalenderReportController {
    public async getAvailabilityReport(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            if (!req.user) {
                throw new ApiError(401, "Unauthorized: User not authenticated.");
            }
            
            const userId = req.user.id;
            const tenant = await prisma.tenant.findUnique({
                where: { userId: userId }, // Gunakan userId, bukan seluruh objek user
                select: { id: true }
            });

            if (!tenant) {
                throw new ApiError(403, "Tenant data not found for this user.");
            }
            const tenantId = tenant.id;

            const { propertyId, roomId } = req.params;
            const { startDate, endDate } = req.query;

            if (!startDate || !endDate) {
                throw new ApiError(400, "startDate and endDate are required.");
            }

            const reportData = await getCalenderReport(
                tenantId,
                propertyId as string,
                roomId as string,
                new Date(startDate as string),
                new Date(endDate as string)
            );

            res.status(200).json({
                success: true,
                message: "Laporan ketersediaan properti berhasil diambil.",
                data: reportData
            });
        } catch (error) {
            next(error);
        }
    }

    public async getPropertyReport(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            if (!req.user) {
                throw new ApiError(401, "Unauthorized: User not authenticated.");
            }

            const userId = req.user.id;
            const tenant = await prisma.tenant.findUnique({
                where: { userId: userId }, // Gunakan userId, bukan seluruh objek user
                select: { id: true }
            });

            if (!tenant) {
                throw new ApiError(403, "Tenant data not found for this user.");
            }
            const tenantId = tenant.id;

            const { propertyId } = req.params;
            const { startDate, endDate } = req.query;

            if (!startDate || !endDate) {
                throw new ApiError(400, "startDate and endDate are required.");
            }

            // Panggil service yang benar untuk data agregat
            const reportData = await getAggregatedPropertyReport(
                tenant.id,
                propertyId,
                new Date(startDate as string),
                new Date(endDate as string)
            );

            res.status(200).json({
                success: true,
                message: "Laporan ketersediaan properti berhasil diambil.",
                data: reportData
            });
        } catch (error) {
            next(error);
        }
    }
}