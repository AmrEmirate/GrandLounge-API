import { NextFunction, Request, Response } from "express";

export const isTenant = (req: Request, res: Response, next: NextFunction): void => {
    const user = res.locals.descript;

    if (!user || user.role !== "TENANT") {
        res.status(403).send({
            success: false,
            message: "Access denied: Organizer only."
        });
        return;
    }

    next();
};