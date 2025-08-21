import { Router } from "express";
import { OrderReminderController } from "../controllers/OrderReminder.controller";
import { verifyToken } from "../middleware/verifyToken";
import { isTenant } from "../middleware/isTenant";

export default class OrderReminderRouter {
    private router: Router;
    private orderRemind: OrderReminderController;

    constructor() {
        this.router = Router();
        this.orderRemind = new OrderReminderController();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.post(
            "/send-confirm", 
            verifyToken, 
            isTenant, 
            this.orderRemind.sendConfirm
        );
    }

    public getRouter(): Router {
        return this.router;
    }
}