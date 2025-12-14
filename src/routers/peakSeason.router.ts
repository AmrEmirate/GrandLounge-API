import { Router } from "express";
import PeakSeasonController from "../controllers/peakSeason.controller";
import { authMiddleware } from "../middleware/auth.middleware";
import { UserRole } from "@prisma/client";
import { validate, PeakSeasonValidator } from "../middleware/validators";

class PeakSeasonRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    const tenantOnly = authMiddleware([UserRole.TENANT]);

    this.router.get(
      "/by-room/:roomId",
      tenantOnly,
      PeakSeasonController.getByRoom.bind(PeakSeasonController)
    );
    this.router.post(
      "/",
      tenantOnly,
      validate(PeakSeasonValidator.create),
      PeakSeasonController.create.bind(PeakSeasonController)
    );
    this.router.put(
      "/:id",
      tenantOnly,
      validate(PeakSeasonValidator.update),
      PeakSeasonController.update.bind(PeakSeasonController)
    );
    this.router.delete(
      "/:id",
      tenantOnly,
      PeakSeasonController.delete.bind(PeakSeasonController)
    );
  }
}

export default new PeakSeasonRouter().router;
