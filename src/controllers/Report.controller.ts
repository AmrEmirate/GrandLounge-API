import { Request, Response, NextFunction, json } from "express";
import { getSalesByTenant } from "../services/Report.service";

export default class ReportController {
    public async getSalesReport(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const user = req.user as any
            const tenantId = user.id;
            
            const reportData = await getSalesByTenant(tenantId, req.query);

            res.status(200).json({
                success: true,
                message: "Laporan penjualan berhasil diambil.",
                data: reportData
            })
        } catch (error) {
            next(error)
        }
    }
}