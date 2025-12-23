import { Router } from "express";
import RoomReversationController from "../controllers/roomReservation.controller";
import { verifyToken, isUser, isTenant } from "../middleware/auth.middleware";
import { validate, ReservationValidator } from "../middleware/validators";

class RoomReservationRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      "/check-available",
      verifyToken,
      isUser,
      RoomReversationController.checkAvailableRoomsController.bind(
        RoomReversationController
      )
    );
    this.router.post(
      "/by-room-name",
      verifyToken,
      isUser,
      validate(ReservationValidator.create),
      RoomReversationController.createReservationByRoomNameController.bind(
        RoomReversationController
      )
    );
    this.router.post(
      "/",
      verifyToken,
      isUser,
      // validate(ReservationValidator.create), // Optional: Reuse validator if payload matches or create new one
      RoomReversationController.createReservationController.bind(
        RoomReversationController
      )
    );
    this.router.get(
      "/reservations",
      verifyToken,
      isUser,
      RoomReversationController.getUserReservationController.bind(
        RoomReversationController
      )
    );
    this.router.get(
      "/by-room-name/:name",
      verifyToken,
      isUser,
      RoomReversationController.getReservationByRoomNameController.bind(
        RoomReversationController
      )
    );
    this.router.patch(
      "/:id/status",
      verifyToken,
      isTenant,
      RoomReversationController.updateReservationStatusController.bind(
        RoomReversationController
      )
    );
  }
}

export default new RoomReservationRouter().router;
