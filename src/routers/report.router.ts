import { Router } from "express";
import ReportController from "../controllers/Report.controller";
import { verifyToken } from "../middleware/verifyToken";
import { isTenant } from "../middleware/isTenant";

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
        )
    }

    public getRouter(): Router {
        return this.router;
    }
}