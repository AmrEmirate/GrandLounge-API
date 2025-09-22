"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const CancelOrder_controller_1 = require("../controllers/CancelOrder.controller");
const verifyToken_1 = require("../middleware/verifyToken");
const isUser_1 = require("../middleware/isUser");
const isTenant_1 = require("../middleware/isTenant");
class CancelOrderRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.cancelOrderControllers = new CancelOrder_controller_1.CancelOrderControllers();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.patch("/user/cancel/invoice/:invoice", verifyToken_1.verifyToken, isUser_1.isUser, this.cancelOrderControllers.cancelOrder);
        this.router.patch("/tenant/cancel/invoice/:invoice", verifyToken_1.verifyToken, isTenant_1.isTenant, this.cancelOrderControllers.cancelOrder);
    }
    getRouter() {
        return this.router;
    }
}
exports.default = CancelOrderRouter;
