"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadPaymentProof = exports.uploadMemory = void 0;
const multer_1 = __importDefault(require("multer"));
const apiError_1 = __importDefault(require("../utils/apiError"));
exports.uploadMemory = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 1 * 1024 * 1024 }, // 1 MB
    fileFilter: (req, file, callback) => {
        const allowedMimes = ["image/jpeg", "image/png"];
        if (allowedMimes.includes(file.mimetype)) {
            callback(null, true);
        }
        else {
            callback(new apiError_1.default(400, "Invalid file type. Only JPG and PNG are allowed."));
        }
    }
});
exports.uploadPaymentProof = exports.uploadMemory.single('paymentProof');
