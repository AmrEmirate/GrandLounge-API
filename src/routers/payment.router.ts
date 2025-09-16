import { Router } from 'express';
import PaymentController from '../controllers/Payment.controller';
import { verifyToken } from '../middleware/verifyToken';
import { isUser } from '../middleware/isUser';

export default class PaymentRouter {
    private router: Router;
    private payment: PaymentController;

    constructor() {
        this.router = Router();
        this.payment = new PaymentController();
        this.initializme();
    }

    private initializme(): void {
        this.router.post(
            '/create-transaction',
            verifyToken,
            isUser,
            this.payment.createTransaction
        )
    }

    public getRouter(): Router {
        return this.router;
    }
}

