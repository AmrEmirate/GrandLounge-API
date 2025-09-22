"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const OrderReminder_controller_1 = require("../controllers/OrderReminder.controller");
const verifyToken_1 = require("../middleware/verifyToken");
const isTenant_1 = require("../middleware/isTenant");
class OrderReminderRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.orderRemind = new OrderReminder_controller_1.OrderReminderController();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/send-confirm-invoice", verifyToken_1.verifyToken, isTenant_1.isTenant, this.orderRemind.sendConfirm);
    }
    getRouter() {
        return this.router;
    }
}
exports.default = OrderReminderRouter;
