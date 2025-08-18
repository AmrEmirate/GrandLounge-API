import { Router } from "express";
import passport from 'passport';
import ConfirmPaymentController from "../controllers/ConfirmPayment.controller";
import { isTenant } from "../middleware/auth.middleware";

export default class ConfirmPaymentRouter {
    private router: Router;
    private confirmPayment: ConfirmPaymentController;

    constructor() {
        this.router = Router();
        this.confirmPayment = new ConfirmPaymentController();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.use(passport.authenticate('jwt', { session: false }));

        this.router.patch(
            '/confirm-payment', 
            passport.authenticate('jwt', { session: false }),
            isTenant,
            this.confirmPayment.confirmPayment.bind(this.confirmPayment) 
          );
    }

    public getRouter(): Router {
        return this.router;
    }
}