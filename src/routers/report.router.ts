import { Router } from "express";
import ReportController from "../controllers/report.controller";
import { verifyToken, isTenant } from "../middleware/auth.middleware";

class ReportRouter {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.get(
      "/sales",
      verifyToken,
      isTenant,
      ReportController.getSalesReport.bind(ReportController)
    );

    this.router.get(
      "/stats",
      verifyToken,
      isTenant,
      ReportController.getStatsReport.bind(ReportController)
    );

    this.router.get(
      "/widgets",
      verifyToken,
      isTenant,
      ReportController.getDashboardWidgetData.bind(ReportController)
    );
  }
}

export default new ReportRouter().router;
