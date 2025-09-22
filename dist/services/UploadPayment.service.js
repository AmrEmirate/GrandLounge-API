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
exports.uploadPaymentService = void 0;
const prisma_1 = require("../config/prisma");
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const UploadPayment_repositori_1 = require("../repositories/UploadPayment.repositori");
const streamifier_1 = __importDefault(require("streamifier"));
const apiError_1 = __importDefault(require("../utils/apiError"));
const uploadRepo = new UploadPayment_repositori_1.UploadPaymentRepository();
const uploadPaymentService = (invoiceNumber, file) => __awaiter(void 0, void 0, void 0, function* () {
    if (!file) {
        throw new Error("File is required");
    }
    const transaction = yield prisma_1.prisma.booking.findUnique({ where: { invoiceNumber } });
    if (!transaction || transaction.status !== "MENUNGGU_PEMBAYARAN") {
        throw new Error("Invalid transaction status");
    }
    const oneHour = 60 * 60 * 1000; // 1 jam dalam milidetik
    const bookingTime = new Date(transaction.createdAt).getTime();
    const currentTime = new Date().getTime();
    if (currentTime - bookingTime > oneHour) {
        // Jika sudah lebih dari 1 jam, langsung batalkan booking dan lempar error
        yield prisma_1.prisma.booking.update({
            where: { invoiceNumber },
            data: { status: 'DIBATALKAN' },
        });
        throw new apiError_1.default(400, 'Payment time has expired. This booking has been cancelled.');
    }
    if (transaction.status !== "MENUNGGU_PEMBAYARAN") {
        throw new apiError_1.default(400, "Invalid transaction status. Payment might have been processed or cancelled.");
    }
    const uploadResult = yield new Promise((resolve, reject) => {
        const stream = cloudinary_1.default.uploader.upload_stream({ folder: "payment_proofs" }, (error, result) => {
            if (error) {
                reject(error);
            }
            else {
                resolve(result);
            }
        });
        streamifier_1.default.createReadStream(file.buffer).pipe(stream);
    });
    return uploadRepo.updatePaymentProof(invoiceNumber, uploadResult.secure_url);
});
exports.uploadPaymentService = uploadPaymentService;
