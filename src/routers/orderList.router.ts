import { Router } from "express";
import passport from 'passport';
import OrderListController from "../controllers/OrderList.controller";
import { verifyToken } from "../middleware/verifyToken";
import { isUser } from "../middleware/isUser";
import { isTenant } from "../middleware/isTenant";

export default class OrderListRouter {
    private router: Router;
    private orderList: OrderListController;

    constructor() {
        this.router = Router();
        this.orderList = new OrderListController();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.get(
            '/order-list',
            verifyToken,
            isUser,
            this.orderList.orderList
        );

        this.router.get(
            '/tenant-transaction-list',
            verifyToken,
            isTenant,
            this.orderList.tenantTransactionList
        );
    };

    public getRouter(): Router {
        return this.router;
    }
}