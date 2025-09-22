import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";
import ApiError from "../utils/apiError";

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new ApiError(401, "Authorization header missing or invalid");
        }

        const token = authHeader.split(" ")[1];

        if (!token) {
            throw new ApiError(404, "Token is missing");
        }

        const decodedToken = verify(token, process.env.JWT_SECRET || "fallback_secret");
        
        (req as any).user = decodedToken;
        next();

    } catch (error: any) {
        if (error instanceof ApiError) {
            next(error);
        } else {
            next(new ApiError(401, "Invalid or expired token"));
        }
    }
};