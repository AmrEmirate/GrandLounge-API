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
const UploadPayment_service_1 = require("../services/UploadPayment.service");
const apiError_1 = __importDefault(require("../utils/apiError"));
class UploadPaymentController {
    uploadPaymentProof(req, res, next) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const invoiceNumber = req.params.invoiceNumber;
                const file = req.file;
                if (!invoiceNumber) {
                    throw new apiError_1.default(400, "Invoice number is required");
                }
                if (!file) {
                    throw new apiError_1.default(400, "File is required");
                }
                yield (0, UploadPayment_service_1.uploadPaymentService)(invoiceNumber, file);
                res.status(200).json({
                    success: true,
                    message: "Payment proof uploaded successfully",
                });
            }
            catch (error) {
                next(error);
            }
        });
    }
}
exports.default = UploadPaymentController;
