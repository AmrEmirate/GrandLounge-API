import { Request, Response, NextFunction } from "express";
import { getCalenderReport } from "../services/CalenderReport.service";
import ApiError from "../utils/apiError";

export class CalenderReportController {
    public async getAvailabilityReport(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const user = req.user as any;
            const tenantId = user.tenant?.id;

            if (!tenantId) {
                throw new ApiError(403, "Tenant data not found for this user.");
            }

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
}