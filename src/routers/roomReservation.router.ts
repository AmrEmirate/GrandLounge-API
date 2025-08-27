import { Router } from "express";
import RoomReversationController from "../controllers/RoomReservation.controller";
import { isUser } from "../middleware/isUser";
import { verifyToken } from "../middleware/verifyToken";
import { isTenant } from "../middleware/isTenant";

class RoomReservationRouter {
    private router: Router;
    private reservationController: RoomReversationController;

    constructor() {
        this.router = Router();
        this.reservationController = new RoomReversationController();
        this.initializeRoutes();
    }

    private initializeRoutes() {
        // User melihat available room
        this.router.post("/check-available", verifyToken, isUser, this.reservationController.checkAvailableRoomsController);
        
        // User membuat reservasi baru
        this.router.post("/", verifyToken, isUser, this.reservationController.createReservationController);

        // User melihat semua reservasi miliknya
        this.router.get("/reservations", verifyToken, isUser, this.reservationController.getUserReservationController);

        // User melihat detail reservasi by ID
        this.router.get("/:id", verifyToken, isUser, this.reservationController.getReservationByIdController);

        // Tenant update status reservasi
        this.router.patch("/:id/status", verifyToken, isTenant, this.reservationController.updateReservationStatusController);
    }

    public getRouter(): Router {
        return this.router;
    }
}

export default RoomReservationRouter;
