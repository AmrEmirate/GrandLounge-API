import { Router } from "express";
import { CancelOrderControllers } from "../controllers/CancelOrder.controller";
import { verifyToken } from "../middleware/verifyToken";
import { isUser } from "../middleware/isUser";

export default class CancelOrderRouter {
    private router: Router;
    private cancelOrderControllers: CancelOrderControllers;

    constructor() {
        this.router = Router();
        this.cancelOrderControllers = new CancelOrderControllers();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.patch(
            "/cancel/:id",
            verifyToken,
            isUser,
            this.cancelOrderControllers.cancelOrder
        )
    }

    public getRouter(): Router {
        return this.router;
    }
}