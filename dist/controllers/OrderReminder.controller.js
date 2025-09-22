"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderReminderController = void 0;
const apiError_1 = __importDefault(require("../utils/apiError"));
const OrderReminder_service_1 = require("../services/OrderReminder.service");
class OrderReminderController {
    sendConfirm(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { invoiceNumber } = req.body;
                if (!invoiceNumber) {
                    throw new apiError_1.default(400, "Invoice number is required.");
                }
                const result = yield (0, OrderReminder_service_1.sendOrderConfirmationByInvoice)(invoiceNumber);
                res.status(200).json({
                    success: true,
                    message: "Confirmation email sent successfully.",
                    data: result
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.OrderReminderController = OrderReminderController;
