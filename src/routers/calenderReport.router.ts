import { Router } from "express";
import { CalenderReportController } from "../controllers/CalenderReport.controller";
import { verifyToken } from "../middleware/verifyToken";
import { isTenant } from "../middleware/isTenant";

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
        )
    }

    public getRouter(): Router {
        return this.router;
    }
}