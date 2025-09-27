import { Request } from 'express';
import multer from 'multer';
import ApiError from '../utils/apiError';

export const uploadMemory = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 1 * 1024 * 1024 },
    fileFilter: (req: Request, file: Express.Multer.File, callback) => {
        const allowedMimes = ["image/jpeg", "image/png"];
        if (allowedMimes.includes(file.mimetype)) {
            callback(null, true);
        } else {
            callback(new ApiError(400, "Invalid file type. Only JPG and PNG are allowed."));
        }
    }
})

export const uploadPaymentProof = uploadMemory.single('paymentProof');