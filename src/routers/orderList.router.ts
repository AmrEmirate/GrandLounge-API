import { Router } from "express";
import passport from 'passport';
import { OrderListController } from "../controllers/OrderList.controller";

export default class OrderListRouter {
    private router: Router;

    constructor() {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        this.router.use(passport.authenticate('jwt', { session: false }));

        this.router.get(
            '/order-list',
            OrderListController
        )
    }

    public getRouter(): Router {
        return this.router;
    }
}