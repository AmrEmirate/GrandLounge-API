// src/middleware/isTenant.ts

import { NextFunction, Request, Response } from "express";
import { AuthRequest } from "./auth.middleware"; // Impor tipe AuthRequest

// Gunakan tipe AuthRequest agar TypeScript mengenali req.user
export const isTenant = (req: AuthRequest, res: Response, next: NextFunction): void => {
    // Ambil data user dari `req.user` yang sudah di-set oleh authMiddleware
    const user = req.user;

    if (!user || user.role !== "TENANT") {
        res.status(403).send({
            success: false,
            message: "Access denied: Tenant role required."
        });
        return;
    }

    next();
};