import { Request, Response, NextFunction, json } from "express";
import ReportService from "../services/report.service";
import ApiError from "../utils/apiError";
import { prisma } from "../config/prisma";
import ReportRepositori from "../repositories/report.repository";

// Repository is imported as instance

class ReportController {
  public async getDashboardWidgetData(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    try {
      const userId = (req.user as any)?.id;
      const tenant = await prisma.tenant.findUnique({ where: { userId } });

      if (!tenant) {
        throw new ApiError(403, "Tenant account not found.");
      }

      const widgetData = await ReportService.getDashboardWidgets(tenant.id);

      res.status(200).json({
        success: true,
        message: "Dashboard widget data fetched successfully.",
        data: widgetData,
      });
    } catch (error) {
      next(error);
    }
  }

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

      const reportData = await ReportService.getSalesByTenant(
        tenant.id,
        req.query
      );

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

      const statsData = await ReportRepositori.getTenantStats(tenant.id);

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

export default new ReportController();
