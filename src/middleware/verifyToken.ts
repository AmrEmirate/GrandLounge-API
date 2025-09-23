import { NextFunction, Request, Response } from "express";
import { JwtPayload, verify } from "jsonwebtoken";
import ApiError from "../utils/apiError";
import logger from "../utils/logger";

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new ApiError(401, "Authorization header missing or invalid");
        }

        const token = req.headers.authorization?.split(" ")[1];
        console.log("TOKEN:", token);
        console.log("SECRET:", process.env.TOKEN_KEY);

        logger.info("Token:", token);

        if (!token) {
            throw new ApiError(404, "Token is missing");
        }

        const checkToken = verify(token, process.env.TOKEN_KEY || "fallback_secret")
        console.log("Decoded token:", checkToken);

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