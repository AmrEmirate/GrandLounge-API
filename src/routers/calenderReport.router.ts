import { Router } from "express";
import CalenderReportController from "../controllers/calenderReport.controller";
import { verifyToken, isTenant } from "../middleware/auth.middleware";

class CalenderReportRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(
      "/:propertyId/:roomId",
      verifyToken,
      isTenant,
      CalenderReportController.getAvailabilityReport.bind(
        CalenderReportController
      )
    );
    this.router.get(
      "/property/:propertyId",
      verifyToken,
      isTenant,
      CalenderReportController.getPropertyReport.bind(CalenderReportController)
    );
  }
}

export default new CalenderReportRouter().router;
