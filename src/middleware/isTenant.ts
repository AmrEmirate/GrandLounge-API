import { NextFunction, Request, Response } from "express";
import ApiError from "../utils/apiError";
import { AuthRequest } from "./auth.middleware"; 
import { prisma } from "../config/prisma";

// Gunakan tipe AuthRequest agar TypeScript mengenali req.user
export const isTenant = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.user;

        if (!user || user.role !== 'TENANT') {
            return next(new ApiError(403, "Forbidden: Access is restricted to tenants."));
        }

        // 🛠️ PERBAIKAN KUNCI: Ambil data tenant dari database
        const tenant = await prisma.tenant.findUnique({
            where: {
                userId: user.id
            }
        });

        // Jika karena suatu alasan profil tenant tidak ditemukan
        if (!tenant) {
            return next(new ApiError(403, "Forbidden: Tenant profile not found for this user."));
        }

        // Simpan informasi tenant yang sudah diambil ke dalam req.user
        // agar bisa diakses oleh controller
        req.user.tenant = tenant;

        // Lanjutkan ke controller
        next();
    } catch (error) {
        next(new ApiError(500, "Internal server error during tenant verification."));
    }
};