"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Report_controller_1 = __importDefault(require("../controllers/Report.controller"));
const verifyToken_1 = require("../middleware/verifyToken");
const isTenant_1 = require("../middleware/isTenant");
class ReportRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.report = new Report_controller_1.default();
        this.initializme();
    }
    initializme() {
        this.router.get("/sales", verifyToken_1.verifyToken, isTenant_1.isTenant, this.report.getSalesReport);
        this.router.get("/stats", verifyToken_1.verifyToken, isTenant_1.isTenant, this.report.getStatsReport);
        this.router.get("/widgets", verifyToken_1.verifyToken, isTenant_1.isTenant, this.report.getDashboardWidgetData);
    }
    getRouter() {
        return this.router;
    }
}
exports.default = ReportRouter;
