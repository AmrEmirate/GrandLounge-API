import { Router } from "express";
import RoomAvailabilityController from "../controllers/roomAvailability.controller";

class RoomAvailabilityRouter {
  public router: Router;

  constructor() {
    this.router = Router({ mergeParams: true });
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(
      "/",
      RoomAvailabilityController.update.bind(RoomAvailabilityController)
    );
  }
}

export default new RoomAvailabilityRouter().router;
