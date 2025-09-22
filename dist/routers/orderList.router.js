"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const OrderList_controller_1 = __importDefault(require("../controllers/OrderList.controller"));
const verifyToken_1 = require("../middleware/verifyToken");
const isUser_1 = require("../middleware/isUser");
const isTenant_1 = require("../middleware/isTenant");
class OrderListRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.orderList = new OrderList_controller_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/order-list", verifyToken_1.verifyToken, isUser_1.isUser, this.orderList.orderList);
        this.router.get("/tenant-transactions/pending", verifyToken_1.verifyToken, isTenant_1.isTenant, this.orderList.pendingConfirmationList);
        this.router.patch("/:bookingId/complete", verifyToken_1.verifyToken, isUser_1.isUser, this.orderList.completeOrder);
        this.router.get("/tenant-transactions", verifyToken_1.verifyToken, isTenant_1.isTenant, this.orderList.tenantTransactionList);
    }
    getRouter() {
        return this.router;
    }
}
exports.default = OrderListRouter;
