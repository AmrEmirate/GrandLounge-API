"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const UploadPayment_Controller_1 = __importDefault(require("../controllers/UploadPayment.Controller"));
const verifyToken_1 = require("../middleware/verifyToken");
const isUser_1 = require("../middleware/isUser");
const uploadPayment_1 = require("../middleware/uploadPayment");
class UploadPaymentRouter {
    constructor() {
        this.uploadPaymentController = new UploadPayment_Controller_1.default();
        this.router = (0, express_1.Router)();
        this.initialRoutes();
    }
    initialRoutes() {
        this.router.post("/:invoiceNumber", verifyToken_1.verifyToken, isUser_1.isUser, uploadPayment_1.uploadPaymentProof, this.uploadPaymentController.uploadPaymentProof);
    }
    getRouter() {
        return this.router;
    }
}
exports.default = UploadPaymentRouter;
