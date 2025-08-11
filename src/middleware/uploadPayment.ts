import { Request } from 'express';
import multer from 'multer';

export const uploadMemory = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 1 * 1024 * 1024 }, // 1 MB
    fileFilter: (req: Request, file: Express.Multer.File, callback) => {
        const allowedExt = /\.(jpg|png)$/i;
        const allowedMime = ["image/jpeg", "image/png"];
        if (!allowedExt.test(file.originalname.toLowerCase()) || !allowedMime.includes(file.mimetype)) {
            return callback(
                new Error("Only .jpg and .png files are allowed")
            );
        }
        callback(null, true);
    }
})

export const uploadPaymentProof = uploadMemory.single('paymentProof');