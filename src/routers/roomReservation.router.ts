import { Router } from "express";
import { createReservationController } from "../controllers/RoomReservation.controller";

export default class RoomReservationRouter {
    private router: Router;

    constructor() {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Buat pesanan baru
        this.router.post("/", createReservationController);
    }

    public getRouter(): Router {
        return this.router;
    }
}
