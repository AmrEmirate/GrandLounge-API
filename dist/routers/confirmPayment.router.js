"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const ConfirmPayment_controller_1 = __importDefault(require("../controllers/ConfirmPayment.controller"));
const isTenant_1 = require("../middleware/isTenant");
const verifyToken_1 = require("../middleware/verifyToken");
class ConfirmPaymentRouter {
    constructor() {
        this.router = (0, express_1.Router)();
        this.confirmPayment = new ConfirmPayment_controller_1.default();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.patch('/confirm/:invoiceNumber', verifyToken_1.verifyToken, isTenant_1.isTenant, this.confirmPayment.confirmPayment);
    }
    getRouter() {
        return this.router;
    }
}
exports.default = ConfirmPaymentRouter;
