import { Router } from "express";
import { createReservationController, getResevationByIdController, getUserReservationsController, updateReservationStatusController } from "../controllers/RoomReservation.controller";

export default class RoomReservationRouter {
    private router: Router;

    constructor() {
        this.router = Router();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Buat pesanan baru
        this.router.post("/", createReservationController);
        this.router.get("reservations", getUserReservationsController);
        this.router.get("/:id", getResevationByIdController);
        this.router.patch("/:id/status", updateReservationStatusController);
        
    }

    public getRouter(): Router {
        return this.router;
    }
}
