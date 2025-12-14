import { Router } from "express";
import { CalenderReportController } from "../controllers/calenderReport.controller";
import { verifyToken, isTenant } from "../middleware/auth.middleware";

export default class CalenderReportRouter {
  private router: Router;
  private calenderReport: CalenderReportController;

  constructor() {
    this.router = Router();
    this.calenderReport = new CalenderReportController();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      "/:propertyId/:roomId",
      verifyToken,
      isTenant,
      this.calenderReport.getAvailabilityReport
    );
    this.router.get(
      "/property/:propertyId",
      verifyToken,
      isTenant,
      this.calenderReport.getPropertyReport
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
