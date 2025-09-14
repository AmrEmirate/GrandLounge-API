import { Request, Response, NextFunction, json } from "express";
import { getSalesByTenant } from "../services/Report.service";
import ApiError from "../utils/apiError";
import { prisma } from "../config/prisma";
import ReportRepositori from "../repositories/Report.repositori";

const reportRepo = new ReportRepositori(); 

export default class ReportController {
    public async getSalesReport(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = (req.user as any)?.id;

            const tenant = await prisma.tenant.findUnique({
                where: { userId: userId },
                select: { id: true },
            });

            if (!tenant) {
                throw new ApiError(403, "Tenant account not found.");
            }

            const reportData = await getSalesByTenant(tenant.id, req.query); 

            res.status(200).json({
                success: true,
                message: "Laporan penjualan berhasil diambil.",
                data: reportData,
            });
        } catch (error) {
            next(error);
        }
    }

    public async getStatsReport(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const userId = (req.user as any)?.id;
            const tenant = await prisma.tenant.findUnique({
                where: { userId: userId },
                select: { id: true },
            });

            if (!tenant) {
                throw new ApiError(403, "Tenant account not found.");
            }

            const statsData = await reportRepo.getTenantStats(tenant.id);

            res.status(200).json({
                success: true,
                message: "Statistik berhasil diambil.",
                data: statsData,
            });
        } catch (error) {
            next(error);
        }
    }
}