import { Router } from "express";
import RoomController from "../controllers/room.controller";
import roomAvailabilityRouter from "./roomAvailability.router";
import { authMiddleware } from "../middleware/auth.middleware";
import { UserRole } from "@prisma/client";
import { validate, RoomValidator } from "../middleware/validators";

class RoomRouter {
  public router: Router;

  constructor() {
    this.router = Router({ mergeParams: true });
    this.initializeRoutes();
  }

  private initializeRoutes() {
    const tenantOnly = authMiddleware([UserRole.TENANT]);

    this.router.get(
      "/:roomId/availability-by-month",
      tenantOnly,
      RoomController.getMonthlyAvailability.bind(RoomController)
    );

    this.router.post(
      "/",
      tenantOnly,
      validate(RoomValidator.create),
      RoomController.create.bind(RoomController)
    );
    this.router.get(
      "/",
      tenantOnly,
      RoomController.getAllByProperty.bind(RoomController)
    );
    this.router.get(
      "/:roomId",
      tenantOnly,
      RoomController.getById.bind(RoomController)
    );
    this.router.patch(
      "/:roomId",
      tenantOnly,
      validate(RoomValidator.update),
      RoomController.update.bind(RoomController)
    );
    this.router.delete(
      "/:roomId",
      tenantOnly,
      RoomController.delete.bind(RoomController)
    );

    this.router.use("/:roomId/availability", roomAvailabilityRouter);
  }
}

export default new RoomRouter().router;
