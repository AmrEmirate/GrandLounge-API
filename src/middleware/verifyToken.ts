import { NextFunction, Request, Response } from "express";
import logger from "../utils/logger";
import { JwtPayload, verify } from "jsonwebtoken"
import ApiError from "../utils/apiError";

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new ApiError(401, "Authorization header missing or invalid");
        }

        const token = req.headers.authorization?.split(" ")[1];
        console.log("TOKEN:", token);
        console.log("SECRET:", process.env.JWT_SECRET);

        logger.info("Token:", token);

        if (!token) {
            throw new ApiError(404, "Token is missing");
        }

        const checkToken = verify(token, process.env.JWT_SECRET || "fallback_secret")
        console.log("Decoded token:", checkToken);

        (req as any).user = checkToken;

        // jika token tidak valid, akan di lempar error
        res.locals.descript = checkToken as JwtPayload;
        next();

    } catch (error: any) {
        if (error instanceof ApiError) {
            next(error)
        } else {
            res.status(500).send(error)
        }
    }
}