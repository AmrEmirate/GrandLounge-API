import { Request, Response, NextFunction } from "express";
import { uploadPaymentService } from "../services/UploadPayment.service";

export const uploadPaymentController = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { transactionId } = req.params;
        const file = req.file;

        if (!transactionId) {
            res.status(400).json({ 
                success: false, 
                message: "Transaction ID is required" });
            return;
        }

        if (!file) {
            res.status(400).json({
                success: false,
                message: "Payment proof is required"
            });
            return;
        }

        await uploadPaymentService(transactionId, file);

        res.status(200).json({ 
            success: true,
            message: "Payment proof uploaded successfully",
        });
    } catch (error: any) {
        if (error.message === "Invalid transaction status") {
            res.status(400).json({ success: false, message: error.message });
        } else if (error.message === "Transaction not found") {
            res.status(404).json({ success: false, message: error.message });
        } else {
            next(error);
        }
    }
};