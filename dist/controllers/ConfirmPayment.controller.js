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
const apiError_1 = __importDefault(require("../utils/apiError"));
const ConfirmPayment_service_1 = require("../services/ConfirmPayment.service");
const prisma_1 = require("../config/prisma");
class ConfirmPaymentController {
    confirmPayment(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId)
                    throw new apiError_1.default(401, "Unauthorized");
                // Ambil tenantId dari database menggunakan userId yang ada di token
                const tenant = yield prisma_1.prisma.tenant.findUnique({
                    where: { userId: userId },
                    select: { id: true },
                });
                if (!tenant) {
                    throw new apiError_1.default(403, "Tenant account not found.");
                }
                const { invoiceNumber } = req.params;
                const { isAccepted } = req.body;
                if (!invoiceNumber || isAccepted === undefined) {
                    throw new apiError_1.default(400, "Invoice number and acceptance status are required.");
                }
                console.log("TenantId dari DB:", tenant.id);
                console.log("InvoiceNumber:", invoiceNumber);
                console.log("isAccepted:", isAccepted);
                const updatedBooking = yield (0, ConfirmPayment_service_1.ConfirmPaymentService)(tenant.id, // Gunakan tenant.id yang benar
                invoiceNumber, isAccepted);
                console.log("Booking property tenantId:", updatedBooking.property.tenantId);
                console.log("Booking status setelah update:", updatedBooking.status);
                res.status(200).json({
                    success: true,
                    message: `Payment has been ${updatedBooking.status === "DIPROSES" ? "confirmed" : "rejected"} successfully.`,
                    data: updatedBooking,
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = ConfirmPaymentController;
