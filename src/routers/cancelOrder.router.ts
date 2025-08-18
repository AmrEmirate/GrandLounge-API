import { Router } from "express";
import { CancelOrderControllers } from "../controllers/CancelOrder.controller";
import { verifyToken } from "../middleware/verifyToken";
import { isUser } from "../middleware/isUser";
import { isTenant } from "../middleware/isTenant";

export default class CancelOrderRouter {
    private router: Router;
    private cancelOrderControllers: CancelOrderControllers;

    constructor() {
        this.router = Router();
        this.cancelOrderControllers = new CancelOrderControllers();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Endpoint untuk pembatalan oleh User
        this.router.patch(
            "/user/cancel/:id",
            verifyToken,
            isUser,
            this.cancelOrderControllers.cancelOrder
        );

        // Endpoint untuk pembatalan oleh Tenant
        this.router.patch(
            "/tenant/cancel/:id",
            verifyToken,
            isTenant,
            this.cancelOrderControllers.cancelOrder
        );
    }

    public getRouter(): Router {
        return this.router;
    }
}