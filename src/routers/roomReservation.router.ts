import { Router } from "express";
import RoomReversationController from "../controllers/RoomReservation.controller";
import { isUser } from "../middleware/isUser";
import { verifyToken } from "../middleware/verifyToken";

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
        this.router.post
            ("/",
                verifyToken,
                isUser,
                this.reservationController.createReservationController);

        this.router.get
            ("/reservations",
                verifyToken,
                isUser,
                this.reservationController.getUserReservationController);

        this.router.get
            ("/:id",
                verifyToken,
                isUser,
                this.reservationController.getResevationByIdController);
                
        this.router.patch
            ("/:id/status", 
                verifyToken,
                isUser,
                this.reservationController.updateReservationStatusController);

    }

    public getRouter(): Router {
        return this.router;
    }
}

export default RoomReservationRouter;
