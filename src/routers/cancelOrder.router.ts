import { Router } from "express";
import { CancelOrderControllers } from "../controllers/CancelOrder.controller";

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
            this.cancelOrderControllers.cancelOrder
        )
    }

    public getRouter(): Router {
        return this.router;
    }
}