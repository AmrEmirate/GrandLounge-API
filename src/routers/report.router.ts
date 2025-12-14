import { Router } from "express";
import ReportController from "../controllers/report.controller";
import { verifyToken, isTenant } from "../middleware/auth.middleware";

export default class ReportRouter {
  private router: Router;
  private report: ReportController;

  constructor() {
    this.router = Router();
    this.report = new ReportController();
    this.initializme();
  }

  private initializme(): void {
    this.router.get(
      "/sales",
      verifyToken,
      isTenant,
      this.report.getSalesReport
    );

    this.router.get(
      "/stats",
      verifyToken,
      isTenant,
      this.report.getStatsReport
    );

    this.router.get(
      "/widgets",
      verifyToken,
      isTenant,
      this.report.getDashboardWidgetData
    );
  }

  public getRouter(): Router {
    return this.router;
  }
}
