import { Request, Response, NextFunction } from "express";
import { uploadPaymentService } from "../services/UploadPayment.service";
import ApiError from "../utils/apiError";

class UploadPaymentController {
    public async uploadPaymentProof(
        req: Request,
        res: Response,
        next: NextFunction
    ): Promise<void> {
        try {
            const transactionId = Number(req.params.transactionId);
            const file = req.file;

            if (!transactionId) {
                throw new ApiError(400, "Transaction ID is required");
            }

            if (!file) {
                throw new ApiError(400, "File is required")
            }

            await uploadPaymentService(transactionId, file);

            res.status(200).json({
                success: true,
                message: "Payment proof uploaded successfully",
            });
        } catch (error: any) {
            next(error);
        }
    }
}

export default UploadPaymentController;