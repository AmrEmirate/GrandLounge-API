import { Router } from "express";
import passport from 'passport';
import OrderListController from "../controllers/OrderList.controller";
import { verifyToken } from "../middleware/verifyToken";
import { isUser } from "../middleware/isUser";
import { isTenant } from "../middleware/auth.middleware";

export default class OrderListRouter {
    private router: Router;
    private OrderList: OrderListController;

    constructor() {
        this.router = Router();
        this.OrderList = new OrderListController();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.use(passport.authenticate('jwt', { session: false }));

        this.router.get(
            '/order-list',
            verifyToken,
            isUser,
            this.OrderList.orderList
        )
        
        this.router.get(
            '/tenant-transaction-list',
            verifyToken,
            isTenant,
            this.OrderList.tenantTransactionList
        )
    }

    public getRouter(): Router {
        return this.router;
    }
}