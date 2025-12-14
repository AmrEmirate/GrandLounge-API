import { Router } from "express";
import RoomReversationController from "../controllers/roomReservation.controller";
import { verifyToken, isUser, isTenant } from "../middleware/auth.middleware";
import { validate, ReservationValidator } from "../middleware/validators";

class RoomReservationRouter {
  private router: Router;
  private reservationController: RoomReversationController;

  constructor() {
    this.router = Router();
    this.reservationController = new RoomReversationController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      "/check-available",
      verifyToken,
      isUser,
      this.reservationController.checkAvailableRoomsController
    );
    this.router.post(
      "/by-room-name",
      verifyToken,
      isUser,
      validate(ReservationValidator.create),
      this.reservationController.createReservationByRoomNameController
    );
    this.router.get(
      "/reservations",
      verifyToken,
      isUser,
      this.reservationController.getUserReservationController
    );
    this.router.get(
      "/by-room-name/:name",
      verifyToken,
      isUser,
      this.reservationController.getReservationByRoomNameController
    );
    this.router.patch(
      "/:id/status",
      verifyToken,
      isTenant,
      this.reservationController.updateReservationStatusController
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}

export default RoomReservationRouter;
