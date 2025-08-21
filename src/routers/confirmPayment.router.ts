import { Router } from "express";
import ConfirmPaymentController from "../controllers/ConfirmPayment.controller";
import { isTenant } from "../middleware/isTenant";
import { verifyToken } from "../middleware/verifyToken";

export default class ConfirmPaymentRouter {
    private router: Router;
    private confirmPayment: ConfirmPaymentController;

    constructor() {
        this.router = Router();
        this.confirmPayment = new ConfirmPaymentController();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.patch(
            '/confirm/:bookingId', 
            verifyToken,
            isTenant,
            this.confirmPayment.confirmPayment 
          );
    }

    public getRouter(): Router {
        return this.router;
    }
}