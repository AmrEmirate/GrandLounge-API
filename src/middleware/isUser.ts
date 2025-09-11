import { Request, Response, NextFunction } from "express";

export const isUser = (
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    const user = (req as any).user;
    if (!user) {
        res.status(403).send({
            success: false,
            message: "No user found in token"
        });
        return;
    }

    if (user.role !== "USER") {
        res.status(403).send({
            success: false,
            message: `Access denied: Role is ${user.role}, expected CUSTOMER`
        });
        return;
    }

    next();
}