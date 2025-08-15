import { Router } from "express";
import RoomReversationController from "../controllers/RoomReservation.controller";

class RoomReservationRouter {
    private router: Router;
    private reservationController: RoomReversationController;

    constructor() {
        this.router = Router();
        this.reservationController = new RoomReversationController();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // Buat pesanan baru
        this.router.post("/", this.reservationController.createReservationController);
        this.router.get("/reservations", this.reservationController.getUserReservationController);
        this.router.get("/:id", this.reservationController.getResevationByIdController);
        this.router.patch("/:id/status", this.reservationController.updateReservationStatusController);

    }

    public getRouter(): Router {
        return this.router;
    }
}

export default RoomReservationRouter;
