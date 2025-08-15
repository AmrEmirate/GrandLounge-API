import { Router } from "express";
import passport from 'passport';
import OrderListController from "../controllers/OrderList.controller";

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
            this.OrderList.orderList
        )
    }

    public getRouter(): Router {
        return this.router;
    }
}