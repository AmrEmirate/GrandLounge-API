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
      RoomController.getMonthlyAvailability
    );

    this.router.post(
      "/",
      tenantOnly,
      validate(RoomValidator.create),
      RoomController.create
    );
    this.router.get("/", tenantOnly, RoomController.getAllByProperty);
    this.router.get("/:roomId", tenantOnly, RoomController.getById);
    this.router.patch(
      "/:roomId",
      tenantOnly,
      validate(RoomValidator.update),
      RoomController.update
    );
    this.router.delete("/:roomId", tenantOnly, RoomController.delete);

    this.router.use("/:roomId/availability", roomAvailabilityRouter);
  }
}

export default new RoomRouter().router;
