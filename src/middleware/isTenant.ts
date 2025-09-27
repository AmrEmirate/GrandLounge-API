import { NextFunction, Request, Response } from "express";
import ApiError from "../utils/apiError";
import { AuthRequest } from "./auth.middleware"; 
import { prisma } from "../config/prisma";

export const isTenant = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const user = req.user;

        if (!user || user.role !== 'TENANT') {
            return next(new ApiError(403, "Forbidden: Access is restricted to tenants."));
        }

        const tenant = await prisma.tenant.findUnique({
            where: {
                userId: user.id
            }
        });

        if (!tenant) {
            return next(new ApiError(403, "Forbidden: Tenant profile not found for this user."));
        }

        req.user.tenant = tenant;

        next();
    } catch (error) {
        next(new ApiError(500, "Internal server error during tenant verification."));
    }
};