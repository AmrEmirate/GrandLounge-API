"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CalenderReport_controller_1 = require("../controllers/CalenderReport.controller");
const verifyToken_1 = require("../middleware/verifyToken");
const isTenant_1 = require("../middleware/isTenant");
class CalenderReportRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.calenderReport = new CalenderReport_controller_1.CalenderReportController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/:propertyId/:roomId", verifyToken_1.verifyToken, isTenant_1.isTenant, this.calenderReport.getAvailabilityReport);
        this.router.get("/property/:propertyId", verifyToken_1.verifyToken, isTenant_1.isTenant, this.calenderReport.getPropertyReport);
    }
    getRouter() {
        return this.router;
    }
}
exports.default = CalenderReportRouter;
