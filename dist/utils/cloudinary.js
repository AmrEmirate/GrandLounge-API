"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadToCloudinary = void 0;
const cloudinary_1 = __importDefault(require("../config/cloudinary"));
const streamifier_1 = __importDefault(require("streamifier"));
const uploadToCloudinary = (buffer, folder) => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.default.uploader.upload_stream({ folder: folder }, (error, result) => {
            if (error) {
                return reject(error);
            }
            resolve(result);
        });
        streamifier_1.default.createReadStream(buffer).pipe(uploadStream);
    });
};
exports.uploadToCloudinary = uploadToCloudinary;
